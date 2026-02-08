import { Link } from "react-router-dom";
import { Globe, MessageSquare, Shield } from "lucide-react";

export default function PublicLayout({ children }) {
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

            <main>{children}</main>

            {/* Footer */}
            <footer className="bg-white pt-24 pb-12 border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
                        <div className="col-span-1 md:col-span-1">
                            <Link to="/" className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
                                    <span className="text-white font-black text-sm">S</span>
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
