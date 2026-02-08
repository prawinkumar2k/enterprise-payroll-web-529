import PublicLayout from "../components/PublicLayout";
import { Briefcase, MapPin, Clock } from "lucide-react";

const JOBS = [
    { title: "Senior Systems Architect", type: "Full-Time", location: "Global / Remote", dept: "Engineering" },
    { title: "Full-Stack Engineer (React/Node)", type: "Full-Time", location: "Innovation Valley", dept: "Engineering" },
    { title: "Enterprise Solution Consultant", type: "Full-Time", location: "Tech City HQ", dept: "Sales & Strategy" },
    { title: "DevOps specialist (Kubernetes)", type: "Full-Time", location: "Remote", dept: "Infrastructure" }
];

export default function Careers() {
    return (
        <PublicLayout>
            <div className="py-24 bg-gray-50/50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-24">
                        <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4">Join the Elite</h2>
                        <h1 className="text-5xl sm:text-7xl font-black text-gray-900 tracking-tighter">Build The <br />New <span className="text-primary italic">Standard</span></h1>
                    </div>

                    <div className="bg-white rounded-[60px] p-12 sm:p-20 border border-gray-100 shadow-sm mb-20">
                        <h2 className="text-3xl font-black text-gray-900 mb-12 uppercase tracking-tight">Open Positions</h2>
                        <div className="divide-y divide-gray-100">
                            {JOBS.map((job, i) => (
                                <div key={i} className="py-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:px-6 transition-all">
                                    <div>
                                        <h3 className="text-2xl font-black text-gray-900 mb-2 group-hover:text-primary transition-colors cursor-pointer">{job.title}</h3>
                                        <div className="flex gap-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {job.type}</span>
                                            <span className="text-primary">{job.dept}</span>
                                        </div>
                                    </div>
                                    <button className="px-10 py-4 border-2 border-gray-900 text-gray-900 rounded-2xl font-black text-sm hover:bg-gray-900 hover:text-white transition-all uppercase tracking-widest">Apply Now</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-gray-400 italic">"We are always looking for visionary engineers. If you don't see a fit but believe in our mission, email us at careers@searchfirst.tech"</p>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
