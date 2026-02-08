import PublicLayout from "../components/PublicLayout";
import { Search, ChevronRight } from "lucide-react";

const FAQS = [
    {
        q: "How secure is the SearchFirst platform?",
        a: "Our infrastructure follows bank-grade security protocols, including AES-256 encryption at rest and TLS 1.3 for data in transit. We perform weekly vulnerability scanning and annual third-party penetration testing."
    },
    {
        q: "Do you offer custom cloud migrations?",
        a: "Yes, we specialize in migrating legacy systems to modern cloud environments (AWS/Azure/GCP) with zero data loss and minimal downtime for your operations."
    },
    {
        q: "What is your typical project delivery timeline?",
        a: "Enterprise projects vary, but a discovery phase usually lasts 2 weeks, followed by development sprints. An average MVP is delivered within 12-16 weeks."
    },
    {
        q: "Can you build integrations for existing software?",
        a: "We are experts at building custom API bridges and middleware to ensure all your enterprise tools communicate seamlessly."
    },
    {
        q: "Is there a dedicated support team?",
        a: "Yes, our clients receive 24/7 technical support with a guaranteed response time (SLA) of less than 4 hours for critical issues."
    }
];

export default function FAQ() {
    return (
        <PublicLayout>
            <div className="py-24 bg-white">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="text-center mb-24">
                        <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4">Knowledge Base</h2>
                        <h1 className="text-5xl sm:text-7xl font-black text-gray-900 tracking-tighter">Frequently Asked <span className="text-primary italic">Questions</span></h1>
                    </div>

                    <div className="space-y-6">
                        {FAQS.map((f, i) => (
                            <div key={i} className="group p-8 bg-gray-50 border border-gray-100 rounded-[32px] hover:bg-white hover:shadow-xl transition-all">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-bold text-gray-900">{f.q}</h3>
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:rotate-90 transition-transform"><ChevronRight className="w-4 h-4" /></div>
                                </div>
                                <p className="text-gray-500 leading-relaxed font-medium">{f.a}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-24 p-12 bg-gray-900 rounded-[40px] text-center text-white">
                        <h4 className="text-2xl font-bold mb-4">Still have questions?</h4>
                        <p className="text-gray-400 mb-8 max-w-sm mx-auto">Our solution engineers are available to clarify any technical or business queries.</p>
                        <button className="px-10 py-4 bg-primary text-white rounded-2xl font-black hover:bg-primary-600 transition-all">Speak to an Expert</button>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
