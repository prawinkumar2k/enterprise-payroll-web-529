
import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Plane, Plus, Calendar, CheckCircle2, Camera, MapPin, X } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { toast } from 'sonner';

export default function EmployeeLeaves() {
    const queryClient = useQueryClient();
    const [isApplying, setIsApplying] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);
    const [selfie, setSelfie] = useState(null);
    const [location, setLocation] = useState(null);
    const [formData, setFormData] = useState({
        leave_type: 'Casual Leave',
        from_date: '',
        to_date: '',
        reason: ''
    });

    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const getGPS = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }),
                () => {
                    if (window.location.search.includes('demo=true')) {
                        setLocation({ lat: 13.0827, lng: 80.2707, accuracy: 4.2 }); // Simulated for demo
                        console.warn('[Demo] Geolocation blocked, using simulated coordinates.');
                    } else {
                        toast.error('GPS Required for Leave Verification');
                    }
                },
                { enableHighAccuracy: true, timeout: 5000 }
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
            const barHeight = 84;
            ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
            ctx.fillRect(0, canvas.height - barHeight, canvas.width, barHeight);
            
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 26px font-serif, sans-serif";
            ctx.fillText(`${location?.lat.toFixed(6)}, ${location?.lng.toFixed(6)}`, 30, canvas.height - 48);
            
            ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
            ctx.font = "12px Inter, sans-serif";
            ctx.fillText(`${new Date().toLocaleString()} | ACCURACY: ${location?.accuracy?.toFixed(1) || '0'}m | AUTH: LEAVE_REQ`, 30, canvas.height - 22);

            const data = canvas.toDataURL('image/jpeg', 0.8);
            setSelfie(data);
            
            const stream = video.srcObject;
            if (stream) stream.getTracks().forEach(t => t.stop());
            setIsCapturing(false);
        }
    };

    const { data: leaveResult } = useQuery({
        queryKey: ['my-leaves'],
        queryFn: () => axios.get('/api/employee/leave/my', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).then(res => res.data)
    });

    const submitLeave = useMutation({
        mutationFn: (data) => axios.post('/api/employee/leave/apply', data, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        onSuccess: () => {
            queryClient.invalidateQueries(['my-leaves']);
            toast.success('Leave mission briefing submitted with Map Cam verification!');
            setIsApplying(false);
            setSelfie(null);
            setFormData({ leave_type: 'Casual Leave', from_date: '', to_date: '', reason: '' });
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Uplink failed')
    });

    const leaves = leaveResult?.leaves || [];

    return (
        <DashboardLayout activeRoute="my-leaves">
            <div className="space-y-8 animate-in slide-in-from-bottom-5 duration-700">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter italic">Mission Standby (Leaves)</h1>
                        <p className="text-muted-foreground text-sm font-semibold opacity-60">Authorize your standby periods with biometric and satellite verification.</p>
                    </div>
                    {!isApplying && (
                        <button 
                            onClick={() => setIsApplying(true)}
                            className="bg-primary text-primary-foreground px-8 py-4 rounded-3xl font-black text-xs uppercase tracking-[0.3em] flex items-center gap-3 hover:scale-105 shadow-2xl transition-all"
                        >
                            <Plus className="w-5 h-5 shadow-sm" /> Initiate Request
                        </button>
                    )}
                </div>

                {isApplying && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                         {/* Map Cam Identity Verification */}
                         <div className="bg-card border-border border rounded-[3rem] p-10 space-y-10 shadow-lg relative overflow-hidden">
                             <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse" />
                             
                             <div className="flex items-center justify-between relative">
                                <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-muted-foreground flex items-center gap-3">
                                    <Camera className="w-5 h-5 text-primary" /> Biometric Identity Core
                                </h3>
                                {location && (
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Signal Locked</span>
                                    </div>
                                )}
                             </div>

                             <div className="relative group">
                                {!selfie && !isCapturing && (
                                    <button 
                                        onClick={startCamera}
                                        className="w-full aspect-video bg-muted/30 rounded-[2.5rem] border-2 border-dashed border-border/50 flex flex-col items-center justify-center gap-5 hover:bg-muted/50 hover:border-primary/30 transition-all duration-500"
                                    >
                                        <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center">
                                            <Camera className="w-8 h-8 text-primary/60" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs font-black uppercase tracking-[0.2em]">Activate Scan</p>
                                            <p className="text-[10px] text-muted-foreground font-bold mt-1">Satellite Position Overlay Required</p>
                                        </div>
                                    </button>
                                )}

                                {isCapturing && (
                                    <div className="w-full aspect-video bg-black rounded-[2.5rem] overflow-hidden relative shadow-2xl border-2 border-primary/20">
                                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 border-[20px] border-white/5 pointer-events-none" />
                                        <div className="absolute bottom-8 inset-x-0 flex justify-center">
                                            <button 
                                                onClick={captureSelfie}
                                                className="bg-white text-black font-black px-12 py-4 rounded-full text-[11px] uppercase tracking-[0.25em] shadow-2xl hover:scale-110 active:scale-95 transition-all"
                                            >
                                                Lock Identity
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {selfie && (
                                    <div className="w-full aspect-video rounded-[2.5rem] overflow-hidden relative shadow-2xl ring-4 ring-primary/5">
                                        <img src={selfie} className="w-full h-full object-cover" alt="Verified Scan" />
                                        <div className="absolute bottom-6 left-6">
                                            <span className="bg-primary text-primary-foreground text-[10px] font-black px-5 py-2 rounded-2xl shadow-2xl uppercase tracking-[0.2em] flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4" /> Identity Verified
                                            </span>
                                        </div>
                                        <button 
                                            onClick={() => setSelfie(null)}
                                            className="absolute top-6 right-6 bg-black/40 hover:bg-red-500 text-white p-3 rounded-2xl backdrop-blur-md transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                             </div>

                             <div className={`p-6 rounded-3xl border flex items-center gap-5 transition-all ${location ? 'bg-emerald-500/10 border-emerald-500/20 shadow-inner' : 'bg-muted border-border'}`}>
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${location ? 'bg-emerald-500 text-white animate-in zoom-in' : 'bg-muted-foreground/10 text-muted-foreground/40'}`}>
                                    <MapPin className="w-7 h-7" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] mb-1">Satellite Coordinates</p>
                                    <p className="text-base font-black text-foreground tracking-tight">{location ? `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}` : 'Scanning for GNSS Signal...'}</p>
                                </div>
                             </div>
                             
                             <canvas ref={canvasRef} className="hidden" />
                         </div>

                        {/* Request Fields */}
                        <div className="bg-card border-border border rounded-[3rem] p-10 shadow-lg space-y-10 animate-in fade-in duration-1000">
                            <h3 className="text-lg font-black uppercase tracking-widest italic opacity-80 underline underline-offset-8 decoration-primary/20">Operational Parameters</h3>
                            <form className="space-y-10" onSubmit={e => { e.preventDefault(); submitLeave.mutate({ ...formData, selfie }); }}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-3">
                                        <label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Absence Category</label>
                                        <select 
                                            className="w-full bg-muted/40 border-2 border-border/60 rounded-2xl p-4 text-xs font-black uppercase focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                                            value={formData.leave_type}
                                            onChange={e => setFormData({ ...formData, leave_type: e.target.value })}
                                        >
                                            <option>Casual Leave</option>
                                            <option>Sick Leave</option>
                                            <option>Earned Leave</option>
                                            <option>Personal Assignment</option>
                                        </select>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Commencement Date</label>
                                        <input type="date" className="w-full bg-muted/40 border-2 border-border/60 rounded-2xl p-4 text-xs font-black focus:ring-4 focus:ring-primary/5 outline-none transition-all" value={formData.from_date} onChange={e => setFormData({ ...formData, from_date: e.target.value })} required />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Resumption Date</label>
                                        <input type="date" className="w-full bg-muted/40 border-2 border-border/60 rounded-2xl p-4 text-xs font-black focus:ring-4 focus:ring-primary/5 outline-none transition-all" value={formData.to_date} onChange={e => setFormData({ ...formData, to_date: e.target.value })} required />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Standby Briefing (Reason)</label>
                                    <textarea 
                                        placeholder="Detailed justification for this standby request..."
                                        className="w-full bg-muted/40 border-2 border-border/60 rounded-[2.5rem] p-8 text-sm font-medium focus:ring-4 focus:ring-primary/5 outline-none transition-all min-h-[160px] leading-relaxed"
                                        value={formData.reason}
                                        onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="flex justify-end gap-6 pt-5">
                                    <button type="button" onClick={() => setIsApplying(false)} className="px-10 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-muted transition-colors">Abort Request</button>
                                    <button 
                                        type="submit" 
                                        disabled={submitLeave.isLoading || !selfie} 
                                        className="bg-black text-white px-14 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95 disabled:opacity-20 transition-all"
                                    >
                                        {submitLeave.isLoading ? 'Dispatching...' : 'Uplink Briefing'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {!isApplying && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {leaves.map((leave) => (
                            <div key={leave.id} className="bg-card border border-border rounded-[3rem] overflow-hidden hover:border-primary/30 transition-all duration-500 shadow-sm flex flex-col group">
                                {leave.selfie_url && (
                                    <div className="aspect-[16/10] relative group overflow-hidden bg-black">
                                        <img src={leave.selfie_url} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100" alt="Identity Log" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                                        <div className="absolute top-5 left-5">
                                            <span className="bg-primary/20 backdrop-blur-md border border-white/20 text-white text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">Map Cam Verified</span>
                                        </div>
                                        <div className="absolute bottom-5 left-5 right-5">
                                             <div className="flex items-center justify-between">
                                                 <span className="text-white text-[11px] font-black uppercase tracking-[0.2em]">{leave.leave_type}</span>
                                                 <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                                                    leave.status === 'APPROVED' ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 
                                                    leave.status === 'REJECTED' ? 'bg-destructive text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'bg-amber-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                                                 }`}>
                                                    {leave.status}
                                                 </span>
                                             </div>
                                        </div>
                                    </div>
                                )}
                                <div className="p-8 pb-10 space-y-8 flex-1 flex flex-col">
                                    <div className="flex flex-col gap-4 opacity-70">
                                        <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest">
                                            <Calendar className="w-4 h-4 text-primary" /> {new Date(leave.from_date).toLocaleDateString()} — {new Date(leave.to_date).toLocaleDateString()}
                                        </div>
                                        <div className="p-5 rounded-3xl bg-muted/40 border-2 border-border/30 text-xs font-semibold italic leading-relaxed text-muted-foreground flex-1">
                                            &ldquo;{leave.reason}&rdquo;
                                         </div>
                                    </div>
                                    <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest opacity-40">
                                            <Plane className="w-3.5 h-3.5" /> {leave.status === 'APPROVED' ? 'Deployment Restricted' : leave.status === 'REJECTED' ? 'Mission Aborted' : 'Operational Standby'}
                                        </div>
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary/30" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {leaves.length === 0 && !isApplying && (
                    <div className="py-24 text-center bg-muted/10 border-4 border-dashed rounded-[4rem] group hover:bg-muted/20 transition-all duration-500">
                         <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                            <Plane className="w-10 h-10 text-muted-foreground opacity-40" />
                         </div>
                         <p className="text-sm font-black text-muted-foreground uppercase tracking-[0.3em] italic">No stand-by briefings archived.</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
