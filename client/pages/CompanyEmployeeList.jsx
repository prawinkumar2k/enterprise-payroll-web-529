
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Users, Search, Filter, MoreVertical, ShieldCheck, Mail, UserPlus } from 'lucide-react';

import DashboardLayout from '@/components/DashboardLayout';

export default function CompanyEmployeeList() {
    const [searchTerm, setSearchTerm] = useState('');

    const { data: result, isLoading } = useQuery({
        queryKey: ['company-employees'],
        queryFn: () => axios.get('/api/company/employees', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).then(r => r.data),
        staleTime: 30_000,
    });

    const employees = result?.employees || [];
    const filtered = employees.filter(e => 
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        e.emp_no?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout activeRoute="mon-employees">
            <div className="space-y-8 animate-in fade-in duration-500">
                {/* Header Area */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                       <h1 className="text-3xl font-black tracking-tight text-foreground uppercase mb-2">Internal Assets</h1>
                       <p className="text-muted-foreground font-medium">Managing and monitoring {employees.length} company employees across the SaaS network.</p>
                    </div>
                    <button className="bg-primary hover:bg-primary-600 text-primary-foreground font-black px-8 py-3.5 rounded-2xl shadow-lg shadow-primary/20 flex items-center gap-3 transition-all active:scale-95 uppercase text-xs tracking-widest">
                        <UserPlus className="w-5 h-5" /> Provision New Asset
                    </button>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { label: 'Active Force', value: employees.filter(e => e.is_active).length, icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                        { label: 'Asset Capacity', value: employees.length, icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
                        { label: 'Pending Verification', value: 0, icon: Mail, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-card border border-border rounded-3xl p-6 shadow-sm group hover:border-primary/20 transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground group-hover:text-primary transition-colors">Operational Stat</span>
                            </div>
                            <p className="text-4xl font-black text-foreground mb-1">{stat.value}</p>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Filter & Table Container */}
                <div className="bg-card border border-border rounded-[2rem] shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-border bg-muted/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
                            <input 
                                type="text" 
                                placeholder="Search assets by name or ID..."
                                className="w-full bg-background border border-border rounded-2xl py-3 pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="bg-background hover:bg-muted border border-border text-foreground font-black px-6 py-3 rounded-xl flex items-center gap-2 transition-all uppercase text-[10px] tracking-widest">
                                <Filter className="w-4 h-4" /> Filter Protocols
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto min-h-[400px]">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-muted/30 border-b border-border text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                    <th className="px-8 py-5">Identity Profile</th>
                                    <th className="px-8 py-5">Access Protocol (Role)</th>
                                    <th className="px-8 py-5">Account Status</th>
                                    <th className="px-8 py-5">Joined System</th>
                                    <th className="px-8 py-5 text-right">Operational Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4 text-muted-foreground font-black uppercase tracking-widest text-xs">
                                                <div className="w-10 h-10 border-4 border-muted-foreground/10 border-t-primary rounded-full animate-spin" />
                                                Synchronizing Asset Data...
                                            </div>
                                        </td>
                                    </tr>
                                ) : filtered.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-muted/30 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 flex items-center justify-center text-primary font-black shadow-inner border border-primary/5">
                                                    {emp.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-black text-foreground uppercase tracking-tight leading-none mb-1.5">{emp.name}</p>
                                                    <p className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">ID: {emp.emp_no || 'NOT_LINKED'} · @{emp.username}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                                emp.role === 'COMPANY_ADMIN' 
                                                    ? 'bg-primary/10 text-primary border-primary/20' 
                                                    : 'bg-muted text-muted-foreground border-border'
                                            }`}>
                                                {emp.role}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2.5">
                                                <div className={`w-2 h-2 rounded-full ${emp.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-destructive'}`} />
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${emp.is_active ? 'text-emerald-500' : 'text-destructive'}`}>
                                                    {emp.is_active ? 'Active Operation' : 'Deactivated'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-foreground">{new Date(emp.created_at).toLocaleDateString()}</span>
                                                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-tighter mt-0.5">Epoch Verified</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                           <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                              <button className="p-2.5 hover:bg-muted rounded-xl transition text-muted-foreground" title="View Dossier">
                                                 <ShieldCheck className="w-4 h-4" />
                                              </button>
                                              <button className="p-2.5 hover:bg-muted rounded-xl transition text-muted-foreground" title="Protocol Override">
                                                 <MoreVertical className="w-4 h-4" />
                                              </button>
                                           </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        {filtered.length === 0 && !isLoading && (
                            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground animate-in zoom-in duration-300">
                               <Users className="w-16 h-16 opacity-10 mb-4" />
                               <p className="text-sm font-black uppercase tracking-widest opacity-50">No operational assets match your query.</p>
                            </div>
                        )}
                    </div>

                    <div className="p-6 border-t border-border bg-muted/10 text-center">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40">Enterprise Asset Classification Protocol v1.0</p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
