
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ScrollText, Calendar, Clock, FileText, Download } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';

export default function EmployeeWorkHistory() {
    const { data: workResult } = useQuery({
        queryKey: ['my-work'],
        queryFn: () => axios.get('/api/employee/work-submissions', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).then(res => res.data)
    });

    const submissions = workResult?.submissions || [];

    return (
        <DashboardLayout activeRoute="my-work">
            <div className="space-y-8">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tight">Mission Log Archives</h1>
                    <p className="text-muted-foreground text-sm font-medium">Review your historical operational submissions and shift briefings.</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {submissions.map((sub) => (
                        <div key={sub.id} className="bg-card border border-border rounded-3xl p-6 hover:border-primary/20 transition-all group">
                             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                 <div className="flex items-center gap-5">
                                     <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                         <ScrollText className="w-7 h-7" />
                                     </div>
                                     <div>
                                         <div className="flex items-center gap-3 mb-1">
                                             <span className="text-[10px] font-black px-2 py-0.5 bg-muted rounded-full uppercase tracking-widest text-muted-foreground">Session Log</span>
                                             <p className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                                                 <Calendar className="w-3.5 h-3.5" /> {new Date(sub.punch_in_time).toLocaleDateString()}
                                             </p>
                                         </div>
                                         <p className="text-sm font-medium text-foreground leading-relaxed max-w-2xl">
                                             {sub.description}
                                         </p>
                                     </div>
                                 </div>

                                 <div className="flex flex-col items-end gap-2 text-right border-l border-border/50 pl-6 hidden md:flex">
                                     <div className="flex items-center gap-2 text-muted-foreground">
                                         <Clock className="w-3.5 h-3.5" />
                                         <span className="text-[10px] font-bold uppercase tracking-widest">Shift Duration</span>
                                     </div>
                                     <p className="text-lg font-black text-foreground">
                                         {Math.round((new Date(sub.punch_out_time) - new Date(sub.punch_in_time)) / (1000 * 60 * 60))} Hours
                                     </p>
                                 </div>
                             </div>

                             {sub.file_path && (
                                 <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between">
                                     <div className="flex items-center gap-2 text-primary">
                                         <FileText className="w-4 h-4" />
                                         <span className="text-xs font-bold uppercase tracking-widest">Operational Asset Attached</span>
                                     </div>
                                     <a 
                                        href={sub.file_path} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 bg-muted hover:bg-muted/80 text-foreground px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition"
                                     >
                                         <Download className="w-3 h-3" /> Get Asset
                                     </a>
                                 </div>
                             )}
                        </div>
                    ))}

                    {submissions.length === 0 && (
                        <div className="py-24 text-center border-2 border-dashed rounded-3xl bg-muted/10">
                             <ScrollText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                             <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">Archive storage is currently empty.</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
