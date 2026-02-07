import { Link } from "react-router-dom";
import {
  Users,
  BarChart3,
  CheckCircle,
  TrendingUp,
  FileText,
  Clock,
  Shield
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 group-hover:rotate-12 transition-transform duration-500">
              <span className="text-white font-black text-xl">S</span>
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg text-gray-900 leading-none">SearchFirst</span>
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest mt-0.5">Enterprise Payroll</span>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-10">
            {['Features', 'Modules', 'Pricing', 'About'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-bold text-gray-500 hover:text-primary transition-colors uppercase tracking-widest">
                {item}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:text-primary transition-all">
              Login
            </Link>
            <button className="hidden sm:block bg-gray-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-xl shadow-gray-200 hover:bg-gray-800 transition-all active:scale-95">
              Request Demo
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 sm:pt-32 sm:pb-24">
        {/* Abstract Background Blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gray-50 border border-gray-100 rounded-full mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">v4.0 Enterprise Edition Now Live</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-black text-gray-900 mb-8 tracking-tight">
            Modern Payroll for <br />
            <span className="text-primary italic">Precision</span> Enterprise
          </h1>

          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-gray-500 leading-relaxed mb-12">
            SearchFirst delivers institution-grade precision for colleges, universities, and large-scale enterprises. Secure, compliant, and infinitely scalable.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/login" className="w-full sm:w-auto px-10 py-4 bg-primary text-white rounded-2xl font-black text-lg shadow-2xl shadow-primary/30 hover:bg-primary-600 transition-all active:scale-95">
              Launch Console
            </Link>
            <button className="w-full sm:w-auto px-10 py-4 bg-white text-gray-900 border-2 border-gray-100 rounded-2xl font-black text-lg hover:border-gray-200 transition-all active:scale-95">
              Watch Preview
            </button>
          </div>

          <div className="mt-20 relative max-w-5xl mx-auto">
            <div className="aspect-[16/9] bg-gray-50 rounded-[32px] border border-gray-100 shadow-2xl overflow-hidden p-4">
              <div className="w-full h-full bg-white rounded-2xl shadow-inner border border-gray-50 flex items-center justify-center">
                <TrendingUp className="w-20 h-20 text-gray-100" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 sm:py-32 bg-gray-50/50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-4">Core Capabilities</h2>
            <h3 className="text-3xl sm:text-5xl font-black text-gray-900">Engineered for Accuracy</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "Unified HRIS",
                desc: "Centralized employee repository with automated contract lifecycle management."
              },
              {
                icon: BarChart3,
                title: "Algorithmic Payroll",
                desc: "High-speed calculation engine handling complex tax slabs and multi-mode disbursements."
              },
              {
                icon: CheckCircle,
                title: "Compliance Vault",
                desc: "Real-time updates for EPF, ESI, and statutory professional tax regulations."
              },
              {
                icon: FileText,
                title: "Rich Reporting",
                desc: "Bank-ready statements and professional pay-certificates generated in sub-seconds."
              },
              {
                icon: Clock,
                title: "Workflow Engine",
                desc: "Multi-level approval hierarchies for finalized payroll locking and auditing."
              },
              {
                icon: Shield,
                title: "Fortified Security",
                desc: "Immutable audit trails and granular role-based access control for every action."
              }].map((feature, idx) => (
                <div key={idx} className="group bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
                  <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-500 mb-6">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h4>
                  <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-900 py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-4xl sm:text-6xl font-black mb-8">Ready to Scale?</h2>
          <p className="max-w-2xl mx-auto text-xl text-gray-400 mb-12">
            Join 500+ enterprises managing billions in payroll with sub-second accuracy.
          </p>
          <Link to="/login" className="inline-block px-12 py-5 bg-primary text-white rounded-2xl font-black text-xl shadow-2xl shadow-primary/20 hover:bg-primary-600 transition-all active:scale-95">
            Get Enterprise Access
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-gray-900 rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-sm">S</span>
            </div>
            <span className="font-black text-lg text-gray-900">SearchFirst</span>
          </div>
          <p className="text-gray-400 text-sm mb-4">© 2026 SearchFirst Technologies. Engineering Excellence by Prawin Kumar.</p>
          <div className="flex gap-6">
            {['Privacy', 'Terms', 'Security', 'Compliance'].map(item => (
              <a key={item} href="#" className="text-xs font-bold text-gray-400 hover:text-primary uppercase tracking-widest">{item}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}