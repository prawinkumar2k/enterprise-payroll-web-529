
import React, { useState } from 'react';
import { User, Shield, Lock, Save, Camera, AlertCircle } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { toast } from 'sonner';
import axios from 'axios';

export default function EmployeeProfile() {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });
    const [loading, setLoading] = useState(false);

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) return toast.error('Passwords do not match');
        setLoading(true);
        try {
            await axios.post('/api/auth/profile/password', passwords, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            toast.success('Security protocol updated successfully.');
            setPasswords({ old: '', new: '', confirm: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    const handleBiometricRegister = async (type) => {
        toast.info(`Activating ${type} sensor... Please wait.`);
        
        // Simulating Hardware Sensor Acquisition (ZKTeco / WebAuthn API)
        setTimeout(async () => {
            try {
                const simulatedTemplate = `SIM_TEMPLATE_${Math.random().toString(36).substring(7)}`;
                await axios.post('/api/biometric/register', {
                   user_type: storedUser.role === 'employee' ? 'employee' : 'user',
                   external_id: storedUser.id,
                   biometric_type: type,
                   template_data: simulatedTemplate
                }, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                toast.success(`${type} identity recorded in secure master database.`);
        } catch {
            toast.error(`${type} registration failed. Check sensor connection.`);
        }
        }, 1500);
    };

    return (
        <DashboardLayout activeRoute="my-profile">
            <div className="space-y-8">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tight">Identity Management</h1>
                    <p className="text-muted-foreground text-sm font-medium">Verify your administrative credentials and update security protocols.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Identity Overview */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-card border border-border rounded-3xl p-8 flex flex-col items-center text-center shadow-lg relative overflow-hidden group">
                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative z-10">
                                <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center border-4 border-background shadow-xl mb-4 group-hover:scale-105 transition-transform">
                                    <User className="w-12 h-12 text-primary-foreground" />
                                </div>
                                <h3 className="text-xl font-black text-foreground uppercase tracking-tight leading-none">{storedUser.name}</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-2">@{storedUser.username}</p>
                                <div className="mt-6 flex flex-wrap justify-center gap-2">
                                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">Operational</span>
                                    <span className="px-3 py-1 bg-indigo-500/10 text-indigo-500 text-[9px] font-black uppercase tracking-widest rounded-full border border-indigo-500/20">{storedUser.role}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-muted/10 border border-dashed border-border rounded-3xl p-6">
                             <div className="flex items-center gap-3 text-muted-foreground mb-4">
                                 <Shield className="w-4 h-4" />
                                 <span className="text-[10px] font-black uppercase tracking-widest">Digital Authority</span>
                             </div>
                             <div className="space-y-4">
                                 <div>
                                     <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest leading-none mb-1">Assigned Entity</p>
                                     <p className="text-sm font-bold text-foreground">{storedUser.company_name || 'Enterprise'}</p>
                                 </div>
                                 <div className="h-px bg-border/50" />
                                 <div>
                                     <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest leading-none mb-1">Access Tier</p>
                                     <p className="text-sm font-bold text-foreground uppercase tracking-tight">{storedUser.role}</p>
                                 </div>
                             </div>
                        </div>
                    </div>

                    {/* Security Update */}
                    <div className="lg:col-span-2">
                        <div className="bg-card border border-border rounded-3xl p-8 shadow-xl">
                            <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-3 mb-8">
                                <Lock className="w-6 h-6 text-primary" /> Security Protocol Update
                            </h3>
                            <form className="space-y-6" onSubmit={handlePasswordUpdate}>
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Authentication Original</label>
                                        <input 
                                            type="password" 
                                            placeholder="Verify current password" 
                                            className="input-field py-3"
                                            value={passwords.old}
                                            onChange={e => setPasswords({ ...passwords, old: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">New Security Key</label>
                                            <input 
                                                type="password" 
                                                placeholder="Complex password" 
                                                className="input-field py-3"
                                                value={passwords.new}
                                                onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Authorize Key Confirmation</label>
                                            <input 
                                                type="password" 
                                                placeholder="Confirm key" 
                                                className="input-field py-3"
                                                value={passwords.confirm}
                                                onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <button 
                                        type="submit" 
                                        disabled={loading}
                                        className="bg-primary text-primary-foreground px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:opacity-90 shadow-lg active:scale-95 disabled:opacity-50 transition"
                                    >
                                        {loading ? <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                                        Update Protocol
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div className="mt-8 bg-card border border-border rounded-3xl p-8 shadow-xl">
                            <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-3 mb-8">
                                <Shield className="w-6 h-6 text-primary" /> Biometric Identity Management
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-6 bg-muted/20 border border-border rounded-2xl flex flex-col items-center text-center group hover:bg-primary/5 transition-colors cursor-pointer" onClick={() => handleBiometricRegister('fingerprint')}>
                                    <div className="w-16 h-16 bg-background rounded-2xl flex items-center justify-center border-2 border-primary/20 mb-4 group-hover:scale-110 transition-transform shadow-sm">
                                        <Shield className="w-8 h-8 text-primary" />
                                    </div>
                                    <h4 className="text-sm font-black uppercase tracking-tight">Register Fingerprint</h4>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-2">Requires USB Scanner Connection</p>
                                </div>

                                <div className="p-6 bg-muted/20 border border-border rounded-2xl flex flex-col items-center text-center group hover:bg-primary/5 transition-colors cursor-pointer" onClick={() => handleBiometricRegister('face')}>
                                    <div className="w-16 h-16 bg-background rounded-2xl flex items-center justify-center border-2 border-primary/20 mb-4 group-hover:scale-110 transition-transform shadow-sm">
                                        <Camera className="w-8 h-8 text-primary" />
                                    </div>
                                    <h4 className="text-sm font-black uppercase tracking-tight">Register Face ID</h4>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-2">Requires Active Camera Sensor</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex items-start gap-4 p-5 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                             <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                             <p className="text-[10px] font-medium text-amber-600 uppercase tracking-widest leading-relaxed">
                                 Security keys must be unique. Updating your protocol will terminate all active mission sessions across alternative devices.
                             </p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
