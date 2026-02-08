import PublicLayout from "../components/PublicLayout";
import { Mail, Phone, MapPin, Globe, MessageSquare } from "lucide-react";

export default function Contact() {
    return (
        <PublicLayout>
            <div className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                        <div>
                            <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4">Get in Touch</h2>
                            <h1 className="text-5xl sm:text-7xl font-black text-gray-900 mb-12 tracking-tighter">Let's Build <br />The Future.</h1>
                            <p className="text-xl text-gray-500 mb-16 max-w-md italic font-medium">Ready to transform your enterprise operations? Our experts are standing by to discuss your vision.</p>

                            <div className="space-y-10">
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-primary border border-gray-100"><Mail className="w-5 h-5" /></div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Email Inquiry</p>
                                        <p className="text-lg font-black text-gray-900">solutions@searchfirst.tech</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-primary border border-gray-100"><Phone className="w-5 h-5" /></div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Direct Line</p>
                                        <p className="text-lg font-black text-gray-900">+91 422 456 7890</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-primary border border-gray-100"><MapPin className="w-5 h-5" /></div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Global Headquarters</p>
                                        <p className="text-lg font-black text-gray-900 italic">Innovation Valley, Tech City, IN</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-12 sm:p-20 rounded-[60px] border border-gray-100 shadow-inner">
                            <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">First Name</label>
                                        <input type="text" className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold" />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Last Name</label>
                                        <input type="text" className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold" />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Email Address</label>
                                    <input type="email" className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold" />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Message</label>
                                    <textarea rows="4" className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold"></textarea>
                                </div>
                                <button className="w-full py-5 bg-primary text-white font-black text-lg rounded-2xl shadow-2xl shadow-primary/30 hover:bg-primary-600 transition-all active:scale-95 uppercase tracking-widest">Send Inquiry</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
