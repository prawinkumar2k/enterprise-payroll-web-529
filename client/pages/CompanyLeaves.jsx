
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Calendar, Check, X, Clock, Camera } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { toast } from 'sonner';

export default function CompanyLeaves() {
    const queryClient = useQueryClient();
    const { data: leavesResult } = useQuery({
        queryKey: ['company-leaves'],
        queryFn: () => axios.get('/api/company/leaves', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).then(res => res.data)
    });

    const updateStatus = useMutation({
        mutationFn: (data) => axios.post('/api/company/leaves/status', data, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        onSuccess: (res) => {
            queryClient.invalidateQueries(['company-leaves']);
            toast.success(res.data.message);
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Update failed')
    });

    return (
        <DashboardLayout activeRoute="mon-leaves">
            <div className="space-y-8">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tight">Active Leave Board</h1>
                    <p className="text-muted-foreground text-sm font-medium">Approve or reject leave requests from your field staff and management.</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {leavesResult?.leaves?.map((leave) => (
                        <div key={leave.id} className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/20 transition-all">
                             <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                 <div className="flex items-center gap-5">
                                     {leave.selfie_url ? (
                                         <div className="w-16 h-16 rounded-2xl overflow-hidden border border-border/50 group relative">
                                             <img src={leave.selfie_url} className="w-full h-full object-cover grayscale transition-all group-hover:grayscale-0" />
                                             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                 <Camera className="w-4 h-4 text-white" />
                                             </div>
                                         </div>
                                     ) : (
                                         <div className="w-14 h-14 rounded-2xl bg-primary/10 flex flex-col items-center justify-center">
                                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">{new Date(leave.from_date).toLocaleDateString('en-US', { month: 'short' })}</span>
                                            <span className="text-xl font-black text-primary">{new Date(leave.from_date).getDate()}</span>
                                         </div>
                                     )}
                                     <div>
                                         <p className="font-black text-foreground uppercase tracking-tight text-lg">{leave.emp_name}</p>
                                         <p className="text-xs text-muted-foreground font-medium flex items-center gap-2 mt-1">
                                             <Calendar className="w-3 h-3" /> {new Date(leave.from_date).toLocaleDateString()} to {new Date(leave.to_date).toLocaleDateString()}
                                             <span className="px-2 py-0.5 bg-muted rounded-full font-black text-[9px] uppercase tracking-widest text-muted-foreground">{leave.leave_type}</span>
                                         </p>
                                         <p className="text-[10px] text-muted-foreground mt-3 italic font-medium p-3 bg-muted/30 rounded-xl border border-border/50">
                                            &ldquo;{leave.reason}&rdquo;
                                         </p>
                                     </div>
                                 </div>

                                 <div className="flex items-center gap-3">
                                     {leave.status === 'PENDING' ? (
                                         <div className="flex items-center gap-2">
                                             <button 
                                                onClick={() => updateStatus.mutate({ id: leave.id, status: 'REJECTED' })}
                                                className="bg-destructive/10 text-destructive p-3 rounded-xl hover:bg-destructive hover:text-white transition group"
                                                title="Reject Request"
                                                disabled={updateStatus.isLoading}
                                             >
                                                 <X className="w-5 h-5" />
                                             </button>
                                             <button 
                                                onClick={() => updateStatus.mutate({ id: leave.id, status: 'APPROVED' })}
                                                className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition shadow-lg active:scale-95 flex items-center gap-2"
                                                disabled={updateStatus.isLoading}
                                             >
                                                 <Check className="w-4 h-4" /> Authorize
                                             </button>
                                         </div>
                                     ) : (
                                         <div className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 ${
                                             leave.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-destructive/10 text-destructive'
                                         }`}>
                                             {leave.status === 'APPROVED' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                                             {leave.status}
                                         </div>
                                     )}
                                 </div>
                             </div>
                        </div>
                    ))}
                    {leavesResult?.leaves?.length === 0 && (
                        <div className="py-24 text-center border-2 border-dashed rounded-3xl bg-muted/10 opacity-60">
                             <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
                             <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">No pending leave operations in queue.</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
