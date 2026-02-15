import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Users,
  AlertCircle,
  TrendingUp,
  Clock,
  CheckCircle2,
  Wallet,
  Building2,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  History,
  ShieldAlert,
  Landmark
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";
import { toast } from "sonner";

function StatCard({ icon, label, value, subValue, type = "default" }) {
  const bgColors = {
    default: "bg-primary/5 border-primary/10 text-primary",
    success: "bg-green-50 border-green-100 text-green-600",
    warning: "bg-orange-50 border-orange-100 text-orange-600",
    danger: "bg-red-50 border-red-100 text-red-600"
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl border ${bgColors[type]}`}>{icon}</div>
        {subValue && (
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 px-2 py-1 rounded">
            {subValue}
          </span>
        )}
      </div>
      <div>
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-black text-gray-900 tracking-tight">{value}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const now = new Date();
  const [month, setMonth] = useState(String(now.getMonth() + 1).padStart(2, "0"));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/dashboard/stats?month=${month}&year=${year}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      toast.error("Failed to sync dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [month, year]);

  if (!data && isLoading) {
    return (
      <DashboardLayout activeRoute="dashboard">
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Synchronizing Payroll Brain...</p>
        </div>
      </DashboardLayout>
    );
  }

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'];

  const fmt = (val) => {
    const num = parseFloat(val) || 0;
    if (isNaN(num)) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(num);
  };

  const kpis = data?.kpis || {};

  return (
    <DashboardLayout activeRoute="dashboard">
      <div className="space-y-8">

        {/* 1. SEAMLESS HEADER & CONTROLS */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Payroll Intelligence</h1>
            <p className="text-gray-500 font-medium">Enterprise workforce and disbursement metrics</p>
          </div>

          <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-gray-200 shadow-sm">
            <Calendar className="w-4 h-4 text-gray-400 ml-3" />
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="bg-transparent border-none text-sm font-black uppercase outline-none px-2 cursor-pointer"
            >
              {["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"].map(m => (
                <option key={m} value={m}>{new Date(2000, parseInt(m) - 1).toLocaleString('default', { month: 'long' })}</option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="bg-transparent border-none text-sm font-black uppercase outline-none px-2 cursor-pointer border-l"
            >
              {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {/* 2. CORE KPI GRID (REAL DATA) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={<Users className="w-6 h-6" />}
            label="Active Workforce"
            value={kpis.totalEmployees}
            subValue="Verified"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            label="Net Disbursement"
            value={fmt(kpis.netPayroll)}
            subValue={kpis.processedCount > 0 ? "Processed" : "Pending"}
            type={kpis.processedCount > 0 ? "success" : "warning"}
          />
          <StatCard
            icon={<Landmark className="w-6 h-6" />}
            label="Bank Transfers"
            value={fmt(kpis.bankTransfer)}
            subValue="Live Advice"
            type="default"
          />
          <StatCard
            icon={<Wallet className="w-6 h-6" />}
            label="Cash Payments"
            value={fmt(kpis.cashPayment)}
            subValue="Direct Handover"
            type="warning"
          />
        </div>

        {/* 3. CHARTS & STATUTORY PANEL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Payment Mode Distribution (Pie) */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-8 flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4" /> Disbursement Channels
            </h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.paymentModes || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="amount"
                    nameKey="mode"
                  >
                    {(data?.paymentModes || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => fmt(value)}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Statutory Breakdown (Bar) */}
          <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-8 flex items-center gap-2">
              <Building2 className="w-4 h-4" /> Statutory Compliance (Live)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-8">
              <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                <p className="text-[10px] font-black text-indigo-400 uppercase mb-1">Total EPF</p>
                <p className="text-xl font-black text-indigo-700">{fmt(kpis.totalEPF)}</p>
              </div>
              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                <p className="text-[10px] font-black text-emerald-400 uppercase mb-1">Total ESI</p>
                <p className="text-xl font-black text-emerald-700">{fmt(kpis.totalESI)}</p>
              </div>
              <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100">
                <p className="text-[10px] font-black text-amber-400 uppercase mb-1">Other Ded.</p>
                <p className="text-xl font-black text-amber-700">{fmt(kpis.totalIT + kpis.totalPT + kpis.totalLIC)}</p>
              </div>
            </div>
            <div className="h-[150px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'EPF', val: kpis.totalEPF },
                  { name: 'ESI', val: kpis.totalESI },
                  { name: 'IT', val: kpis.totalIT },
                  { name: 'PT', val: kpis.totalPT },
                  { name: 'LIC', val: kpis.totalLIC },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800 }} />
                  <Tooltip formatter={(value) => fmt(value)} />
                  <Bar dataKey="val" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 4. ALERTS & RECENT ACTIVITY */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Dynamic Alerts Section */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm h-full">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> System Alerts
            </h3>
            <div className="space-y-3">
              {data?.alerts?.length > 0 ? (
                data.alerts.map((alert, idx) => (
                  <div key={idx} className={`p-4 rounded-2xl border flex items-start gap-4 ${alert.type === 'error' ? 'bg-red-50 border-red-100 text-red-700' : 'bg-orange-50 border-orange-100 text-orange-700'
                    }`}>
                    <div className="pt-0.5">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest opacity-60 mb-1">{alert.module}</p>
                      <p className="text-sm font-bold leading-tight">{alert.message}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center opacity-30">
                  <CheckCircle2 className="w-12 h-12 mb-2" />
                  <p className="text-xs font-black uppercase tracking-widest">All Systems Normal</p>
                </div>
              )}
            </div>
          </div>

          {/* Live Audit Log */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm h-full">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
              <History className="w-4 h-4" /> Audit Intelligence
            </h3>
            <div className="space-y-4">
              {data?.recentActivity?.map((log, idx) => (
                <div key={idx} className="flex items-center gap-4 group cursor-default">
                  <div className={`w-1.5 h-10 rounded-full flex-shrink-0 ${log.ActionType === 'PRINT' ? 'bg-indigo-500' :
                    log.ActionType === 'VIEW' ? 'bg-emerald-500' : 'bg-amber-500'
                    }`} />
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-bold text-gray-800 leading-none truncate">{log.Description}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">
                      {log.Module} · {new Date(log.CreatedAt).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                    </p>
                  </div>
                  <ArrowRightIcon className="w-4 h-4 text-gray-200 group-hover:text-primary transition-colors" />
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}

function ArrowRightIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}