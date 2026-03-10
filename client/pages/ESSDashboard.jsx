import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
    FileText,
    Calendar,
    User,
    ShieldCheck,
    CircleDollarSign,
    Download,
    Mail,
    ExternalLink
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "../lib/apiClient";
import { toast } from "sonner";

export default function ESSDashboard() {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : {};

    // 1. Fetch Salary History (brief)
    const { data: salaryData, isLoading: salLoading } = useQuery({
        queryKey: ['ess-salary', user.username],
        queryFn: () => apiGet(`/api/salary/my-history`).then(r => r.data),
    });

    // 2. Fetch Attendance (briefly - current month LOP)
    const { data: attendanceData, isLoading: attLoading } = useQuery({
        queryKey: ['ess-attendance', user.username],
        queryFn: () => apiGet(`/api/attendance/my-summary`).then(r => r.data),
    });

    const handleDownloadPayslip = (row) => {
        const token = localStorage.getItem('token');
        const url = `/api/salary/export?monthYear=${row.MONTHYEAR}&search=${user.username}&token=${token}`;
        window.open(url, '_blank');
    };

    return (
        <DashboardLayout activeRoute="ess-dashboard" userRole="Employee">
            <div className="space-y-8 max-w-5xl mx-auto">

                {/* Welcome Header */}
                <div className="bg-indigo-900 text-white p-10 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
                    <div className="relative z-10">
                        <h1 className="text-4xl font-black tracking-tight mb-2">Welcome Back, {user.name}!</h1>
                        <p className="text-indigo-100/80 font-medium">Your personal Employee Self-Service (ESS) hub</p>

                        <div className="mt-8 flex flex-wrap gap-4">
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-1">Employee ID</p>
                                <p className="text-xl font-black">{user.username}</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-1">System Status</p>
                                <p className="text-xl font-black flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-emerald-400" /> Authorized
                                </p>
                            </div>
                        </div>
                    </div>
                    {/* Abstract design elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/20 rounded-full -ml-10 -mb-10 blur-2xl"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Recent Payslips */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                    <CircleDollarSign className="w-4 h-4 text-indigo-600" /> Recent Payslips
                                </h3>
                                <button className="text-[10px] font-black text-indigo-600 uppercase hover:underline">View All History</button>
                            </div>

                            {salLoading ? (
                                <div className="space-y-4 animate-pulse">
                                    {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-50 rounded-2xl w-full"></div>)}
                                </div>
                            ) : (salaryData?.length > 0) ? (
                                <div className="space-y-3">
                                    {salaryData.map((row, idx) => (
                                        <div key={idx} className="group p-4 rounded-2xl border border-gray-50 hover:bg-gray-50 hover:border-gray-200 transition-all flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center font-black text-xs text-indigo-600">
                                                    {row.MONTHYEAR.split('-')[0]}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{row.MONTHYEAR}</p>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Net Payable: ₹{parseFloat(row.NETSAL).toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleDownloadPayslip(row)}
                                                    className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-400 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
                                                    title="Download PDF/Excel"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </button>
                                                <button
                                                    className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm opacity-0 group-hover:opacity-100"
                                                    title="Full Details"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-20 text-center opacity-30">
                                    <FileText className="w-12 h-12 mx-auto mb-2" />
                                    <p className="text-xs font-black uppercase tracking-widest">No salary history available</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Attendance & Profile Quick View */}
                    <div className="space-y-6">

                        {/* Monthly Attendance Card */}
                        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm text-center">
                            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center justify-center gap-2">
                                <Calendar className="w-4 h-4 text-emerald-600" /> Current Attendance
                            </h3>

                            <div className="flex flex-col items-center">
                                <div className="relative w-32 h-32 mb-6">
                                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="45" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                                        <circle cx="50" cy="50" r="45" fill="none" stroke="#10b981" strokeWidth="8" strokeDasharray="282.7" strokeDashoffset={282.7 * (1 - (attendanceData?.presentPerc || 0.95))} strokeLinecap="round" />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <p className="text-2xl font-black text-gray-900">{(attendanceData?.presentPerc * 100 || 95).toFixed(0)}%</p>
                                    </div>
                                </div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">LOP Days this Month</p>
                                <p className="text-xl font-black text-gray-900">{attendanceData?.lopDays || 0}</p>
                                <button className="mt-6 text-[10px] font-black text-indigo-600 uppercase tracking-widest px-6 py-3 bg-indigo-50 rounded-2xl hover:bg-indigo-100 transition-all w-full">Attendance History</button>
                            </div>
                        </div>

                        {/* Quick Profile Actions */}
                        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                                <User className="w-4 h-4 text-amber-600" /> Profile
                            </h3>
                            <div className="space-y-2">
                                <button className="w-full text-left p-4 rounded-2xl hover:bg-gray-50 flex items-center justify-between border border-transparent hover:border-gray-100 transition-all group">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Personal Info</p>
                                        <p className="text-sm font-bold text-gray-800">Update Profile</p>
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 transition-colors" />
                                </button>
                                <button className="w-full text-left p-4 rounded-2xl hover:bg-gray-50 flex items-center justify-between border border-transparent hover:border-gray-100 transition-all group">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Company Policy</p>
                                        <p className="text-sm font-bold text-gray-800">HR Handbooks</p>
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 transition-colors" />
                                </button>
                                <button className="w-full text-left p-4 rounded-2xl bg-amber-50/50 hover:bg-amber-50 flex items-center justify-between border border-amber-100/50 transition-all group">
                                    <div>
                                        <p className="text-[10px] font-black text-amber-400 uppercase mb-1">Security</p>
                                        <p className="text-sm font-bold text-amber-700">Change Password</p>
                                    </div>
                                    <ShieldCheck className="w-4 h-4 text-amber-300 group-hover:text-amber-500 transition-colors" />
                                </button>
                            </div>
                        </div>

                    </div>

                </div>

                {/* Footer */}
                <div className="pt-20 pb-10 text-center opacity-40">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em]">SearchFirst Workforce Systems v2.4 • Enterprise Secure Network</p>
                </div>

            </div>
        </DashboardLayout>
    );
}
