import React, { useState, lazy, Suspense } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Users,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  Wallet,
  Calendar,
  History,
  ShieldAlert,
  Landmark
} from "lucide-react";
import { toast } from "sonner";
import { apiGet } from "../lib/apiClient";
import { useQuery } from "@tanstack/react-query";

const DashboardCharts = lazy(() => import("../components/DashboardCharts"));

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

  // useQuery with apiClient — auto-401 redirect, 60s cache
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-stats', month, year],
    queryFn: () => apiGet(`/api/dashboard/stats?month=${month}&year=${year}`).then(r => r.data),
    staleTime: 60 * 1000,
    retry: 1,
    onError: () => toast.error('Failed to load dashboard data'),
  });

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
      <div className="space-y-8 animate-in fade-in duration-500">

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
            value={kpis.totalEmployees || 0}
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
        <Suspense fallback={<div className="h-[350px] bg-white rounded-3xl border border-gray-100 animate-pulse" />}>
          <DashboardCharts data={data} kpis={kpis} fmt={fmt} />
        </Suspense>

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
              {!data?.recentActivity?.length && <p className="text-center text-gray-300 py-10 font-bold uppercase text-[10px] tracking-widest">No recent intelligence logs</p>}
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
  );
}