
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Wallet, IndianRupee, TrendingUp, Calendar, Clock } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';

export default function EmployeeSalary() {
    const { data: salaryResult } = useQuery({
        queryKey: ['my-salary'],
        queryFn: () => axios.get('/api/employee/salary', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).then(res => res.data)
    });

    const summary = salaryResult?.summary || {};

    return (
        <DashboardLayout activeRoute="my-salary">
            <div className="space-y-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight">Financial Intelligence</h1>
                        <p className="text-muted-foreground text-sm font-medium">Review your projected revenue and operational earnings estimate.</p>
                    </div>
                    <div className="bg-primary/10 border border-primary/20 px-6 py-3 rounded-2xl flex items-center gap-4 group">
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground group-hover:scale-110 transition-transform">
                            <IndianRupee className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-black text-primary tracking-widest leading-none mb-1">Estimated Asset Revenue</p>
                            <p className="text-xl font-black text-foreground">₹{summary.estimated || '0.00'}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-card border border-border p-6 rounded-3xl shadow-sm hover:border-primary/20 hover:shadow-md transition-all">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest leading-none mb-1">Present Log</p>
                        <p className="text-3xl font-black text-foreground">{summary.PRESENT || 0} Days</p>
                    </div>

                    <div className="bg-card border border-border p-6 rounded-3xl shadow-sm hover:border-primary/20 hover:shadow-md transition-all">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center mb-4">
                            <Clock className="w-5 h-5" />
                        </div>
                        <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest leading-none mb-1">Partial Log</p>
                        <p className="text-3xl font-black text-foreground">{summary.HALF_DAY || 0} Half Days</p>
                    </div>

                    <div className="bg-card border border-border p-6 rounded-3xl shadow-sm hover:border-primary/20 hover:shadow-md transition-all">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-4">
                            <IndianRupee className="w-5 h-5" />
                        </div>
                        <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest leading-none mb-1">Base Valuation</p>
                        <p className="text-3xl font-black text-foreground">₹{summary.basePay || 0}</p>
                    </div>

                    <div className="bg-card border border-border p-6 rounded-3xl shadow-sm hover:border-primary/20 hover:shadow-md transition-all">
                        <div className="w-10 h-10 rounded-xl bg-slate-500/10 text-slate-500 flex items-center justify-center mb-4">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest leading-none mb-1">Billing Cycle</p>
                        <p className="text-3xl font-black text-foreground">30 Days</p>
                    </div>
                </div>

                <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xl">
                    <div className="p-8 border-b border-border bg-muted/20">
                         <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-3">
                             <Wallet className="w-6 h-6 text-primary" /> Projected Disbursement Strategy
                         </h3>
                    </div>
                    <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Asset Allocation</p>
                            <p className="text-sm font-medium text-foreground leading-relaxed">Revenue is calculated based on your verified mission logs and present/partial-shift status for the current billing cycle.</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Operation Status</p>
                            <div className="flex items-center justify-center md:justify-start gap-4 pt-2">
                                <div className="flex flex-col items-center">
                                    <span className="text-xl font-black text-foreground">{summary.PRESENT + summary.HALF_DAY || 0}</span>
                                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Active Cycles</span>
                                </div>
                                <div className="w-px h-10 bg-border" />
                                <div className="flex flex-col items-center">
                                    <span className="text-xl font-black text-foreground">{30 - (summary.PRESENT + summary.HALF_DAY) || 0}</span>
                                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Reserve Days</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-center md:justify-end">
                            <div className="text-center">
                                <p className="text-4xl font-black text-foreground">₹{summary.estimated || '0.00'}</p>
                                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1">Ready for Authorization</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
