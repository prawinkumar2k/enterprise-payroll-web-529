import React, { useReducer, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, User, Building2, ShieldCheck } from "lucide-react";
import { useSettings } from "../context/SettingsContext";
import { loginReducer, initialLoginState } from "@/src/reducers/loginReducer";
import { useQuery } from "@tanstack/react-query";

export default function Login() {
  const { settings } = useSettings();
  const [state, dispatch] = useReducer(loginReducer, initialLoginState);
  const { companyId, userId, password, showPassword, rememberMe, isLoading, error } = state;
  const navigate = useNavigate();

  // Fetch public branding whenever a company is chosen
  const { data: brandingResult } = useQuery({
    queryKey: ['branding', companyId],
    queryFn: () => fetch(`/api/companies/${companyId}/branding`).then(r => r.json()),
    enabled: !!companyId,
    staleTime: 60_000,
  });
  const branding = brandingResult?.branding || { org_name: null, org_logo_url: null };

  const orgName = branding.org_name || settings.org_name || 'Enterprise Payroll';
  const orgLogo = branding.org_logo_url || settings.org_logo_url || null;

  // Super Admin mode state
  const [loginMode, setLoginMode] = useState('company'); // 'company' | 'superadmin'
  const [sa, setSa] = useState({ username: '', password: '', loading: false, error: '' });
  const { username: saUsername, password: saPassword, loading: saLoading, error: saError } = sa;

  // Fetch active companies for dropdown
  const { data: companiesResult, isLoading: companiesLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: () => fetch('/api/companies').then(r => r.json()),
    staleTime: 30_000,
  });
  const companies = companiesResult?.companies || [];

  const handleSuperAdminSubmit = async (e) => {
    e.preventDefault();
    setSa(s => ({ ...s, loading: true, error: '' }));
    try {
      const res = await fetch('/api/superadmin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: saUsername, password: saPassword }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Login failed');
      localStorage.setItem('sa_token', data.token);
      localStorage.setItem('sa_admin', JSON.stringify(data.admin));
      navigate('/superadmin/dashboard');
    } catch (err) {
      setSa(s => ({ ...s, error: err.message || 'Invalid super admin credentials.' }));
    } finally {
      setSa(s => ({ ...s, loading: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch({ type: 'SUBMIT_START' });

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ company_id: companyId, userId, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Login successful — store credentials and reload company-scoped settings
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Notify SettingsContext (same tab) to re-fetch with the new tenant token
      window.dispatchEvent(new Event('settings:reload'));

      navigate('/dashboard');
    } catch (err) {
      dispatch({ type: 'SUBMIT_ERROR', error: err.message || "Invalid credentials. Please try again." });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-indigo-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Branding */}
        <div className="text-center mb-10">
          <div className="inline-flex flex-col items-center gap-3 mb-8">
            {orgLogo ? (
              <img src={orgLogo} className="w-16 h-16 object-contain bg-white p-2 rounded-xl shadow-lg" alt="Logo" />
            ) : (
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-lg">
                {loginMode === 'superadmin' ? (
                  <ShieldCheck className="w-9 h-9 text-gray-800" />
                ) : (
                  <span className="text-indigo-900 font-black text-3xl">{orgName.charAt(0)}</span>
                )}
              </div>
            )}
            <h1 className="text-white text-2xl font-black mt-2 tracking-tight uppercase">
              {loginMode === 'superadmin' ? 'Super Admin' : orgName}
            </h1>
          </div>
          <div className="space-y-1">
            <h2 className="text-white/90 text-xl font-bold">Secure Access Portal</h2>
            <p className="text-indigo-100/70 text-sm font-medium">Verify your credentials to continue</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-xl p-8">

          {/* Mode Tabs */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden mb-6">
            <button
              type="button"
              onClick={() => { setLoginMode('company'); setSa(s => ({ ...s, error: '' })); dispatch({ type: 'SUBMIT_ERROR', error: '' }); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold transition ${
                loginMode === 'company'
                  ? 'bg-indigo-700 text-white'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Building2 className="w-4 h-4" /> Company
            </button>
            <button
              type="button"
              onClick={() => { setLoginMode('superadmin'); dispatch({ type: 'SUBMIT_ERROR', error: '' }); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold transition ${
                loginMode === 'superadmin'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              <ShieldCheck className="w-4 h-4" /> Super Admin
            </button>
          </div>

          {/* ── Super Admin Form ── */}
          {loginMode === 'superadmin' && (
            <form onSubmit={handleSuperAdminSubmit} className="space-y-5">
              {saError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{saError}</div>
              )}
              <div>
                <label htmlFor="sa-username" className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    id="sa-username"
                    type="text"
                    placeholder="superadmin"
                    className="input-field pl-10"
                    value={saUsername}
                    onChange={e => setSa(s => ({ ...s, username: e.target.value }))}
                    disabled={saLoading}
                    autoComplete="username"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="sa-password" className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    id="sa-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    className="input-field pl-10 pr-10"
                    value={saPassword}
                    onChange={e => setSa(s => ({ ...s, password: e.target.value }))}
                    disabled={saLoading}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => dispatch({ type: 'SET_FIELD', field: 'showPassword', value: !showPassword })}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={saLoading}
                className="w-full py-3 rounded-lg bg-gray-900 hover:bg-gray-800 text-white font-bold text-sm flex items-center justify-center gap-2 transition disabled:opacity-60"
              >
                {saLoading ? (
                  <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Signing in...</>
                ) : (
                  <><ShieldCheck className="w-5 h-5" /> Access Control Panel</>
                )}
              </button>
            </form>
          )}

          {/* ── Company Form ── */}
          {loginMode === 'company' && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error &&
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            }

            {/* Company Field */}
            <div>
              <label htmlFor="login-company" className="block text-sm font-semibold text-foreground mb-2">
                Company
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 w-5 h-5 text-muted-foreground pointer-events-none" />
                <select
                  id="login-company"
                  className="input-field pl-10 appearance-none"
                  value={companyId}
                  onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'companyId', value: e.target.value })}
                  disabled={isLoading || companiesLoading}
                  required>
                  <option value="">Select your company</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* User ID Field */}
            <div>
              <label htmlFor="login-userid" className="block text-sm font-semibold text-foreground mb-2">
                User ID
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <input
                  id="login-userid"
                  type="text"
                  placeholder="Enter your User ID"
                  className="input-field pl-10"
                  value={userId}
                  onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'userId', value: e.target.value })}
                  disabled={isLoading}
                  autoComplete="username"
                  required />

              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="login-password" className="block text-sm font-semibold text-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="input-field pl-10 pr-10"
                  value={password}
                  onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'password', value: e.target.value })}
                  disabled={isLoading}
                  autoComplete="current-password"
                  required />

                <button
                  type="button"
                  onClick={() => dispatch({ type: 'SET_FIELD', field: 'showPassword', value: !showPassword })}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition"
                  disabled={isLoading}>

                  {showPassword ?
                    <EyeOff className="w-5 h-5" /> :

                    <Eye className="w-5 h-5" />
                  }
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'rememberMe', value: e.target.checked })}
                  disabled={isLoading}
                  className="w-4 h-4 rounded border-border bg-background cursor-pointer" />

                <span className="text-foreground">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-primary hover:text-primary-700 transition font-medium">

                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full text-base py-3 justify-center">

              {isLoading ?
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </> :

                "Sign In"
              }
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-muted-foreground">Or</span>
              </div>
            </div>
          </form>
          )}

          {/* Footer */}
          <p className="text-center text-sm text-muted-foreground mt-8">
            Don&apos;t have an account?{" "}
            <a href="mailto:support@company.com" className="text-primary hover:text-primary-700 font-semibold transition">
              Request Access
            </a>
          </p>
        </div>

        {/* Security Info */}
        <div className="mt-8 text-center text-primary-100 text-sm">
          <p>🔒 Your data is encrypted and secure</p>
        </div>
      </div>
    </div>);

}