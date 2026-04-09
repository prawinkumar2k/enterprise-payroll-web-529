
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { IndianRupee, PieChart, TrendingUp, Users, Download, Filter, Search, Wallet, CheckCircle } from 'lucide-react';

import DashboardLayout from '@/components/DashboardLayout';

export default function EmployeeSalaryReport() {
    const [searchTerm, setSearchTerm] = useState('');

    const { data: result, isLoading } = useQuery({
        queryKey: ['company-salary-report'],
        queryFn: () => axios.get('/api/company/salary-report', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).then(r => r.data),
        staleTime: 30_000,
    });

    const report = result?.report || [];
    const filtered = report.filter(r => 
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        r.emp_no?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout activeRoute="mon-salary">
            <div className="space-y-8 animate-in fade-in duration-500">
                 {/* Header Area */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                       <h1 className="text-3xl font-black tracking-tight text-foreground uppercase mb-2">Revenue Distribution</h1>
                       <p className="text-muted-foreground font-medium">Aggregated salary projections based on attendance status and payroll data.</p>
                    </div>
                    <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-8 py-3.5 rounded-2xl shadow-lg shadow-emerald-600/20 flex items-center gap-3 transition-all active:scale-95 uppercase text-xs tracking-widest">
                        <Download className="w-5 h-5" /> Export Disbursement
                    </button>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                        { label: 'Total Present Days', value: report.reduce((acc, r) => acc + r.present_days, 0), icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                        { label: 'Half Day Allocations', value: report.reduce((acc, r) => acc + r.half_days, 0), icon: PieChart, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                        { label: 'Projected Burn', value: `₹${report.reduce((acc, r) => acc + parseFloat(r.estimated_pay || 0), 0).toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
                        { label: 'Active Payroll', value: report.length, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-card border border-border rounded-3xl p-6 shadow-sm group hover:border-primary/20 transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground group-hover:text-primary transition-colors">Economic Metric</span>
                            </div>
                            <p className="text-3xl font-black text-foreground mb-1">{stat.value}</p>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Main Report Buffer */}
                <div className="bg-card border border-border rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-border bg-muted/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-6 top-4 w-5 h-5 text-muted-foreground" />
                            <input 
                                type="text" 
                                placeholder="Filter by payroll identity..."
                                className="w-full bg-background border border-border rounded-2xl py-4 pl-14 pr-6 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <button className="bg-background hover:bg-muted border border-border text-foreground font-black px-8 py-4 rounded-xl flex items-center gap-3 transition-all uppercase text-[10px] tracking-widest shadow-sm">
                                <Filter className="w-4 h-4" /> Protocol Selection
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-muted/30 border-b border-border text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                    <th className="px-8 py-6">Payroll Target</th>
                                    <th className="px-8 py-6">Identity ID</th>
                                    <th className="px-8 py-6">Present Sessions</th>
                                    <th className="px-8 py-6">Half-Day Logic</th>
                                    <th className="px-8 py-6 text-right">Projected Revenue</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-20 text-center text-muted-foreground font-black uppercase tracking-widest text-xs animate-pulse flex flex-col items-center gap-4">
                                           <Wallet className="w-10 h-10 border-4 border-muted-foreground/10 border-t-emerald-500 rounded-full animate-spin" />
                                           Syncing Economic Ledger Data...
                                        </td>
                                    </tr>
                                ) : filtered.map((r) => (
                                    <tr key={r.id} className="hover:bg-muted/30 transition-all group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 flex items-center justify-center text-emerald-600 font-black shadow-inner border border-emerald-500/10">
                                                    {r.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-black text-foreground uppercase tracking-tight leading-none mb-1.5">{r.name}</p>
                                                    <p className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">Certified Asset</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-xs font-black text-muted-foreground uppercase opacity-70 tracking-widest">{r.emp_no || 'NOT_ASSIGNED'}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg font-black text-foreground">{r.present_days}</span>
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-40">Days</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg font-black text-foreground">{r.half_days}</span>
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-40">Days</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right font-black text-emerald-600 text-lg">
                                           <div className="flex items-center justify-end gap-1 group-hover:scale-105 transition-transform origin-right">
                                              <IndianRupee className="w-4 h-4" />
                                              <span>{r.estimated_pay}</span>
                                           </div>
                                           <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest leading-none mt-1 group-hover:block hidden animate-in fade-in duration-300 italic opacity-60">Uplinked Projection</p>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-8 border-t border-border bg-muted/10 text-center">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40">Enterprise Economic Projection Engine v2.0</p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
