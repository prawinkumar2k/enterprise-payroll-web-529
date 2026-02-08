import PublicLayout from "../components/PublicLayout";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";

const CASE_STUDIES = [
    {
        category: "Educational ERP",
        title: "Global University Payroll Overhaul",
        result: "Reduced processing time by 80%",
        desc: "Implemented a custom ERP system for a university with 10,000+ staff, managing complex statutory compliance across multiple campuses.",
        tags: ["React", "FastAPI", "PostgreSQL", "AWS"]
    },
    {
        category: "Fintech",
        title: "Secure Settlement Engine",
        result: "Processed $2B+ in annual volume",
        desc: "Built a high-availability settlement platform with automated ledger balancing and immutable audit logs.",
        tags: ["Node.js", "Redis", "Docker", "GCP"]
    },
    {
        category: "E-Commerce",
        title: "Scale-optimized Retail Ecosystem",
        result: "Handles 1M+ active users",
        desc: "Redesigned a legacy monolith into a microservices architecture to handle peak traffic during seasonal sales.",
        tags: ["Next.js", "Microservices", "Kubernetes", "Stripe"]
    },
    {
        category: "Corporate",
        title: "Automated Compliance Vault",
        result: "Zero regulatory penalties in 3yrs",
        desc: "A centralized repository for enterprise compliance documents with automated deadline tracking and escalation.",
        tags: ["Vue.js", "Go", "ElasticSearch", "Azure"]
    }
];

export default function Portfolio() {
    return (
        <PublicLayout>
            <div className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-24">
                        <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4">Our Track Record</h2>
                        <h1 className="text-5xl sm:text-7xl font-black text-gray-900 tracking-tighter">
                            Case <span className="text-primary italic">Studies</span>
                        </h1>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-32">
                        {CASE_STUDIES.map((caseStudy, i) => (
                            <div key={i} className="group overflow-hidden rounded-[50px] border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-2xl transition-all duration-700">
                                <div className="p-12">
                                    <div className="flex justify-between items-start mb-12">
                                        <div className="px-4 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                                            {caseStudy.category}
                                        </div>
                                        <ArrowUpRight className="w-8 h-8 text-gray-200 group-hover:text-primary transition-colors" />
                                    </div>
                                    <h3 className="text-3xl font-black text-gray-900 mb-6">{caseStudy.title}</h3>
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                                            <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                        <span className="text-green-700 font-bold uppercase text-xs tracking-widest">{caseStudy.result}</span>
                                    </div>
                                    <p className="text-gray-500 text-lg leading-relaxed mb-10">{caseStudy.desc}</p>
                                    <div className="flex flex-wrap gap-3">
                                        {caseStudy.tags.map(tag => (
                                            <span key={tag} className="px-4 py-1.5 bg-white border border-gray-100 rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center border-y border-gray-100 py-32">
                        <h2 className="text-4xl font-black text-gray-900 mb-8">Ready to be our next Success Story?</h2>
                        <p className="max-w-xl mx-auto text-gray-500 mb-12 italic">"Beyond software, we build the foundations of market leadership."</p>
                        <button className="px-12 py-5 bg-primary text-white rounded-2xl font-black text-xl hover:bg-primary-600 transition-all shadow-xl shadow-primary/20">Let's Talk Strategy</button>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
