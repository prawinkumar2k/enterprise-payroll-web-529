
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Calendar, Clock, MapPin, AlertCircle } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';

export default function EmployeeAttendance() {
    const { data: attendanceResult } = useQuery({
        queryKey: ['my-attendance'],
        queryFn: () => axios.get('/api/employee/attendance', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).then(res => res.data)
    });

    const logs = attendanceResult?.attendance || [];

    return (
        <DashboardLayout activeRoute="my-attendance">
            <div className="space-y-8">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tight">Mission History</h1>
                    <p className="text-muted-foreground text-sm font-medium">Review your historical biometric and satellite verification logs.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {logs.map((log) => (
                        <div key={log.id} className="bg-card border border-border rounded-3xl overflow-hidden hover:border-primary/20 transition-all group">
                             <div className="p-5 border-b border-border bg-muted/30">
                                 <div className="flex items-center justify-between mb-2">
                                     <div className="flex items-center gap-2">
                                         <Calendar className="w-4 h-4 text-muted-foreground" />
                                         <span className="text-sm font-black text-foreground uppercase tracking-tight">{new Date(log.punch_in_time).toDateString()}</span>
                                     </div>
                                     <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
                                         log.status === 'PRESENT' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                                     }`}>
                                         {log.status}
                                     </span>
                                 </div>
                             </div>

                             <div className="p-5 space-y-4">
                                 <div className="flex items-center justify-between">
                                     <div className="flex items-center gap-3">
                                         <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                                             <Clock className="w-4 h-4 text-indigo-500" />
                                         </div>
                                         <div>
                                            <p className="text-[9px] uppercase font-black text-muted-foreground tracking-widest leading-none">Punch In</p>
                                            <p className="text-sm font-bold text-foreground">{new Date(log.punch_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                         </div>
                                     </div>
                                     {log.punch_out_time ? (
                                         <div className="flex items-center gap-3 text-right">
                                             <div>
                                                <p className="text-[9px] uppercase font-black text-muted-foreground tracking-widest leading-none">Punch Out</p>
                                                <p className="text-sm font-bold text-foreground">{new Date(log.punch_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                             </div>
                                             <div className="w-8 h-8 rounded-lg bg-slate-500/10 flex items-center justify-center">
                                                 <Clock className="w-4 h-4 text-slate-500" />
                                             </div>
                                         </div>
                                     ) : (
                                         <span className="text-[10px] text-amber-500 font-bold uppercase animate-pulse">In Progress</span>
                                     )}
                                 </div>

                                 <div className="flex items-center justify-between py-2 border-t border-border/50">
                                     <div className="flex items-center gap-2 text-muted-foreground">
                                         <MapPin className="w-3.5 h-3.5" />
                                         <span className="text-[10px] font-bold uppercase tracking-widest">Satellite Validation</span>
                                     </div>
                                     <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${log.is_remote ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' : 'bg-green-500/10 border-green-500/20 text-green-500'}`}>
                                         {log.is_remote ? 'REMOTE' : 'OFFICE'}
                                     </span>
                                 </div>
                             </div>
                        </div>
                    ))}
                </div>

                {logs.length === 0 && (
                    <div className="py-20 text-center bg-muted/20 border border-dashed rounded-3xl">
                         <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                         <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">No verified mission logs archived.</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
