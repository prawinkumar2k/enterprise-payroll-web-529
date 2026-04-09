
import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Shield, Plus, Clock, AlertCircle, CheckCircle2, Camera, MapPin, X } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { toast } from 'sonner';

export default function EmployeePermissions() {
    const queryClient = useQueryClient();
    const [isApplying, setIsApplying] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);
    const [selfie, setSelfie] = useState(null);
    const [location, setLocation] = useState(null);
    const [formData, setFormData] = useState({
        permission_type: 'Late Entry',
        date: '',
        from_time: '',
        to_time: '',
        reason: ''
    });

    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const getGPS = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }),
                () => toast.error('GPS Required for Permission Authentication')
            );
        }
    };

    useEffect(() => {
        if (isApplying) getGPS();
    }, [isApplying]);

    const startCamera = async () => {
        try {
            setIsCapturing(true);
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
            if (videoRef.current) videoRef.current.srcObject = stream;
        } catch {
            toast.error('Camera access denied');
            setIsCapturing(false);
        }
    };

    const captureSelfie = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (video && canvas) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0);

            // Inject "Map Cam" Overlay
            const barHeight = 60;
            ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            ctx.fillRect(0, canvas.height - barHeight, canvas.width, barHeight);
            
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 16px Inter, sans-serif";
            ctx.fillText(`${location?.lat.toFixed(6)}, ${location?.lng.toFixed(6)}`, 20, canvas.height - 30);
            
            ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
            ctx.font = "10px Inter, sans-serif";
            ctx.fillText(`${new Date().toLocaleString()} | ACCURACY: ${location?.accuracy?.toFixed(1) || '0'}m | AUTH: PERMISSION`, 20, canvas.height - 12);

            const data = canvas.toDataURL('image/jpeg', 0.8);
            setSelfie(data);
            
            const stream = video.srcObject;
            if (stream) stream.getTracks().forEach(t => t.stop());
            setIsCapturing(false);
        }
    };

    const { data: permResult } = useQuery({
        queryKey: ['my-permissions'],
        queryFn: () => axios.get('/api/employee/permission/my', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).then(res => res.data)
    });

    const submitPerm = useMutation({
        mutationFn: (data) => axios.post('/api/employee/permission/apply', data, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        onSuccess: () => {
            queryClient.invalidateQueries(['my-permissions']);
            toast.success('Permission submitted with GPS Map Cam verification!');
            setIsApplying(false);
            setSelfie(null);
            setFormData({ permission_type: 'Late Entry', date: '', from_time: '', to_time: '', reason: '' });
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to submit request')
    });

    return (
        <DashboardLayout activeRoute="my-permissions">
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight">Mission Permissions</h1>
                        <p className="text-muted-foreground text-sm font-medium">Capture biometric identity and GPS location for mission authorization.</p>
                    </div>
                    {!isApplying && (
                        <button 
                            onClick={() => setIsApplying(true)}
                            className="bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2 hover:opacity-95 shadow-xl active:scale-95 transition"
                        >
                            <Plus className="w-4 h-4" /> Request Authorization
                        </button>
                    )}
                </div>

                {isApplying && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Biometric Verification Layer */}
                        <div className="lg:col-span-12 xl:col-span-5 bg-card border border-border rounded-[2.5rem] p-8 space-y-8">
                             <div className="flex items-center justify-between">
                                <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <Camera className="w-4 h-4" /> Identity Layer (Map Cam)
                                </h2>
                                {location && <span className="text-[8px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded uppercase tracking-widest ring-1 ring-emerald-500/20">Signal Locked</span>}
                             </div>

                             {!selfie && !isCapturing && (
                                <button 
                                    onClick={startCamera}
                                    className="w-full aspect-video bg-muted/40 rounded-[2rem] border-2 border-dashed border-border/60 flex flex-col items-center justify-center gap-4 hover:bg-muted/60 transition-all group"
                                >
                                    <Camera className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Activate Biometric Scan</p>
                                </button>
                             )}

                             {isCapturing && (
                                <div className="w-full aspect-video bg-black rounded-[2rem] overflow-hidden relative shadow-2xl">
                                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
                                    <div className="absolute bottom-6 inset-x-0 flex justify-center">
                                        <button 
                                            onClick={captureSelfie}
                                            className="bg-white text-black font-black px-10 py-3 rounded-full text-[10px] uppercase tracking-widest shadow-2xl active:scale-95 transition"
                                        >
                                            Capture & Verify
                                        </button>
                                    </div>
                                </div>
                             )}

                             {selfie && (
                                <div className="w-full aspect-video rounded-[2rem] overflow-hidden relative border-2 border-primary/20 group">
                                    <img src={selfie} className="w-full h-full object-cover" alt="Verified Identity" />
                                    <button 
                                        onClick={() => setSelfie(null)}
                                        className="absolute top-4 right-4 bg-black/60 text-white p-2 rounded-xl hover:bg-red-500 opacity-0 group-hover:opacity-100 transition shadow-lg"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                    <div className="absolute bottom-4 left-4">
                                        <span className="bg-emerald-500 text-white text-[9px] font-black px-3 py-1.5 rounded-lg shadow-xl uppercase tracking-widest flex items-center gap-2">
                                            <CheckCircle2 className="w-3.5 h-3.5" /> Biometrics Locked
                                        </span>
                                    </div>
                                </div>
                             )}

                             <canvas ref={canvasRef} className="hidden" />

                             <div className={`p-5 rounded-2xl border flex items-center gap-4 ${location ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-muted border-border'}`}>
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                    <MapPin className={`w-5 h-5 ${location ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Sovereign Position</p>
                                    <p className="text-xs font-black text-foreground">{location ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}` : 'Waiting for GNSS signal...'}</p>
                                </div>
                             </div>
                        </div>

                        {/* Request Form Layer */}
                        <div className="lg:col-span-12 xl:col-span-7 bg-card border border-border rounded-[2.5rem] p-10 shadow-sm animate-in zoom-in-95">
                            <h3 className="text-lg font-black uppercase tracking-tighter mb-8 italic">Authorization Objectives</h3>
                            <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); submitPerm.mutate({ ...formData, selfie }); }}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Operational Nature</label>
                                        <select 
                                            className="w-full bg-muted/40 border-2 border-border/50 rounded-2xl p-4 text-xs font-black uppercase focus:ring-4 focus:ring-primary/5 focus:border-primary transition outline-none"
                                            value={formData.permission_type}
                                            onChange={e => setFormData({ ...formData, permission_type: e.target.value })}
                                        >
                                            <option>Late Entry</option>
                                            <option>Early Exit</option>
                                            <option>Short Leave</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Session Date</label>
                                        <input type="date" className="w-full bg-muted/40 border-2 border-border/50 rounded-2xl p-4 text-xs font-black focus:ring-4 focus:ring-primary/5 focus:border-primary transition outline-none" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Start Time</label>
                                        <input type="time" className="w-full bg-muted/40 border-2 border-border/50 rounded-2xl p-4 text-xs font-black focus:ring-4 focus:ring-primary/5 focus:border-primary transition outline-none" value={formData.from_time} onChange={e => setFormData({ ...formData, from_time: e.target.value })} required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">End Time</label>
                                        <input type="time" className="w-full bg-muted/40 border-2 border-border/50 rounded-2xl p-4 text-xs font-black focus:ring-4 focus:ring-primary/5 focus:border-primary transition outline-none" value={formData.to_time} onChange={e => setFormData({ ...formData, to_time: e.target.value })} required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Detailed Briefing (Reason)</label>
                                    <textarea 
                                        placeholder="Explain the mission requirements for this authorization..."
                                        className="w-full bg-muted/40 border-2 border-border/50 rounded-[2rem] p-6 text-sm font-medium focus:ring-4 focus:ring-primary/5 focus:border-primary transition outline-none min-h-[140px] leading-relaxed"
                                        value={formData.reason}
                                        onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="flex justify-end gap-5 pt-4">
                                    <button type="button" onClick={() => setIsApplying(false)} className="px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-muted transition">Abort Request</button>
                                    <button 
                                        type="submit" 
                                        disabled={submitPerm.isLoading || !selfie} 
                                        className="bg-slate-900 border border-slate-800 text-white px-12 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:bg-black disabled:opacity-30 transition-all active:scale-[0.98]"
                                    >
                                        {submitPerm.isLoading ? 'Dispatching...' : 'Authenticate & Submit'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {!isApplying && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {permResult?.permissions?.map((perm) => (
                            <div key={perm.id} className="bg-card border border-border rounded-[2.5rem] overflow-hidden hover:border-primary/20 transition-all group shadow-sm flex flex-col">
                                {perm.selfie_url && (
                                    <div className="aspect-video bg-muted relative">
                                        <img src={perm.selfie_url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" alt="Verification" />
                                        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white text-[8px] font-black px-2 py-1 rounded uppercase tracking-[0.2em]">Map Cam Verified</div>
                                    </div>
                                )}
                                <div className="p-8 space-y-6 flex-1 flex flex-col">
                                    <div className="flex items-center justify-between">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                            <Shield className="w-5 h-5" />
                                        </div>
                                        <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ring-1 ${
                                            perm.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500 ring-emerald-500/20' : 
                                            perm.status === 'REJECTED' ? 'bg-destructive/10 text-destructive ring-destructive/20' : 'bg-amber-500/10 text-amber-500 ring-amber-500/20'
                                        }`}>
                                            {perm.status}
                                        </span>
                                    </div>
                                    <div>
                                        <h4 className="font-black text-foreground uppercase tracking-tight text-lg leading-tight mb-2">{perm.permission_type}</h4>
                                        <div className="flex flex-col gap-1.5 opacity-60">
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase">
                                                <Calendar className="w-3.5 h-3.5" /> {new Date(perm.date).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase">
                                                <Clock className="w-3.5 h-3.5" /> {perm.from_time} - {perm.to_time}
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-[11px] font-medium text-muted-foreground leading-relaxed flex-1 italic bg-muted/40 p-4 rounded-2xl border border-border/50">
                                        &ldquo;{perm.reason}&rdquo;
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                {permResult?.permissions?.length === 0 && !isApplying && (
                    <div className="py-24 text-center bg-muted/20 border-2 border-dashed rounded-[3rem] opacity-60">
                         <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-5 animate-pulse" />
                         <p className="text-sm font-black text-muted-foreground uppercase tracking-[0.2em] leading-none italic">Scanning for authorized missions...</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

function Calendar(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
        </svg>
    )
}
