import PublicLayout from "../components/PublicLayout";
import { ArrowRight } from "lucide-react";

const POSTS = [
    {
        date: "Feb 07, 2026",
        title: "The Industrialization of AI in Enterprise Software",
        excerpt: "Exploring how heavy-industry organizations are integrating machine learning into their core legacy operations.",
        tag: "Engineering"
    },
    {
        date: "Jan 12, 2026",
        title: "Achieving Zero-Downtime During Global ERP Migrations",
        excerpt: "A technical deep-dive into stateful data migration strategies for institutions that never sleep.",
        tag: "DevOps"
    },
    {
        date: "Dec 15, 2025",
        title: "Security as a Culture: Moving Beyond Firewall Checklists",
        excerpt: "How SearchFirst Technologies builds security into every line of code from day one.",
        tag: "Security"
    }
];

export default function Blog() {
    return (
        <PublicLayout>
            <div className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-24">
                        <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4">Insights & Updates</h2>
                        <h1 className="text-5xl sm:text-7xl font-black text-gray-900 tracking-tighter">SearchFirst <span className="text-primary italic">Blog</span></h1>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {POSTS.map((p, i) => (
                            <div key={i} className="group border-b border-gray-100 pb-12">
                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">{p.date} • {p.tag}</div>
                                <h3 className="text-2xl font-black text-gray-900 mb-4 group-hover:text-primary transition-colors cursor-pointer">{p.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed mb-8">{p.excerpt}</p>
                                <button className="flex items-center gap-2 text-xs font-black uppercase text-gray-900 group-hover:gap-4 transition-all">Read Insight <ArrowRight className="w-4 h-4 text-primary" /></button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
