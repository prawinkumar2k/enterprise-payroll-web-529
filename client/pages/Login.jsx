import React, { useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, User, Fingerprint } from "lucide-react";
import { useSettings } from "../context/SettingsContext";
import { loginReducer, initialLoginState } from "@/src/reducers/loginReducer";

export default function Login() {
  const { settings } = useSettings();
  const [state, dispatch] = useReducer(loginReducer, initialLoginState);
  const { userId, password, showPassword, isLoading, error } = state;
  const navigate = useNavigate();

  const orgName = settings.org_name || 'Enterprise Payroll';

  const [loginMode, setLoginMode] = useState('company'); // 'company' | 'employee'

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch({ type: 'SUBMIT_START' });

    try {
      const endpoint = '/api/auth/login';
      const body = JSON.stringify({ userId, password, loginMode });

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Login successful
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.dispatchEvent(new Event('settings:reload'));

      const isEmployee = (data.user?.role || '').toLowerCase() === 'employee';
      const target = isEmployee ? '/employee/dashboard' : '/dashboard';
      navigate(target);
    } catch (err) {
      dispatch({ type: 'SUBMIT_ERROR', error: err.message || "Invalid credentials. Please try again." });
    }
  };

  const handleBiometricLogin = async () => {
    dispatch({ type: 'SUBMIT_START' });
    try {
      const simulatedTemplate = `SIM_TEMPLATE_MOCK`; 
      
      const response = await fetch('/api/biometric/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ biometric_type: 'fingerprint', sample_data: simulatedTemplate })
      });

      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Biometric identity match failed.');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.dispatchEvent(new Event('settings:reload'));

      const isEmployee = (data.user?.role || '').toLowerCase() === 'employee';
      navigate(isEmployee ? '/employee/dashboard' : '/dashboard');
    } catch (err) {
      dispatch({ type: 'SUBMIT_ERROR', error: err.message });
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-all duration-1000 relative overflow-hidden`}>
      <div className="absolute inset-0 bg-slate-900 bg-cover bg-center" style={{ filter: 'brightness(0.3)' }} />
      
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-700 relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex flex-col items-center gap-3 mb-8">
            <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center shadow-2xl border-4 border-white/20">
               <span className="font-black text-4xl text-indigo-900">{orgName.charAt(0)}</span>
            </div>
            <h1 className="text-white text-3xl font-black mt-4 tracking-tighter uppercase italic drop-shadow-2xl">
              {orgName}
            </h1>
          </div>
          <div className="space-y-1">
            <h2 className="text-white text-xl font-bold tracking-tight">Enterprise Access Console</h2>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] shadow-2xl p-10 relative overflow-hidden">
          <div className="flex bg-muted/50 p-1.5 rounded-2xl mb-8 border border-border/50">
             <button onClick={() => setLoginMode('company')} className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${loginMode === 'company' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground'}`}>Admin</button>
             <button onClick={() => setLoginMode('employee')} className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${loginMode === 'employee' ? 'bg-white shadow-sm text-emerald-600' : 'text-muted-foreground'}`}>Staff</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <input type="text" className="input-field pl-10" value={userId} onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'userId', value: e.target.value })} required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <input type={showPassword ? "text" : "password"} className="input-field pl-10 pr-10" value={password} onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'password', value: e.target.value })} required />
                <button type="button" onClick={() => dispatch({ type: 'SET_FIELD', field: 'showPassword', value: !showPassword })} className="absolute right-3 top-3 text-muted-foreground">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full text-base py-3 justify-center rounded-xl font-black bg-indigo-600 text-white hover:bg-indigo-700 transition-all flex items-center gap-3">
              {isLoading ? "Verifying..." : "Sign In"}
            </button>

            <div className="flex items-center gap-4 my-6">
              <div className="h-px bg-border flex-1" />
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Or Biometric Seal</span>
              <div className="h-px bg-border flex-1" />
            </div>

            <button type="button" onClick={handleBiometricLogin} className="w-full bg-background text-foreground border-2 border-border py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:border-primary transition-all flex items-center justify-center gap-3">
              <Fingerprint className="w-5 h-5 text-primary" />
              Biometric Identity Scan
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
