import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Implement password reset API
      console.log("Reset request for:", email);
      setTimeout(() => {
        setIsLoading(false);
        setSubmitted(true);
      }, 1000);
    } catch (err) {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 to-primary-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="inline-flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
            <span className="text-primary-900 font-bold text-2xl">S</span>
          </div>
          <span className="text-white text-2xl font-bold">SearchFirst Payroll System</span>
        </Link>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-xl p-8">
          {!submitted ?
            <>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Reset Password
              </h1>
              <p className="text-muted-foreground mb-8">
                Enter your email address and we'll send you instructions to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="input-field pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      required />

                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full text-base py-3 justify-center">

                  {isLoading ?
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </> :

                    "Send Reset Link"
                  }
                </button>
              </form>

              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-primary hover:text-primary-700 font-medium mt-8">

                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
            </> :

            <div className="text-center py-6">
              <CheckCircle className="w-16 h-16 text-accent mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Check Your Email
              </h2>
              <p className="text-muted-foreground mb-6">
                We've sent a password reset link to<br />
                <span className="font-semibold text-foreground">{email}</span>
              </p>
              <p className="text-sm text-muted-foreground mb-8">
                The link will expire in 24 hours. If you don't see it, check your spam folder.
              </p>

              <button
                onClick={() => {
                  setSubmitted(false);
                  setEmail("");
                }}
                className="text-primary hover:text-primary-700 font-medium">

                Try another email
              </button>
            </div>
          }

          {/* Footer */}
          <p className="text-center text-sm text-muted-foreground mt-8 border-t border-border pt-8">
            Remember your password?{" "}
            <Link
              to="/login"
              className="text-primary hover:text-primary-700 font-semibold transition">

              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>);

}