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
    Loader2
} from "lucide-react";

export default function Settings() {
    const { settings, updateGlobalSettings, isLoading: isGlobalLoading } = useSettings();
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
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    const tabs = [
        { id: 'organization', label: 'Organization', icon: Building },
        { id: 'reports', label: 'Report Titles', icon: FileText },
        { id: 'features', label: 'Feature Toggles', icon: ToggleLeft },
        { id: 'print', label: 'Print & Style', icon: Monitor },
        { id: 'signatures', label: 'Signatures', icon: PenTool }
    ];

    return (
        <DashboardLayout activeRoute="settings">
            <div className="max-w-6xl mx-auto py-8 px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">System Configuration</h1>
                    <p className="text-gray-500 mt-1">Manage global enterprise settings and live feature toggles.</p>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar Tabs */}
                    <div className="w-full md:w-64 space-y-1">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]'
                                    : 'text-gray-500 hover:bg-gray-100'
                                    }`}
                            >
                                <tab.icon className="w-5 h-5" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm p-8 max-w-3xl">
                        <form onSubmit={handleSave} className="space-y-8">

                            {activeTab === 'organization' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                    <h3 className="text-lg font-bold border-b pb-2">Branding & Identity</h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Organization Name</label>
                                            <input type="text" className="w-full px-4 py-2 bg-gray-50 border rounded-lg outline-none focus:ring-2 ring-primary/20" value={localSettings.org_name || ''} onChange={e => setLocalSettings({ ...localSettings, org_name: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Full Address</label>
                                            <textarea className="w-full px-4 py-2 bg-gray-50 border rounded-lg outline-none focus:ring-2 ring-primary/20 h-20" value={localSettings.org_address || ''} onChange={e => setLocalSettings({ ...localSettings, org_address: e.target.value })} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Phone</label>
                                                <input type="text" className="w-full px-4 py-2 bg-gray-50 border rounded-lg outline-none focus:ring-2 ring-primary/20" value={localSettings.org_phone || ''} onChange={e => setLocalSettings({ ...localSettings, org_phone: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Email</label>
                                                <input type="text" className="w-full px-4 py-2 bg-gray-50 border rounded-lg outline-none focus:ring-2 ring-primary/20" value={localSettings.org_email || ''} onChange={e => setLocalSettings({ ...localSettings, org_email: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Organization Logo</label>
                                            <div className="flex items-center gap-6 p-6 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 hover:border-primary/40 transition-colors group">
                                                {localSettings.org_logo_url ? (
                                                    <div className="relative">
                                                        <img src={localSettings.org_logo_url} alt="Logo Preview" className="w-24 h-24 object-contain bg-white rounded-lg shadow-sm border p-2" />
                                                        <button
                                                            type="button"
                                                            onClick={() => setLocalSettings({ ...localSettings, org_logo_url: '' })}
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors"
                                                        >
                                                            <ToggleLeft className="w-4 h-4 rotate-45" /> {/* Using an icon that looks like X if possible, or just Trash */}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                                                        <Building className="w-10 h-10 text-gray-300" />
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <p className="text-sm font-bold text-gray-700">Institutional Branding</p>
                                                    <p className="text-xs text-gray-400 mb-4">Upload a high-resolution PNG or JPG logo. This will be used in all reports and certificates.</p>
                                                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-black cursor-pointer hover:bg-gray-100 transition-all shadow-sm active:scale-95">
                                                        <Save className="w-3.5 h-3.5 rotate-90" /> {/* Symbolizing upload */}
                                                        CHOOSE FILE
                                                        <input
                                                            type="file"
                                                            className="hidden"
                                                            accept="image/*"
                                                            onChange={(e) => {
                                                                const file = e.target.files[0];
                                                                if (file) {
                                                                    // Image Compression/Resizing Logic for Enterprise Grade stability
                                                                    const reader = new FileReader();
                                                                    reader.onload = (event) => {
                                                                        const img = new Image();
                                                                        img.onload = () => {
                                                                            const canvas = document.createElement('canvas');
                                                                            const MAX_WIDTH = 800; // Optimal for reports/UI
                                                                            const scale = Math.min(MAX_WIDTH / img.width, 1);

                                                                            canvas.width = img.width * scale;
                                                                            canvas.height = img.height * scale;

                                                                            const ctx = canvas.getContext('2d');
                                                                            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                                                                            // High-quality JPEG compression
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
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'reports' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                    <h3 className="text-lg font-bold border-b pb-2">Custom Report Titles</h3>
                                    <div className="space-y-4">
                                        {['pay_bill', 'bank_statement', 'abstract_1', 'abstract_2', 'staff_master', 'pay_certificate'].map(key => (
                                            <div key={key}>
                                                <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">{key.replace(/_/g, ' ')}</label>
                                                <input type="text" className="w-full px-4 py-2 bg-gray-50 border rounded-lg outline-none focus:ring-2 ring-primary/20" value={localSettings[`title_${key}`] || ''} onChange={e => setLocalSettings({ ...localSettings, [`title_${key}`]: e.target.value })} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'features' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                    <h3 className="text-lg font-bold border-b pb-2">Enable/Disable Modules</h3>
                                    <div className="space-y-4">
                                        {Object.keys(localSettings).filter(k => k.startsWith('enable_')).map(key => (
                                            <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                                <div>
                                                    <p className="font-bold text-gray-700 uppercase text-xs">{key.replace('enable_', '').replace(/_/g, ' ')}</p>
                                                    <p className="text-[10px] text-gray-400">Controls visibility in sidebar and routing</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setLocalSettings({ ...localSettings, [key]: localSettings[key] === 'true' || localSettings[key] === true ? 'false' : 'true' })}
                                                    className={`w-12 h-6 rounded-full transition-colors relative ${localSettings[key] === 'true' || localSettings[key] === true ? 'bg-green-500' : 'bg-gray-300'}`}
                                                >
                                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${localSettings[key] === 'true' || localSettings[key] === true ? 'left-7' : 'left-1'}`} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'print' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                    <h3 className="text-lg font-bold border-b pb-2">Print & Style Defaults</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Main Font Family</label>
                                            <select className="w-full px-4 py-2 bg-gray-50 border rounded-lg" value={localSettings.print_font_family} onChange={e => setLocalSettings({ ...localSettings, print_font_family: e.target.value })}>
                                                <option>Times New Roman</option>
                                                <option>Arial</option>
                                                <option>Inter</option>
                                                <option>serif</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Base Font Size</label>
                                            <input type="text" className="w-full px-4 py-2 bg-gray-50 border rounded-lg" value={localSettings.print_font_size} onChange={e => setLocalSettings({ ...localSettings, print_font_size: e.target.value })} />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-primary border-b uppercase pb-1">Report Orientation Overrides</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            {['pay_bill', 'bank_statement', 'abstract_1', 'abstract_2', 'staff_master', 'pay_certificate'].map(report => (
                                                <div key={report} className="flex flex-col gap-1 text-xs">
                                                    <label className="uppercase font-bold text-gray-500">{report.replace(/_/g, ' ')}</label>
                                                    <select
                                                        className="px-2 py-1.5 bg-gray-50 border rounded-md outline-none"
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

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                        <p className="font-bold text-gray-700 text-xs uppercase">Show Auto-Timestamp</p>
                                        <input type="checkbox" checked={localSettings.print_show_timestamp === 'true' || localSettings.print_show_timestamp === true} onChange={e => setLocalSettings({ ...localSettings, print_show_timestamp: e.target.checked ? 'true' : 'false' })} />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'signatures' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                    <h3 className="text-lg font-bold border-b pb-2">Authority Signature Labels</h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        {[1, 2, 3, 4].map(num => (
                                            <div key={num}>
                                                <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Signature Label {num}</label>
                                                <input type="text" className="w-full px-4 py-2 bg-gray-50 border rounded-lg" value={localSettings[`sig_${num}_label`] || ''} onChange={e => setLocalSettings({ ...localSettings, [`sig_${num}_label`]: e.target.value })} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="pt-8 border-t flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex items-center gap-3 px-10 py-4 bg-primary text-white rounded-2xl font-black shadow-2xl hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    SAVE & APPLY GLOBALLY
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
