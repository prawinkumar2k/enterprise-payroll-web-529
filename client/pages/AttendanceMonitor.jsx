
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Calendar, Search, MapPin, Camera, Clock, MoreHorizontal, ExternalLink, Globe } from 'lucide-react';

import DashboardLayout from '@/components/DashboardLayout';

export default function AttendanceMonitor() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const { data: result, isLoading } = useQuery({
        queryKey: ['attendance-monitor', selectedDate],
        queryFn: () => axios.get(`/api/company/attendance?date=${selectedDate}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).then(r => r.data),
        staleTime: 30_000,
    });

    const logs = result?.attendance || [];
    const filtered = logs.filter(l => 
        l.emp_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout activeRoute="mon-attendance">
            <div className="space-y-8 animate-in fade-in duration-500">
                 {/* Header Area */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                       <h1 className="text-3xl font-black tracking-tight text-foreground uppercase mb-2">Operational Presence</h1>
                       <p className="text-muted-foreground font-medium">Real-time attendance, geolocation, and biometric verification feed.</p>
                    </div>
                    <div className="flex items-center gap-3 bg-card border border-border p-2 rounded-2xl shadow-sm">
                        <Calendar className="w-5 h-5 text-primary ml-3" />
                        <input 
                           type="date"
                           className="bg-transparent border-none focus:outline-none text-sm font-bold uppercase tracking-widest text-foreground px-4 py-2"
                           value={selectedDate}
                           onChange={(e) => setSelectedDate(e.target.value)}
                        />
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="relative flex-1 max-w-lg">
                        <Search className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
                        <input 
                            type="text" 
                            placeholder="Filter by officer name..."
                            className="w-full bg-muted/50 border border-border rounded-xl py-3 pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all border-dashed"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-4">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground opacity-50 mb-1">Status Protocol</span>
                            <div className="flex items-center gap-3">
                                 <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"/><span className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">Office</span></div>
                                 <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"/><span className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">Remote</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Attendance Feed */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {isLoading ? (
                        <div className="col-span-full py-20 text-center animate-pulse flex flex-col items-center gap-4">
                            <Globe className="w-12 h-12 text-primary animate-spin" />
                            <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Syncing Satellite Data Stream...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="col-span-full py-20 text-center bg-muted/30 border border-border rounded-3xl animate-in zoom-in duration-300">
                            <Calendar className="w-16 h-16 opacity-10 mb-4 mx-auto" />
                            <p className="text-sm font-black uppercase tracking-widest text-muted-foreground opacity-50">Zero operational logs for this epoch.</p>
                        </div>
                    ) : filtered.map((log) => (
                        <div key={log.id} className="bg-card border border-border rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all group overflow-hidden flex flex-col">
                            {/* Top Profile Strip */}
                            <div className="p-6 border-b border-border flex items-center justify-between bg-muted/20">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-black shadow-lg">
                                        {log.emp_name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-foreground uppercase tracking-tight leading-none mb-1.5">{log.emp_name}</h3>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${log.is_remote ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                                                {log.is_remote ? 'Remote Protocol' : 'Office Deployment'}
                                            </span>
                                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">ID: {log.employee_id}</span>
                                        </div>
                                    </div>
                                </div>
                                <button className="p-2.5 hover:bg-muted rounded-xl transition text-muted-foreground">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Middle Visual Intelligence */}
                            <div className="grid grid-cols-2">
                                 <div className="aspect-[4/3] bg-muted relative group-hover:bg-muted/50 transition-colors border-r border-border">
                                    {log.in_selfie_url ? (
                                        <><img src={log.in_selfie_url} className="w-full h-full object-cover" alt="Punch In" />
                                        <div className="absolute top-4 left-4 bg-emerald-500 text-white text-[9px] font-black px-2 py-1 rounded shadow-sm uppercase tracking-widest">Punch In</div></>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center gap-2 opacity-30">
                                            <Camera className="w-6 h-6" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">No In-Selfie</span>
                                        </div>
                                    )}
                                 </div>
                                 <div className="aspect-[4/3] bg-muted relative group-hover:bg-muted/50 transition-colors">
                                    {log.out_selfie_url ? (
                                        <><img src={log.out_selfie_url} className="w-full h-full object-cover" alt="Punch Out" />
                                        <div className="absolute top-4 left-4 bg-indigo-500 text-white text-[9px] font-black px-2 py-1 rounded shadow-sm uppercase tracking-widest">Punch Out</div></>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center gap-2 opacity-30">
                                            <Camera className="w-6 h-6" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">In Progress</span>
                                        </div>
                                    )}
                                 </div>
                            </div>

                            {/* Bottom Metadata */}
                            <div className="p-6 bg-muted/20 flex flex-col lg:flex-row justify-between gap-6 border-t border-border">
                                 <div className="flex-1 space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="p-2.5 bg-background border border-border rounded-xl">
                                            <Clock className="w-4 h-4 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Shift Metrics</span>
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${log.status === 'PRESENT' ? 'text-emerald-500' : 'text-amber-500'}`}>{log.status}</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm font-black text-foreground">
                                                <span>{log.punch_in_time ? new Date(log.punch_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</span>
                                                <div className="w-1.5 h-1.5 rounded-full bg-border" />
                                                <span>{log.punch_out_time ? new Date(log.punch_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Pending'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="p-2.5 bg-background border border-border rounded-xl">
                                            <MapPin className="w-4 h-4 text-indigo-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Deployment Satellite Log</span>
                                            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                                                <span className="truncate">{log.in_lat ? `${log.in_lat.toFixed(4)}, ${log.in_lng.toFixed(4)}` : 'No Signal'}</span>
                                                <ExternalLink className="w-3 h-3 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
                                            </div>
                                        </div>
                                    </div>
                                 </div>

                                 <div className="lg:w-px bg-border flex-shrink-0" />

                                 <div className="flex flex-col justify-center gap-3">
                                     <button className="bg-primary hover:bg-primary-600 text-primary-foreground font-black px-6 py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-3 text-[10px] uppercase tracking-widest">
                                        Verify Session
                                     </button>
                                     <button className="bg-background hover:bg-muted border border-border text-foreground font-black px-6 py-2.5 rounded-xl transition-all flex items-center justify-center gap-3 text-[10px] uppercase tracking-widest">
                                        Full Dossier
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
