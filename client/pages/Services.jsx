import PublicLayout from "../components/PublicLayout";
import { Cpu, Globe, Layers, Zap, Shield, BarChart3 } from "lucide-react";

const SERVICES = [
    {
        icon: Cpu,
        title: "Custom Enterprise ERPs",
        desc: "We build fully integrated Enterprise Resource Planning systems tailored to your unique organizational workflows. From payroll to student management.",
        features: ["Automated Workflows", "Real-time Analytics", "Seamless Integration"]
    },
    {
        icon: Globe,
        title: "High-Performance Web Apps",
        desc: "Speed is a feature. We engineer web ecosystems using the latest modern stacks (React, Node, Next.js) that load in sub-seconds.",
        features: ["PWA Support", "SEO Optimized", "Global Scalability"]
    },
    {
        icon: Layers,
        title: "Cloud Infrastructure",
        desc: "Migration and management of secure cloud environments using AWS, Azure, and Google Cloud with 99.9% guaranteed uptime.",
        features: ["Auto-scaling", "Disaster Recovery", "Zero-downtime Deploy"]
    },
    {
        icon: Zap,
        title: "Digital Transformation",
        desc: "We help legacy companies modernize their operations by digitizing manual processes and implementing modern data strategies.",
        features: ["Legacy Migration", "Process Audit", "Staff Training"]
    },
    {
        icon: Shield,
        title: "Cybersecurity Audit",
        desc: "Protecting your enterprise assets. We perform deep security audits, penetration testing, and implement immutable encryption.",
        features: ["Data Privacy", "Vulnerability Scanning", "ISO Compliance"]
    },
    {
        icon: BarChart3,
        title: "BI & Data Analytics",
        desc: "Turning raw data into visual intelligence. We build custom dashboards and reporting engines for better decision making.",
        features: ["AI Integration", "Big Data Processing", "Insights Engines"]
    }
];

export default function Services() {
    return (
        <PublicLayout>
            <div className="py-24 bg-gray-50/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-24">
                        <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4">Service Catalog</h2>
                        <h1 className="text-5xl sm:text-7xl font-black text-gray-900 tracking-tighter">
                            Enterprise Ready <br />Solutions
                        </h1>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32">
                        {SERVICES.map((s, i) => (
                            <div key={i} className="group bg-white p-12 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all mb-8">
                                    <s.icon className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 mb-4">{s.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed mb-8">{s.desc}</p>
                                <ul className="space-y-3">
                                    {s.features.map(f => (
                                        <li key={f} className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400">
                                            <Zap className="w-3 h-3 text-primary" /> {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white rounded-[60px] p-12 sm:p-24 border border-gray-100 flex flex-col lg:flex-row items-center gap-20">
                        <div className="lg:w-1/2">
                            <h2 className="text-4xl font-black text-gray-900 mb-8 tracking-tight">How We Deliver <br />Success</h2>
                            <div className="space-y-8">
                                {[
                                    { step: "01", title: "Discovery & Strategy", desc: "We deep-dive into your business processes to find bottlenecks." },
                                    { step: "02", title: "Engineering Excellence", desc: "Our developers follow strict coding standards and Agile sprints." },
                                    { step: "03", title: "Testing & Validation", desc: "We use automated CI/CD and manual UAT to ensure zero-bugs." }
                                ].map(step => (
                                    <div key={step.step} className="flex gap-6">
                                        <span className="text-4xl font-black text-primary/20">{step.step}</span>
                                        <div>
                                            <h4 className="text-xl font-bold mb-2">{step.title}</h4>
                                            <p className="text-gray-500 text-sm">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="lg:w-1/2 w-full aspect-square bg-gray-50 rounded-[40px] flex items-center justify-center border border-gray-100 shadow-inner">
                            <Cpu className="w-40 h-40 text-gray-200" />
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
