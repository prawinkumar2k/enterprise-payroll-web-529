import React from "react";
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
  CartesianGrid,
} from "recharts";
import { ArrowUpRight, Building2 } from "lucide-react";

const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444"];

export default function DashboardCharts({ data, kpis, fmt }) {
  return (
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
                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
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
            <BarChart
              data={[
                { name: "EPF", val: kpis.totalEPF },
                { name: "ESI", val: kpis.totalESI },
                { name: "IT", val: kpis.totalIT },
                { name: "PT", val: kpis.totalPT },
                { name: "LIC", val: kpis.totalLIC },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800 }} />
              <Tooltip formatter={(value) => fmt(value)} />
              <Bar dataKey="val" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
