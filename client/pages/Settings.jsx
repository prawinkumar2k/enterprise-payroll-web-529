import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useSettings } from "../context/SettingsContext";
import {
    Save,
    Building,
    FileText,
    ToggleLeft,
    Monitor,
    PenTool,
    Calculator,
    Loader2,
    CheckCircle2,
    Image as ImageIcon,
    Trash2,
    UploadCloud
} from "lucide-react";

export default function Settings() {
    const { settings, updateGlobalSettings, isLoading: isGlobalLoading, theme } = useSettings();
    const [localSettings, setLocalSettings] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('organization');

    useEffect(() => {
        if (settings) setLocalSettings(settings);
    }, [settings]);

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const success = await updateGlobalSettings(localSettings);
        setIsSaving(false);
    };

    if (isGlobalLoading) {
        return (
            <DashboardLayout activeRoute="settings">
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    const tabs = [
        { id: 'organization', label: 'Organization', icon: Building, description: 'Branding and contact details' },
        { id: 'reports', label: 'Report Titles', icon: FileText, description: 'Custom labels for generated files' },
        { id: 'features', label: 'Feature Toggles', icon: ToggleLeft, description: 'Enable or disable system modules' },
        { id: 'print', label: 'Print & Style', icon: Monitor, description: 'Document layouts and typography' },
        { id: 'signatures', label: 'Signatures', icon: PenTool, description: 'Official authority designations' }
    ];

    return (
        <DashboardLayout activeRoute="settings">
            <div className="max-w-6xl mx-auto pb-20">
                {/* Header Section */}
                <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-primary/10 p-2 rounded-xl">
                            <Settings className="w-6 h-6 text-primary" />
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-primary/60">System Core</span>
                    </div>
                    <h1 className="text-4xl font-black text-foreground tracking-tight mb-2">Configuration</h1>
                    <p className="text-muted-foreground text-lg">Master control panel for global enterprise parameters and module orchestration.</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-10 items-start">
                    {/* Navigation Sidebar */}
                    <div className="w-full lg:w-72 space-y-2 sticky top-8 animate-in fade-in slide-in-from-left-4 duration-700">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full group flex flex-col items-start gap-1 px-5 py-4 rounded-2xl transition-all duration-300 text-left ${activeTab === tab.id
                                    ? 'bg-primary text-white shadow-xl shadow-primary/30 scale-[1.03]'
                                    : 'bg-card border border-border text-muted-foreground hover:bg-secondary hover:border-primary/20'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <tab.icon className={`w-5 h-5 transition-transform duration-500 ${activeTab === tab.id ? 'scale-110 rotate-0' : 'group-hover:rotate-12'}`} />
                                    <span className="font-black text-sm uppercase tracking-wide">{tab.label}</span>
                                </div>
                                <span className={`text-[10px] font-medium opacity-60 ml-8 transition-opacity ${activeTab === tab.id ? 'block' : 'hidden group-hover:block'}`}>
                                    {tab.description}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 w-full animate-in fade-in slide-in-from-right-4 duration-700">
                        <div className="bg-card border border-border rounded-[2.5rem] shadow-2xl shadow-black/5 overflow-hidden">
                            <form onSubmit={handleSave}>
                                <div className="p-8 md:p-12 min-h-[600px]">
                                    {activeTab === 'organization' && (
                                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-500">
                                            <section>
                                                <div className="flex items-center gap-3 mb-6">
                                                    <div className="w-1.5 h-6 bg-primary rounded-full" />
                                                    <h3 className="text-2xl font-black text-foreground tracking-tight">Branding & Identity</h3>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="md:col-span-2">
                                                        <label className="text-[11px] font-black uppercase text-muted-foreground tracking-widest mb-2 block">Enterprise Name</label>
                                                        <input
                                                            type="text"
                                                            className="w-full px-5 py-4 bg-muted/30 border border-border rounded-2xl outline-none focus:ring-4 ring-primary/10 focus:border-primary transition-all text-lg font-bold"
                                                            value={localSettings.org_name || ''}
                                                            onChange={e => setLocalSettings({ ...localSettings, org_name: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <label className="text-[11px] font-black uppercase text-muted-foreground tracking-widest mb-2 block">Physical Address</label>
                                                        <textarea
                                                            className="w-full px-5 py-4 bg-muted/30 border border-border rounded-x2xl outline-none focus:ring-4 ring-primary/10 focus:border-primary transition-all font-medium h-24"
                                                            value={localSettings.org_address || ''}
                                                            onChange={e => setLocalSettings({ ...localSettings, org_address: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[11px] font-black uppercase text-muted-foreground tracking-widest mb-2 block">Primary Contact</label>
                                                        <input
                                                            type="text"
                                                            className="w-full px-5 py-4 bg-muted/30 border border-border rounded-2xl outline-none focus:ring-4 ring-primary/10 focus:border-primary transition-all font-bold"
                                                            value={localSettings.org_phone || ''}
                                                            onChange={e => setLocalSettings({ ...localSettings, org_phone: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[11px] font-black uppercase text-muted-foreground tracking-widest mb-2 block">Institutional Email</label>
                                                        <input
                                                            type="email"
                                                            className="w-full px-5 py-4 bg-muted/30 border border-border rounded-2xl outline-none focus:ring-4 ring-primary/10 focus:border-primary transition-all font-bold"
                                                            value={localSettings.org_email || ''}
                                                            onChange={e => setLocalSettings({ ...localSettings, org_email: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                            </section>

                                            <section className="bg-secondary/30 p-8 rounded-[2rem] border border-primary/10">
                                                <div className="flex items-center gap-4 mb-6">
                                                    <ImageIcon className="w-6 h-6 text-primary" />
                                                    <h4 className="text-xl font-black text-foreground tracking-tight">Institutional Logo</h4>
                                                </div>

                                                <div className="flex flex-col md:flex-row items-center gap-10">
                                                    <div className="relative group">
                                                        {localSettings.org_logo_url ? (
                                                            <div className="relative w-40 h-40 bg-white dark:bg-slate-900 rounded-3xl border-4 border-white dark:border-slate-800 shadow-2xl overflow-hidden group">
                                                                <img src={localSettings.org_logo_url} alt="Logo" className="w-full h-full object-contain p-4" />
                                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setLocalSettings({ ...localSettings, org_logo_url: '' })}
                                                                        className="bg-red-500 text-white p-3 rounded-full hover:scale-110 transition-transform shadow-xl"
                                                                    >
                                                                        <Trash2 className="w-6 h-6" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="w-40 h-40 bg-muted/50 rounded-3xl border-4 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground gap-2">
                                                                <Building className="w-10 h-10 opacity-20" />
                                                                <span className="text-[10px] font-black uppercase tracking-tighter">No Logo</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex-1 text-center md:text-left">
                                                        <p className="text-lg font-bold text-foreground mb-1">Visual Brand Authority</p>
                                                        <p className="text-sm text-muted-foreground mb-6">High-resolution brand marks ensure consistent styling across all digital receipts and payroll exports.</p>

                                                        <label className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-2xl font-black text-sm cursor-pointer hover:shadow-xl hover:shadow-primary/20 active:scale-95 transition-all">
                                                            <UploadCloud className="w-5 h-5" />
                                                            UPLOAD CORPORATE LOGO
                                                            <input
                                                                type="file"
                                                                className="hidden"
                                                                accept="image/*"
                                                                onChange={(e) => {
                                                                    const file = e.target.files[0];
                                                                    if (file) {
                                                                        const reader = new FileReader();
                                                                        reader.onload = (event) => {
                                                                            const img = new Image();
                                                                            img.onload = () => {
                                                                                const canvas = document.createElement('canvas');
                                                                                const MAX_WIDTH = 800;
                                                                                const scale = Math.min(MAX_WIDTH / img.width, 1);
                                                                                canvas.width = img.width * scale;
                                                                                canvas.height = img.height * scale;
                                                                                const ctx = canvas.getContext('2d');
                                                                                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                                                                                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
                                                                                setLocalSettings({ ...localSettings, org_logo_url: compressedBase64 });
                                                                            };
                                                                            img.src = event.target.result;
                                                                        };
                                                                        reader.readAsDataURL(file);
                                                                    }
                                                                }}
                                                            />
                                                        </label>
                                                    </div>
                                                </div>
                                            </section>
                                        </div>
                                    )}

                                    {activeTab === 'reports' && (
                                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-500">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-1.5 h-6 bg-violet-500 rounded-full" />
                                                <h3 className="text-2xl font-black text-foreground tracking-tight">Global Export Titles</h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                {['pay_bill', 'bank_statement', 'abstract_1', 'abstract_2', 'staff_report', 'pay_certificate'].map(key => (
                                                    <div key={key} className="bg-secondary/20 p-6 rounded-2xl border border-border group hover:border-primary/30 transition-colors">
                                                        <label className="text-[11px] font-black uppercase text-primary tracking-widest mb-3 block">{key.replace(/_/g, ' ')}</label>
                                                        <input
                                                            type="text"
                                                            className="w-full px-0 py-1 bg-transparent border-b-2 border-border focus:border-primary outline-none text-lg font-bold transition-all"
                                                            placeholder={`Standard ${key.replace(/_/g, ' ')} Title`}
                                                            value={localSettings[`title_${key}`] || ''}
                                                            onChange={e => setLocalSettings({ ...localSettings, [`title_${key}`]: e.target.value })}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'features' && (
                                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-500">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                                                <h3 className="text-2xl font-black text-foreground tracking-tight">Active Module Orchestration</h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {Object.keys(localSettings).filter(k => k.startsWith('enable_')).map(key => {
                                                    const isActive = localSettings[key] === 'true' || localSettings[key] === true;
                                                    return (
                                                        <div key={key} className={`flex items-center justify-between p-6 rounded-3xl border-2 transition-all duration-300 ${isActive ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-muted/10 border-border opacity-60'}`}>
                                                            <div className="flex items-center gap-4">
                                                                <div className={`p-3 rounded-2xl ${isActive ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-muted text-muted-foreground'}`}>
                                                                    <CheckCircle2 className="w-5 h-5" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-black text-foreground uppercase text-xs tracking-widest">{key.replace('enable_', '').replace(/_/g, ' ')}</p>
                                                                    <p className="text-[10px] text-muted-foreground font-medium uppercase mt-0.5">{isActive ? 'Production Active' : 'Module Disabled'}</p>
                                                                </div>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => setLocalSettings({ ...localSettings, [key]: !isActive })}
                                                                className={`w-14 h-8 rounded-full transition-all relative ${isActive ? 'bg-emerald-500' : 'bg-muted'}`}
                                                            >
                                                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform shadow-md ${isActive ? 'translate-x-7' : 'translate-x-1'}`} />
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'print' && (
                                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-500">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
                                                <h3 className="text-2xl font-black text-foreground tracking-tight">Print & Aesthetic Parameters</h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="bg-secondary/20 p-8 rounded-3xl border border-border">
                                                    <label className="text-[11px] font-black uppercase text-muted-foreground tracking-widest mb-4 block">Primary Document Typography</label>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <select className="w-full px-4 py-3 bg-card border border-border rounded-xl font-bold outline-none" value={localSettings.print_font_family} onChange={e => setLocalSettings({ ...localSettings, print_font_family: e.target.value })}>
                                                            <option>Times New Roman</option>
                                                            <option>Arial</option>
                                                            <option>Inter</option>
                                                            <option>Georgia</option>
                                                        </select>
                                                        <input type="text" className="w-full px-4 py-3 bg-card border border-border rounded-xl font-bold outline-none" value={localSettings.print_font_size} onChange={e => setLocalSettings({ ...localSettings, print_font_size: e.target.value })} />
                                                    </div>
                                                </div>

                                                <div className="bg-secondary/20 p-8 rounded-3xl border border-border flex items-center justify-between gap-6">
                                                    <div className="flex-1">
                                                        <label className="text-[11px] font-black uppercase text-muted-foreground tracking-widest mb-1 block">Live Timestamp</label>
                                                        <p className="text-[10px] text-muted-foreground font-medium leading-tight">Append automated build timestamps to every generated PDF export.</p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => setLocalSettings({ ...localSettings, print_show_timestamp: !(localSettings.print_show_timestamp === 'true' || localSettings.print_show_timestamp === true) })}
                                                        className={`shrink-0 w-14 h-8 rounded-full transition-all relative ${localSettings.print_show_timestamp === 'true' || localSettings.print_show_timestamp === true ? 'bg-amber-500' : 'bg-muted'}`}
                                                    >
                                                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform shadow-md ${localSettings.print_show_timestamp === 'true' || localSettings.print_show_timestamp === true ? 'translate-x-7' : 'translate-x-1'}`} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="bg-muted/30 p-8 rounded-[2rem] border border-border">
                                                <h4 className="text-[11px] font-black text-amber-600 border-b border-border uppercase pb-3 mb-6 flex items-center gap-2 tracking-widest">
                                                    <Calculator className="w-3.5 h-3.5" />
                                                    Report Orientation Overrides
                                                </h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                                    {['pay_bill', 'bank_statement', 'abstract_1', 'abstract_2', 'staff_report', 'pay_certificate'].map(report => (
                                                        <div key={report} className="flex flex-col gap-2">
                                                            <label className="uppercase font-black text-[10px] text-muted-foreground tracking-tighter">{report.replace(/_/g, ' ')}</label>
                                                            <select
                                                                className="px-4 py-3 bg-card border border-border rounded-xl font-bold outline-none text-xs"
                                                                value={localSettings[`print_${report}_orientation`] || ''}
                                                                onChange={e => setLocalSettings({ ...localSettings, [`print_${report}_orientation`]: e.target.value })}
                                                            >
                                                                <option value="">Default (Auto)</option>
                                                                <option value="portrait">Always Portrait</option>
                                                                <option value="landscape">Always Landscape</option>
                                                            </select>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'signatures' && (
                                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-500">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                                                <h3 className="text-2xl font-black text-foreground tracking-tight">Authority Architecture</h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                {[1, 2, 3, 4].map(num => (
                                                    <div key={num} className="bg-secondary/20 p-8 rounded-3xl border border-border hover:border-blue-500/20 transition-all">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <label className="text-[11px] font-black uppercase text-muted-foreground tracking-widest block">Signature Designation {num}</label>
                                                            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-black text-xs">
                                                                {num}
                                                            </div>
                                                        </div>
                                                        <input
                                                            type="text"
                                                            className="w-full px-0 py-2 bg-transparent border-b-2 border-border focus:border-blue-500 outline-none text-xl font-black tracking-tight"
                                                            placeholder={`Designation ${num}`}
                                                            value={localSettings[`sig_${num}_label`] || ''}
                                                            onChange={e => setLocalSettings({ ...localSettings, [`sig_${num}_label`]: e.target.value })}
                                                        />
                                                        <p className="text-[10px] text-muted-foreground mt-3 font-medium opacity-60">Appears on institutional reports in footer block {num}.</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Form Footer */}
                                <div className="px-8 md:px-12 py-10 bg-secondary/50 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <CheckCircle2 className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-black text-xs uppercase tracking-tight">Ready to Deploy</p>
                                            <p className="text-[10px] text-muted-foreground font-medium">Changes apply globally across all connected client nodes.</p>
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="w-full md:w-auto flex items-center justify-center gap-4 px-12 py-5 bg-primary text-white rounded-3xl font-black text-sm shadow-2xl shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                                    >
                                        {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                                        SAVE & SYNC CONFIGURATION
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
