import React, { useState, useEffect } from 'react';
import DashboardLayout from "../components/DashboardLayout";
import { Database, ShieldCheck, Cpu, HardDrive, Key, AlertTriangle, FileCheck, ExternalLink, Cloud, Link2, CheckCircle2 } from 'lucide-react';

export default function LicenseManagement() {
    const [status, setStatus] = useState(null);
    const [tenant, setTenant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activationKey, setActivationKey] = useState("");
    const [onboarding, setOnboarding] = useState({ tenantId: "", token: "" });

    useEffect(() => {
        Promise.all([fetchLicenseStatus(), fetchTenantStatus()]).finally(() => setLoading(false));
    }, []);

    const fetchLicenseStatus = async () => {
        try {
            const res = await fetch('/api/system/license/status', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            if (data.success) setStatus(data);
        } catch (e) { console.error(e); }
    };

    const fetchTenantStatus = async () => {
        try {
            const res = await fetch('/api/tenant/status', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            if (data.success) setTenant(data);
        } catch (e) { console.error(e); }
    };

    const handleCloudLink = async () => {
        try {
            const res = await fetch('/api/tenant/link', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ tenantId: onboarding.tenantId, activationToken: onboarding.token })
            });
            const data = await res.json();
            if (data.success) {
                alert('Cloud Link Successful!');
                fetchTenantStatus();
            } else {
                alert(data.message);
            }
        } catch (e) { alert('Linking failed.'); }
    };

    const handleActivate = async () => {
        if (!activationKey) return;
        setLoading(true);
        try {
            const res = await fetch('/api/system/license/activate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ serialKey: activationKey })
            });
            const data = await res.json();
            if (data.success) {
                alert(`Activated: ${data.tier}`);
                fetchLicenseStatus();
            } else {
                alert(data.message);
            }
        } catch (e) { alert('Activation failed.'); }
        finally { setLoading(false); }
    };

    if (loading) return <div className="p-8 flex items-center justify-center h-full"><p className="animate-pulse font-bold text-foreground/40 text-sm uppercase tracking-widest">Scanning Hardware...</p></div>;

    const limits = status?.limits || {};
    const isLicensed = limits.isLicensed;

    return (
        <DashboardLayout activeRoute="licensing">
            <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-foreground uppercase">Commercial Center</h1>
                        <p className="text-foreground/60 font-medium">Manage product activation, machine binding, and cloud synchronization.</p>
                    </div>
                    {tenant?.isLinked && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
                            <Cloud className="w-4 h-4 text-green-500" />
                            <span className="text-[10px] font-black text-green-500 uppercase">Cloud Linked: {tenant.tenantId}</span>
                        </div>
                    )}
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* STATUS CARD */}
                    <div className={`p-6 rounded-2xl border ${isLicensed ? 'bg-green-500/5 border-green-500/20' : 'bg-orange-500/5 border-orange-500/20'}`}>
                        <div className="flex items-center justify-between mb-4">
                            <ShieldCheck className={`w-8 h-8 ${isLicensed ? 'text-green-500' : 'text-orange-500'}`} />
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase border ${isLicensed ? 'border-green-500/30 text-green-500' : 'border-orange-500/30 text-orange-500'}`}>
                                {isLicensed ? 'Activated' : 'Trial'}
                            </span>
                        </div>
                        <h2 className="text-xl font-bold mb-1">{isLicensed ? 'Enterprise Edition' : '14-Day Free Trial'}</h2>
                        <p className="text-sm opacity-60 mb-6 font-medium leading-none">
                            {isLicensed ? 'Commercial license active.' : `${limits.daysRemaining} days remaining.`}
                        </p>
                        {!isLicensed && (
                            <div className="w-full h-1.5 bg-foreground/10 rounded-full overflow-hidden">
                                <div className="h-full bg-orange-500 transition-all duration-1000" style={{ width: `${(limits.daysRemaining / 14) * 100}%` }} />
                            </div>
                        )}
                    </div>

                    {/* HARDWARE FINGERPRINT */}
                    <div className="md:col-span-2 p-6 rounded-2xl border bg-card/50 backdrop-blur-xl border-border/50">
                        <div className="flex items-center gap-2 mb-4">
                            <Key className="w-5 h-5 text-primary" />
                            <h2 className="font-bold uppercase text-sm tracking-widest opacity-60">Machine Binding</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-background/40 border border-border/10 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Cpu className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black opacity-30 uppercase">Machine Fingerprint</p>
                                    <p className="text-xs font-mono font-bold truncate w-40">{status?.fingerprint || 'GENERATING...'}</p>
                                </div>
                            </div>
                            <div className="p-4 rounded-xl bg-background/40 border border-border/10">
                                <p className="text-[10px] font-black opacity-30 uppercase mb-1">Internal Reference</p>
                                <p className="text-xs font-mono font-bold">{tenant?.machineId || '---'}</p>
                            </div>
                        </div>
                        <p className="text-[10px] opacity-40 mt-4 leading-relaxed font-medium capitalize">
                            ⚠️ High-security binding active. Moving data across hardware requires re-activation.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* COMMERCIAL ENTITLEMENTS */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-primary" />
                            Commercial Entitlements
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-xl border border-border/30">
                                <div className="flex items-center gap-3">
                                    <Database className="w-5 h-5 opacity-40" />
                                    <div>
                                        <p className="text-sm font-bold">Max Employee Records</p>
                                        <p className="text-[10px] opacity-50 uppercase font-black">Capacity Limit</p>
                                    </div>
                                </div>
                                <span className="text-sm font-black italic text-primary">{limits.maxEmployees === Infinity ? 'Unlimited' : limits.maxEmployees}</span>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-xl border border-border/30">
                                <div className="flex items-center gap-3">
                                    <FileCheck className="w-5 h-5 opacity-40" />
                                    <div>
                                        <p className="text-sm font-bold">Advanced Features</p>
                                        <p className="text-[10px] opacity-50 uppercase font-black tracking-tighter">Reports & Cloud Sync</p>
                                    </div>
                                </div>
                                <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase ${limits.features?.advancedReports ? 'bg-green-500/20 text-green-500' : 'bg-primary/20 text-primary'}`}>
                                    {limits.features?.advancedReports ? 'Enabled' : 'Locked'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* CLOUD LINKING (The Bridge) */}
                    <div className="p-8 rounded-3xl bg-slate-900 text-slate-100 space-y-6 shadow-2xl relative overflow-hidden group">
                        <Cloud className="absolute -right-4 -top-4 w-32 h-32 opacity-5 group-hover:opacity-10 transition-opacity" />
                        <div>
                            <h3 className="text-2xl font-black tracking-tight flex items-center gap-2">
                                <Link2 className="w-6 h-6 text-blue-400" />
                                SaaS Bridge
                            </h3>
                            <p className="text-slate-400 text-sm font-medium mt-1">Connect your local instance to the Cloud Dashboard for remote reports and multi-tenant sync.</p>
                        </div>

                        {tenant?.isLinked ? (
                            <div className="space-y-4 animate-in zoom-in-95">
                                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-4 text-green-400">
                                    <CheckCircle2 className="w-6 h-6" />
                                    <div>
                                        <p className="text-sm font-bold">Connected as {tenant.tenantId}</p>
                                        <p className="text-[10px] font-medium opacity-70">Linked on {new Date(tenant.linkDate).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <button className="w-full py-3 rounded-xl border border-slate-700 text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition">
                                    Disconnect SaaS Engine
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        placeholder="Tenant ID (e.g. school-01)"
                                        value={onboarding.tenantId}
                                        onChange={(e) => setOnboarding({ ...onboarding, tenantId: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                    <input
                                        type="password"
                                        placeholder="Activation Token (SAAS_...)"
                                        value={onboarding.token}
                                        onChange={(e) => setOnboarding({ ...onboarding, token: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                                <button
                                    onClick={handleCloudLink}
                                    className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-4 flex items-center justify-center gap-2 font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-blue-500/20"
                                >
                                    Link to Cloud Tenant
                                </button>
                            </div>
                        )}
                    </div>

                    {/* ACTIVATION SECTION */}
                    <div className="p-8 rounded-3xl bg-primary text-primary-foreground space-y-6 shadow-2xl shadow-primary/20">
                        <div>
                            <h3 className="text-2xl font-black leading-tight">Software Activation</h3>
                            <p className="opacity-80 text-sm font-medium">Enter your offline activation code to unlock full enterprise features.</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase opacity-60 tracking-widest pl-1">Serial Key</label>
                            <input
                                type="text"
                                placeholder="XXXX-XXXX-XXXX-XXXX"
                                value={activationKey}
                                onChange={(e) => setActivationKey(e.target.value)}
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-lg font-mono font-bold placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all uppercase"
                            />
                        </div>
                        <button
                            onClick={handleActivate}
                            className="w-full bg-white text-primary rounded-xl py-4 flex items-center justify-center gap-2 font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/10"
                        >
                            Activate Product
                        </button>
                        <p className="text-[10px] text-center opacity-60 font-medium">
                            Need a license? <a href="#" className="underline font-bold flex inline-flex items-center gap-0.5">Contact Sales <ExternalLink className="w-2 h-2" /></a>
                        </p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
