import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { useSettings } from "../context/SettingsContext";

export default function Login() {
  const { settings } = useSettings();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const orgName = settings.org_name || "Enterprise Payroll";
  const orgLogo = settings.org_logo_url;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Login successful
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));

      navigate('/dashboard');
    } catch (err) {
      setError(err.message || "Invalid credentials. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-indigo-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex flex-col items-center gap-3 mb-8">
            {orgLogo ? (
              <img src={orgLogo} className="w-16 h-16 object-contain bg-white p-2 rounded-xl shadow-lg" alt="Logo" />
            ) : (
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-indigo-900 font-black text-3xl">{orgName.charAt(0)}</span>
              </div>
            )}
            <h1 className="text-white text-2xl font-black mt-2 tracking-tight uppercase">{orgName}</h1>
          </Link>
          <div className="space-y-1">
            <h2 className="text-white/90 text-xl font-bold">Secure Access Portal</h2>
            <p className="text-indigo-100/70 text-sm font-medium">Verify your credentials to continue</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error &&
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            }

            {/* User ID Field */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                User ID
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Enter your User ID"
                  className="input-field pl-10"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  disabled={isLoading}
                  autoComplete="username"
                  required />

              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="input-field pl-10 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="current-password"
                  required />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
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
                  onChange={(e) => setRememberMe(e.target.checked)}
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

          {/* Footer */}
          <p className="text-center text-sm text-muted-foreground mt-8">
            Don't have an account?{" "}
            <a href="#" className="text-primary hover:text-primary-700 font-semibold transition">
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