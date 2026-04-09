
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Search, FileText, Calendar, Clock, Download, MoreVertical, Filter, Terminal, CheckCircle } from 'lucide-react';

import DashboardLayout from '@/components/DashboardLayout';

export default function WorkSubmissionsView() {
    const [searchTerm, setSearchTerm] = useState('');

    const { data: result, isLoading } = useQuery({
        queryKey: ['work-submissions'],
        queryFn: () => axios.get('/api/company/work', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).then(r => r.data),
        staleTime: 30_000,
    });

    const submissions = result?.submissions || [];
    const filtered = submissions.filter(s => 
        s.emp_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout activeRoute="mon-work">
            <div className="space-y-8 animate-in fade-in duration-500">
                {/* Header Area */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                       <h1 className="text-3xl font-black tracking-tight text-foreground uppercase mb-2">Operational Output</h1>
                       <p className="text-muted-foreground font-medium">Reviewing and auditing task submissions from company personnel.</p>
                    </div>
                    <div className="bg-primary/10 text-primary border border-primary/20 px-6 py-3 rounded-2xl flex items-center gap-3">
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-xs font-black uppercase tracking-widest">{submissions.length} Missions Logged</span>
                    </div>
                </div>

                {/* Global Search Interface */}
                <div className="bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="relative flex-1 max-w-lg">
                        <Search className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
                        <input 
                            type="text" 
                            placeholder="Search operational logs by keyword..."
                            className="w-full bg-background border border-border rounded-xl py-3 pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="bg-muted hover:bg-muted/80 border border-border text-foreground font-black px-6 py-3 rounded-xl flex items-center gap-2 transition-all uppercase text-[10px] tracking-widest">
                        <Filter className="w-4 h-4" /> Output Protocol
                    </button>
                </div>

                {/* Submission Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {isLoading ? (
                        <div className="col-span-full py-20 text-center animate-pulse flex flex-col items-center gap-4">
                            <Terminal className="w-12 h-12 text-primary animate-spin" />
                            <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Parsing Mission Data Streams...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="col-span-full py-20 text-center bg-muted/30 border border-border rounded-3xl animate-in zoom-in duration-300">
                            <FileText className="w-16 h-16 opacity-10 mb-4 mx-auto" />
                            <p className="text-sm font-black uppercase tracking-widest text-muted-foreground opacity-50">No operational records found.</p>
                        </div>
                    ) : filtered.map((sub) => (
                        <div key={sub.id} className="bg-card border border-border rounded-[2rem] shadow-sm hover:shadow-2xl transition-all group flex flex-col h-full overflow-hidden">
                            {/* Header Stripe */}
                            <div className="p-6 border-b border-border bg-muted/20 flex items-center justify-between">
                                <div className="flex items-center gap-3 font-black text-foreground uppercase tracking-tight text-sm">
                                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
                                        {sub.emp_name.charAt(0).toUpperCase()}
                                    </div>
                                    <span>{sub.emp_name}</span>
                                </div>
                                <button className="p-2 hover:bg-muted rounded-lg transition text-muted-foreground">
                                    <MoreVertical className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Description Console */}
                            <div className="p-6 flex-1 space-y-6">
                                <div className="bg-muted/30 border border-border rounded-2xl p-4 min-h-[140px] relative">
                                    <div className="absolute top-2 right-4 text-[9px] font-black text-muted-foreground uppercase opacity-30">Mission Report</div>
                                    <p className="text-sm font-medium text-foreground leading-relaxed whitespace-pre-wrap">{sub.description}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Inception</span>
                                        <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                                            <Calendar className="w-3.5 h-3.5 text-primary" />
                                            <span>{new Date(sub.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Timestamp</span>
                                        <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                                            <Clock className="w-3.5 h-3.5 text-primary" />
                                            <span>{new Date(sub.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Footer */}
                            <div className="p-6 bg-muted/20 border-t border-border mt-auto">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-2">
                                         <div className={`w-2 h-2 rounded-full ${sub.file_path ? 'bg-indigo-500' : 'bg-muted-foreground opacity-30'}`} />
                                         <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{sub.file_path ? 'Artifact Attached' : 'Text-Only Feed'}</span>
                                    </div>
                                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2.5 text-[10px] uppercase tracking-widest">
                                        <Download className="w-4 h-4" /> Download Artifact
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
