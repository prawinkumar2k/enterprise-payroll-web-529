import PublicLayout from "../components/PublicLayout";
import { Shield, Target, Award, Users } from "lucide-react";

export default function About() {
    return (
        <PublicLayout>
            <div className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <h1 className="text-5xl sm:text-7xl font-black text-gray-900 mb-8 tracking-tighter">
                            Engineering <br />The <span className="text-primary italic">Extraordinary</span>
                        </h1>
                        <p className="max-w-3xl mx-auto text-xl text-gray-500 font-medium leading-relaxed">
                            SearchFirst Technologies is an elite software engineering firm dedicated to building the backbone of tomorrow's enterprise digital landscape.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32">
                        <div>
                            <h2 className="text-3xl font-black text-gray-900 mb-6 uppercase tracking-tight">Our Mission</h2>
                            <p className="text-lg text-gray-600 leading-relaxed mb-6">
                                At SearchFirst Technologies, our mission is to empower global enterprises through precision-engineered software. We believe that technology should be an invisible, powerful force that drives efficiency, security, and growth.
                            </p>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                By focusing on deep technical excellence and user-centric design, we transform complex organizational challenges into streamlined digital systems that stand the test of time.
                            </p>
                        </div>
                        <div className="bg-gray-50 p-12 rounded-[40px] border border-gray-100 shadow-inner">
                            <div className="grid grid-cols-2 gap-8">
                                {[
                                    { icon: Shield, label: "Security First", val: "100%" },
                                    { icon: Target, label: "Precision", val: "99.9%" },
                                    { icon: Award, label: "Quality", val: "A+" },
                                    { icon: Users, label: "Support", val: "24/7" }
                                ].map((item, i) => (
                                    <div key={i} className="text-center">
                                        <item.icon className="w-8 h-8 text-primary mx-auto mb-4" />
                                        <div className="text-2xl font-black text-gray-900">{item.val}</div>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-32 pb-16">
                        <div className="max-w-3xl">
                            <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4">Leadership & Engineering</h2>
                            <h3 className="text-4xl font-black text-gray-900 mb-12 italic">Precision Leadership meets Digital Innovation</h3>
                            <div className="space-y-12">
                                <div className="flex flex-col md:flex-row gap-8 items-start">
                                    <div className="w-20 h-20 bg-gray-900 rounded-2xl flex items-center justify-center text-white font-black text-3xl shrink-0">PK</div>
                                    <div>
                                        <h4 className="text-2xl font-black text-gray-900 mb-2">Prawin Kumar</h4>
                                        <p className="text-primary font-bold uppercase text-[11px] tracking-widest mb-4">Lead Developer & Systems Architect</p>
                                        <p className="text-gray-500 leading-relaxed">
                                            This digital platform and the core technologies of SearchFirst are engineered by Prawin Kumar. With a focus on full-stack architecture and high-performance engineering, Prawin ensures that every project at SearchFirst meets the highest industrial standards of quality and efficiency.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900 rounded-[50px] p-12 sm:p-20 text-center text-white mt-20">
                        <h2 className="text-4xl sm:text-6xl font-black mb-8">Guided by Ethics. <br />Driven by Data.</h2>
                        <p className="max-w-2xl mx-auto text-xl text-gray-400 mb-12 leading-relaxed">
                            We hold our company to a standard of absolute transparency and professional integrity. Your data, your vision, and your success are our primary directives.
                        </p>
                        <button className="px-12 py-5 bg-white text-gray-900 rounded-2xl font-black text-xl hover:bg-gray-100 transition-all">Download Company Profile</button>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
