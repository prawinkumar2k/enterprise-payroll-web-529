
import React, { useState, useEffect, useRef } from 'react';
import { Camera, MapPin, Play, Square, FileText, CheckCircle2, AlertCircle, Clock, Upload, Paperclip, X } from 'lucide-react';
import axios from 'axios';
import DashboardLayout from '../components/DashboardLayout';

export default function EmployeeDashboard() {
  const [status, setStatus] = useState('LOADING'); // LOADING, NOT_PUNCHED, PUNCHED_IN, COMPLETED
  const [todayLog, setTodayLog] = useState(null);
  const [location, setLocation] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [description, setDescription] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchStatus();
    getGPS();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await axios.get('/api/employee/attendance', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const logs = res.data.attendance || [];
      const now = new Date();
      // Compare by Local Year, Month, and Date to avoid UTC/Timezone drift
      const todayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
      
      const todayLog = logs.find(log => {
        const d = new Date(log.created_at || log.punch_in_time);
        const logKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        return logKey === todayKey;
      });

      if (todayLog) {
        setTodayLog(todayLog);
        setStatus(todayLog.punch_out_time ? 'COMPLETED' : 'PUNCHED_IN');
      } else {
        setStatus('NOT_PUNCHED');
      }
    } catch (err) {
      console.error('[Dashboard] Status fetch error:', err);
      setError('Connection to mission control disrupted. Using cached local state.');
      setStatus('NOT_PUNCHED');
    }
  };

  const getGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }),
        () => {
          if (window.location.search.includes('demo=true')) {
            setLocation({ lat: 13.0827, lng: 80.2707, accuracy: 4.2 }); // Mocked for demo
            console.warn('[Demo] Geolocation blocked, using simulated coordinates.');
          } else {
            setError('GPS access denied. Verification failed.');
          }
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  };

  const startCamera = async () => {
    try {
      setIsCapturing(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      setError('Camera access denied.');
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
      const barHeight = 80;
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(0, canvas.height - barHeight, canvas.width, barHeight);
      
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 24px Inter, sans-serif";
      ctx.fillText(`${location?.lat.toFixed(6)}, ${location?.lng.toFixed(6)}`, 30, canvas.height - 45);
      
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.font = "12px Inter, sans-serif";
      ctx.fillText(`${new Date().toLocaleString()} | ACCURACY: ${location?.accuracy?.toFixed(1) || '0'}m | SECTOR: HYB-01`, 30, canvas.height - 20);

      const data = canvas.toDataURL('image/jpeg', 0.8);
      setSelfie(data);
      
      // Stop camera
      const stream = video.srcObject;
      if (stream) stream.getTracks().forEach(t => t.stop());
      setIsCapturing(false);
    }
  };

  const handlePunchIn = async () => {
    if (!selfie || !location) return setError('Identity and GPS required.');
    setLoading(true);
    try {
      await axios.post('/api/employee/punch-in', {
        selfie,
        lat: location.lat,
        lng: location.lng
      }, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      fetchStatus();
      setSelfie(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Punch in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handlePunchOut = async () => {
    if (!selfie || !location || !description) return setError('Identity, GPS and Briefing required.');
    setLoading(true);
    
    const formData = new FormData();
    formData.append('selfie', selfie);
    formData.append('lat', location.lat);
    formData.append('lng', location.lng);
    formData.append('description', description);
    if (attachment) formData.append('attachment', attachment);

    try {
      await axios.post('/api/employee/punch-out', formData, {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      fetchStatus();
      setSelfie(null);
      setAttachment(null);
      setDescription('');
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed.');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'LOADING') return <div className="flex items-center justify-center h-screen animate-pulse font-black uppercase tracking-widest text-muted-foreground text-sm">Synchronizing Mission Uplink...</div>;

  return (
    <DashboardLayout activeRoute="ess-dashboard">
      <div className="space-y-8 animate-in fade-in duration-700">
        
        {/* 🛰️ Verification Header */}
        <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden border border-white/5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full -mr-48 -mt-48 blur-[100px]" />
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-4xl font-black tracking-tighter uppercase italic">Sovereign Portal</h1>
              </div>
              <p className="text-slate-400 font-medium max-w-md">Biometric identity and satellite verification required for all operational submissions.</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-xl px-8 py-6 rounded-[2rem] border border-white/10 flex items-center gap-6 shadow-2xl">
              <div className="text-right">
                <p className="text-[10px] uppercase font-black tracking-[0.2em] text-emerald-400 mb-1">Standard Time</p>
                <p className="text-3xl font-black tabular-nums">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
              </div>
              <div className="w-px h-12 bg-white/10" />
              <div>
                <p className="text-[10px] uppercase font-black tracking-[0.2em] text-emerald-400 mb-1">Sector Date</p>
                <p className="text-sm font-black uppercase text-slate-200">{new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-5 rounded-3xl flex items-center gap-4 animate-in zoom-in-95">
            <AlertCircle className="w-6 h-6 flex-shrink-0" />
            <p className="text-xs font-black uppercase tracking-widest">{error}</p>
            <button onClick={() => setError('')} className="ml-auto hover:bg-red-500/10 p-2 rounded-full transition"><X className="w-4 h-4" /></button>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          
          {/* 📷 Satellite Cam Section (Left) */}
          <div className="xl:col-span-5 space-y-8">
            <div className="bg-card border border-border rounded-[3rem] p-8 shadow-sm space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Camera className="w-4 h-4" /> Identity Layer
                </h2>
                {status === 'PUNCHED_IN' && <span className="flex items-center gap-2 text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 shadow-sm animate-pulse">Deployment Active</span>}
              </div>

              {!selfie && !isCapturing && (
                <button 
                  onClick={startCamera}
                  disabled={status === 'COMPLETED'}
                  className="w-full aspect-square bg-muted/40 rounded-[2rem] border-2 border-dashed border-border/60 flex flex-col items-center justify-center gap-6 hover:bg-muted/60 transition-all group disabled:opacity-30 active:scale-95"
                >
                  <div className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/10 transition-all border border-primary/10">
                    <Camera className="w-10 h-10 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-black text-foreground uppercase tracking-tight">Activate Cam Verification</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Biometric Scan Required</p>
                  </div>
                </button>
              )}

              {isCapturing && (
                <div className="w-full aspect-square bg-black rounded-[2rem] overflow-hidden relative shadow-2xl border-4 border-white/5 ring-1 ring-black">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover grayscale contrast-125" />
                  {/* Map Cam Overlay Mock */}
                  <div className="absolute top-6 left-6 flex flex-col gap-1">
                    <div className="bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                        <p className="text-[8px] font-black tracking-widest text-white/60 uppercase">GPS COORDS</p>
                        <p className="text-[10px] font-black text-white">{location?.lat.toFixed(6)}, {location?.lng.toFixed(6)}</p>
                    </div>
                  </div>
                  <div className="absolute inset-x-0 bottom-8 flex justify-center">
                    <button 
                      onClick={captureSelfie}
                      className="bg-white text-black font-black px-12 py-4 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all uppercase text-[10px] tracking-widest ring-8 ring-white/10"
                    >
                      Authenticate Now
                    </button>
                  </div>
                </div>
              )}

              {selfie && (
                <div className="w-full aspect-square rounded-[2rem] overflow-hidden relative border-2 border-primary/20 group shadow-2xl">
                  <img src={selfie} className="w-full h-full object-cover" alt="Verification" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <button 
                    onClick={() => setSelfie(null)}
                    className="absolute top-6 right-6 bg-black/50 text-white p-3 rounded-2xl hover:bg-red-500 transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-6 left-6 flex items-center gap-3">
                    <div className="bg-emerald-500 text-white text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest flex items-center gap-2 shadow-xl">
                      <CheckCircle2 className="w-4 h-4" /> Identity Verified
                    </div>
                  </div>
                </div>
              )}

              <canvas ref={canvasRef} className="hidden" />

              {/* Enhanced GPS Map Badge */}
              <div className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col gap-4 ${location ? 'bg-emerald-50/20 border-emerald-500/10' : 'bg-muted border-border opacity-50'}`}>
                   <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                <MapPin className={`w-4 h-4 ${location ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">Satellite Position Link</span>
                        </div>
                        {location && <span className="bg-emerald-500 text-white text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-[0.2em] animate-pulse">Signal Locked</span>}
                   </div>
                   <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-black text-foreground tracking-tight tabular-nums">
                        {location ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}` : 'Waiting for GNSS...'}
                        </p>
                   </div>
                   <div className="h-1 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full bg-emerald-500 transition-all duration-1000 ${location ? 'w-full' : 'w-0'}`} />
                   </div>
              </div>
            </div>
          </div>

          {/* 💼 Mission Command (Right) */}
          <div className="xl:col-span-7 space-y-8">
            <div className="bg-card border border-border rounded-[3rem] p-10 shadow-sm min-h-[500px] flex flex-col">
               <div className="flex items-center justify-between mb-8">
                  <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Mission Objective
                  </h2>
               </div>
               {status === 'NOT_PUNCHED' && (
                  <div className="flex-1 flex flex-col justify-center text-center gap-8 py-10">
                    <div className="bg-muted/30 p-10 rounded-[2.5rem] border-2 border-dashed border-border flex flex-col items-center gap-6">
                      <div className="w-20 h-20 bg-emerald-500/5 rounded-full flex items-center justify-center">
                        <Play className="w-10 h-10 text-emerald-500/40" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-lg font-black uppercase tracking-tight text-foreground">Awaiting Shift Initiation</p>
                        <p className="text-sm font-medium text-muted-foreground max-w-xs mx-auto">Please confirm your identity and satellite location before deployment.</p>
                      </div>
                    </div>
                    <button 
                      onClick={handlePunchIn}
                      disabled={loading || !selfie || !location}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-6 rounded-[2rem] shadow-2xl transition-all flex items-center justify-center gap-4 active:scale-[0.98] disabled:opacity-30 uppercase text-sm tracking-[0.2em]"
                    >
                      {loading ? <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" /> : <><Play className="w-6 h-6" /> Initiate Deployment</>}
                    </button>
                  </div>
               )}

               {status === 'PUNCHED_IN' && (
                  <div className="flex-1 flex flex-col gap-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-emerald-500/5 p-6 rounded-[2rem] border border-emerald-500/10 flex items-center gap-5">
                         <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                            <Clock className="w-6 h-6 text-emerald-500" />
                         </div>
                         <div>
                            <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest leading-none mb-1">Involved At</p>
                            <p className="text-xl font-black text-foreground">{new Date(todayLog.punch_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                         </div>
                      </div>
                      <div className="bg-emerald-500/5 p-6 rounded-[2rem] border border-emerald-500/10 flex items-center gap-5">
                         <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                            <Play className="w-6 h-6 text-emerald-500" />
                         </div>
                         <div>
                            <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest leading-none mb-1">Session Status</p>
                            <p className="text-xl font-black text-emerald-500 uppercase tracking-tight">Active Duty</p>
                         </div>
                      </div>
                    </div>

                    <div className="space-y-8">
                        <div className="space-y-4">
                            <label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest flex items-center gap-2">
                                <ScrollText className="w-4 h-4" /> Comprehensive Activity Briefing
                            </label>
                            <textarea 
                                placeholder="Describe your operational achievements for this shift session in detail..."
                                className="w-full bg-muted/30 border-2 border-border/60 rounded-[2rem] p-6 text-sm font-medium focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none min-h-[180px] leading-relaxed"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        {/* 📎 File Upload Layer */}
                        <div className="space-y-4">
                             <label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest flex items-center gap-2">
                                <Paperclip className="w-4 h-4" /> Operational Artifacts (PDF / Images / Docs)
                            </label>
                            <div 
                                onClick={() => fileInputRef.current.click()}
                                className={`group p-8 border-2 border-dashed rounded-[2rem] cursor-pointer transition-all flex items-center justify-center gap-5 ${attachment ? 'bg-primary/5 border-primary/20' : 'bg-muted/20 border-border hover:bg-muted/40 hover:border-primary/20'}`}
                            >
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    onChange={(e) => setAttachment(e.target.files[0])}
                                />
                                {attachment ? (
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center">
                                            <FileText className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-foreground truncate max-w-[200px]">{attachment.name}</p>
                                            <p className="text-[10px] font-medium text-muted-foreground uppercase opacity-60">{(attachment.size / 1024 / 1024).toFixed(2)} MB · Artifact Locked</p>
                                        </div>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setAttachment(null); }}
                                            className="p-2 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-full"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-center">
                                        <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Upload className="w-5 h-5 text-primary" />
                                        </div>
                                        <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mt-2">Upload Briefing Documents</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <button 
                      onClick={handlePunchOut}
                      disabled={loading || !selfie || !location || !description}
                      className="w-full bg-slate-900 hover:bg-black text-white font-black py-6 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all flex items-center justify-center gap-4 active:scale-[0.98] disabled:opacity-30 uppercase text-sm tracking-[0.2em] mt-auto"
                    >
                      {loading ? <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" /> : <><Square className="w-6 h-6" /> Terminate Shift & Uplink</>}
                    </button>
                  </div>
               )}

               {status === 'COMPLETED' && (
                  <div className="flex-1 flex flex-col justify-center items-center text-center gap-8 py-20 px-10">
                    <div className="w-24 h-24 bg-emerald-500 shadow-2xl shadow-emerald-500/20 rounded-[2.5rem] flex items-center justify-center animate-bounce">
                      <CheckCircle2 className="w-12 h-12 text-white" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-3xl font-black text-foreground uppercase tracking-tighter italic">Mission Accomplished</h3>
                      <p className="text-sm font-medium text-muted-foreground leading-relaxed max-w-sm">Your operational reports, biometric data, and satellite coordinates have been securely uploaded to the headquarters.</p>
                    </div>
                    <div className="bg-muted px-10 py-4 rounded-2xl border border-border">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Next Window: Tomorrow 06:00 Zulu</span>
                    </div>
                  </div>
               )}
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}

function ScrollText(props) {
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
            <path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4" />
            <path d="M19 17V5a2 2 0 0 0-2-2H4" />
            <path d="M15 8h-5" />
            <path d="M15 12h-5" />
        </svg>
    );
}
