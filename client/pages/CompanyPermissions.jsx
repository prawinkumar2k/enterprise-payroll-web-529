
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Shield, Check, X, Clock, Camera } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { toast } from 'sonner';

export default function CompanyPermissions() {
    const queryClient = useQueryClient();
    const { data: permResult } = useQuery({
        queryKey: ['company-permissions'],
        queryFn: () => axios.get('/api/company/permissions', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).then(res => res.data)
    });

    const updateStatus = useMutation({
        mutationFn: (data) => axios.post('/api/company/permissions/status', data, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        onSuccess: (res) => {
            queryClient.invalidateQueries(['company-permissions']);
            toast.success(res.data.message);
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Update failed')
    });

    return (
        <DashboardLayout activeRoute="mon-permissions">
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight">Security Permissions Board</h1>
                        <p className="text-muted-foreground text-sm font-medium">Review and authorize short-term absence and operational permissions.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {permResult?.permissions?.map((perm) => (
                        <div key={perm.id} className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/20 transition-all">
                             <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                 <div className="flex items-center gap-5">
                                     {perm.selfie_url ? (
                                         <div className="w-16 h-16 rounded-2xl overflow-hidden border border-border/50 group relative">
                                             <img src={perm.selfie_url} className="w-full h-full object-cover grayscale transition-all group-hover:grayscale-0" />
                                             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                 <Camera className="w-4 h-4 text-white" />
                                             </div>
                                         </div>
                                     ) : (
                                         <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                                             <Shield className="w-7 h-7 text-indigo-500" />
                                         </div>
                                     )}
                                     <div>
                                         <p className="font-black text-foreground uppercase tracking-tight text-lg">{perm.emp_name}</p>
                                         <div className="flex items-center gap-3 mt-1">
                                             <span className="text-[10px] font-black px-2 py-0.5 bg-indigo-500/10 text-indigo-500 rounded-full uppercase tracking-widest leading-none">{perm.permission_type}</span>
                                             <p className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                                                 <Clock className="w-3 h-3" /> {new Date(perm.date).toLocaleDateString()} | {perm.from_time} - {perm.to_time}
                                             </p>
                                         </div>
                                         <p className="text-[10px] text-muted-foreground mt-3 italic font-medium p-3 bg-muted/30 rounded-xl border border-border/50">
                                            &ldquo;{perm.reason}&rdquo;
                                         </p>
                                     </div>
                                 </div>

                                 <div className="flex items-center gap-3">
                                     {perm.status === 'PENDING' ? (
                                         <div className="flex items-center gap-2">
                                             <button 
                                                onClick={() => updateStatus.mutate({ id: perm.id, status: 'REJECTED' })}
                                                className="bg-destructive/10 text-destructive p-3 rounded-xl hover:bg-destructive hover:text-white transition group"
                                                title="Reject Request"
                                                disabled={updateStatus.isLoading}
                                             >
                                                 <X className="w-5 h-5" />
                                             </button>
                                             <button 
                                                onClick={() => updateStatus.mutate({ id: perm.id, status: 'APPROVED' })}
                                                className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition shadow-lg active:scale-95 flex items-center gap-2"
                                                disabled={updateStatus.isLoading}
                                             >
                                                 <Check className="w-4 h-4" /> Grant Permission
                                             </button>
                                         </div>
                                     ) : (
                                         <div className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 ${
                                             perm.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-destructive/10 text-destructive'
                                         }`}>
                                             {perm.status === 'APPROVED' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                                             {perm.status}
                                         </div>
                                     )}
                                 </div>
                             </div>
                        </div>
                    ))}
                    {permResult?.permissions?.length === 0 && (
                        <div className="py-24 text-center border-2 border-dashed rounded-3xl bg-muted/10 opacity-60">
                             <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4 animate-pulse opacity-20" />
                             <p className="text-sm font-black text-muted-foreground uppercase tracking-widest leading-none">Scanning for mission permissions...</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
