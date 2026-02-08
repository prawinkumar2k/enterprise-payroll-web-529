import PublicLayout from "../components/PublicLayout";
import { GraduationCap, Landmark, ShoppingBag, Factory, Activity, Truck } from "lucide-react";

const INDUSTRIES = [
    { icon: GraduationCap, name: "Education", desc: "Digital management systems for Universities and Large Schools." },
    { icon: Landmark, name: "Government", desc: "Secure digital infrastructure for public sector institutions." },
    { icon: ShoppingBag, name: "E-Commerce", desc: "High-scale platforms for retail and global marketplaces." },
    { icon: Factory, name: "Manufacturing", desc: "Automated supply chain and production tracking software." },
    { icon: Activity, name: "Healthcare", desc: "HIPAA-ready patient portals and hospital management ERPs." },
    { icon: Truck, name: "Logistics", desc: "Real-time fleet tracking and warehouse optimization engines." }
];

export default function Industries() {
    return (
        <PublicLayout>
            <div className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-24">
                        <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4">Verticals</h2>
                        <h1 className="text-5xl sm:text-7xl font-black text-gray-900 tracking-tighter">Sector <br />Specialization</h1>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                        {INDUSTRIES.map((ind, i) => (
                            <div key={i} className="group p-12 rounded-[50px] border border-gray-50 bg-gray-50/50 hover:bg-white hover:shadow-xl transition-all">
                                <ind.icon className="w-12 h-12 text-primary mb-8 transition-transform group-hover:scale-110" />
                                <h3 className="text-2xl font-black mb-4">{ind.name}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{ind.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
