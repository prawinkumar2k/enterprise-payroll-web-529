import { Link } from "react-router-dom";
import {
  Users,
  BarChart3,
  CheckCircle,
  TrendingUp,
  FileText,
  Clock,
  Shield,
  ArrowRight,
  Globe,
  Cpu,
  Layers,
  HelpCircle,
  MessageSquare,
  Briefcase
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 group-hover:rotate-12 transition-transform duration-500">
              <span className="text-white font-black text-xl">S</span>
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg text-gray-900 leading-none">SearchFirst</span>
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest mt-0.5">Technologies</span>
            </div>
          </Link>

          <div className="hidden xl:flex items-center gap-8">
            {[
              { label: 'Services', href: '/services' },
              { label: 'Industries', href: '/industries' },
              { label: 'Portfolio', href: '/portfolio' },
              { label: 'About', href: '/about' },
              { label: 'Blog', href: '/blog' },
              { label: 'FAQ', href: '/faq' },
              { label: 'Contact', href: '/contact' }
            ].map((item) => (
              <Link key={item.label} to={item.href} className="text-[11px] font-black text-gray-500 hover:text-primary transition-colors uppercase tracking-[0.15em]">
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:text-primary transition-all">
              Client Login
            </Link>
            <Link to="/contact" className="hidden sm:block bg-gray-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-xl shadow-gray-200 hover:bg-gray-800 transition-all active:scale-95">
              Request Quote
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 sm:pt-32 sm:pb-24">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gray-50 border border-gray-100 rounded-full mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Innovating Enterprise Solutions</span>
          </div>

          <h1 className="text-5xl sm:text-8xl font-black text-gray-900 mb-8 tracking-tighter leading-[0.9]">
            The Future of <br />
            <span className="text-primary">Enterprise Tech</span>
          </h1>

          <p className="max-w-3xl mx-auto text-lg sm:text-2xl text-gray-500 font-medium leading-relaxed mb-12">
            SearchFirst Technologies crafts high-precision digital ecosystems for forward-thinking organizations. We blend enterprise-grade engineering with visionary design.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/services" className="w-full sm:w-auto px-12 py-5 bg-primary text-white rounded-2xl font-black text-xl shadow-2xl shadow-primary/30 hover:bg-primary-600 transition-all active:scale-95 flex items-center gap-3">
              Our Services <ArrowRight className="w-6 h-6" />
            </Link>
            <Link to="/portfolio" className="w-full sm:w-auto px-12 py-5 bg-white text-gray-900 border-2 border-gray-100 rounded-2xl font-black text-xl hover:border-gray-200 transition-all active:scale-95">
              View Work
            </Link>
          </div>
        </div>
      </section>

      {/* Services Grid (Mini) */}
      <section className="py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4">What We Do</h2>
            <h3 className="text-4xl font-black text-gray-900">Digital Solutions for Tomorrow</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Cpu, title: "Custom Software", desc: "Engineered-to-order enterprise platforms that solve complex business logic." },
              { icon: Globe, title: "Web Ecosystems", desc: "High-performance web architectures designed for massive scale and security." },
              { icon: Layers, title: "Cloud Infrastructure", desc: "Robust cloud strategy and deployment to ensure 99.99% uptime." }
            ].map((s, i) => (
              <div key={i} className="bg-white p-10 rounded-[32px] border border-gray-100 hover:shadow-xl transition-all">
                <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center mb-6">
                  <s.icon className="w-6 h-6 text-primary" />
                </div>
                <h4 className="text-xl font-bold mb-4">{s.title}</h4>
                <p className="text-gray-500 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-center gap-20">
          <div className="lg:w-1/2">
            <h2 className="text-5xl font-black text-gray-900 mb-8 tracking-tight">Built on Precision. <br />Driven by Results.</h2>
            <p className="text-xl text-gray-500 mb-10 leading-relaxed font-medium">
              SearchFirst Technologies is not just a software vendor; we are your strategic technology partner. We specialize in transforming complex requirements into reliable, intuitive, and secure digital assets.
            </p>
            <ul className="space-y-6">
              {[
                "Enterprise-Grade Security Protocols",
                "Agile Development Methodology",
                "Dedicated Full-Cycle Support",
                "High-Performance Tech Stacks"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-4 text-gray-700 font-bold uppercase text-xs tracking-widest">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:w-1/2 grid grid-cols-2 gap-6 w-full">
            <div className="bg-primary p-10 rounded-[40px] text-white">
              <span className="text-5xl font-black block mb-2">10+</span>
              <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Years Excellence</span>
            </div>
            <div className="bg-gray-100 p-10 rounded-[40px] text-gray-900 translate-y-12">
              <span className="text-5xl font-black block mb-2">500+</span>
              <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Impactful Projects</span>
            </div>
            <div className="bg-gray-900 p-10 rounded-[40px] text-white">
              <span className="text-5xl font-black block mb-2">99%</span>
              <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Client Retention</span>
            </div>
            <div className="bg-gray-100 p-10 rounded-[40px] text-gray-900 translate-y-12">
              <span className="text-5xl font-black block mb-2">24h</span>
              <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Response SLA</span>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gray-900 py-32 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 text-center text-white relative z-10">
          <h2 className="text-4xl sm:text-7xl font-black mb-12 tracking-tight">Let's Build Something <br /><span className="text-primary italic">Extraordinary</span></h2>
          <div className="flex flex-wrap justify-center gap-6">
            <Link to="/contact" className="px-12 py-5 bg-primary text-white rounded-2xl font-black text-xl hover:bg-primary-600 transition-all">Start Your Project</Link>
            <Link to="/careers" className="px-12 py-5 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-black text-xl hover:bg-white/20 transition-all">Join Our Team</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white pt-24 pb-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-1 md:col-span-1">
              <Link to="/" className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
                  <span className="text-white font-black text-xl">S</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-lg text-gray-900">SearchFirst</span>
                  <span className="text-[10px] uppercase font-bold text-gray-400">Technologies</span>
                </div>
              </Link>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Pioneering the industrial digital transformation with precision-engineered enterprise software solutions.
              </p>
            </div>

            <div>
              <h4 className="text-[11px] font-black uppercase tracking-widest text-gray-900 mb-6">Company</h4>
              <ul className="space-y-4">
                {['About', 'Services', 'Portfolio', 'Industries', 'FAQ'].map(item => (
                  <li key={item}><Link to={`/${item.toLowerCase()}`} className="text-sm text-gray-500 hover:text-primary transition-colors font-medium">{item}</Link></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[11px] font-black uppercase tracking-widest text-gray-900 mb-6">Support</h4>
              <ul className="space-y-4">
                {['Contact', 'Careers', 'Blog', 'Privacy Policy', 'Terms of Service'].map(item => (
                  <li key={item}><Link to={`/${item.replace(/\s/g, '').toLowerCase()}`} className="text-sm text-gray-500 hover:text-primary transition-colors font-medium">{item}</Link></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[11px] font-black uppercase tracking-widest text-gray-900 mb-6">Office</h4>
              <p className="text-sm text-gray-500 leading-relaxed mb-4 font-medium">
                SearchFirst Tech Hub <br />
                Innovation Valley, Tech City <br />
                Global HQ 641001
              </p>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-primary hover:text-white transition-all cursor-pointer">
                  <Globe className="w-4 h-4" />
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-primary hover:text-white transition-all cursor-pointer">
                  <MessageSquare className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-12 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col items-center md:items-start">
              <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest">
                © 2026 SearchFirst Technologies. All rights reserved.
              </p>
              <p className="text-gray-300 text-[10px] mt-1 font-medium italic">
                This digital platform is developed and engineered by Prawin Kumar for SearchFirst Technologies.
              </p>
            </div>

            <div className="flex gap-6">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Shield className="w-4 h-4" /> Enterprise Secure
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}