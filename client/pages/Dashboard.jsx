import DashboardLayout from "@/components/DashboardLayout";
import { Users, AlertCircle, TrendingUp, Clock } from "lucide-react";
import {
  LineChart,
  Line,


  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from
  "recharts";

const payrollTrendData = [
  { month: "Jan", total: 2400000, pf: 240000, esi: 48000 },
  { month: "Feb", total: 2500000, pf: 250000, esi: 50000 },
  { month: "Mar", total: 2600000, pf: 260000, esi: 52000 },
  { month: "Apr", total: 2550000, pf: 255000, esi: 51000 },
  { month: "May", total: 2700000, pf: 270000, esi: 54000 },
  { month: "Jun", total: 2800000, pf: 280000, esi: 56000 }];


const departmentData = [
  { name: "Administration", value: 45, fill: "hsl(218 85% 33%)" },
  { name: "Teaching", value: 120, fill: "hsl(142 72% 29%)" },
  { name: "Support Staff", value: 35, fill: "hsl(39 92% 50%)" },
  { name: "Other", value: 20, fill: "hsl(215 14% 90%)" }];


const recentActivities = [
  { id: 1, action: "Payroll Finalized", user: "Admin", date: "Today, 2:30 PM", type: "success" },
  { id: 2, action: "Salary Sheet Generated", user: "HR Officer", date: "Today, 10:15 AM", type: "info" },
  { id: 3, action: "Employee Added", user: "HR Officer", date: "Yesterday", type: "info" },
  { id: 4, action: "Payroll Adjusted", user: "Accountant", date: "2 days ago", type: "warning" },
  { id: 5, action: "System Update Applied", user: "Super Admin", date: "3 days ago", type: "info" }];


const pendingApprovals = [
  { id: 1, description: "June 2024 Payroll Finalization", status: "Pending" },
  { id: 2, description: "New Employee Salary Structure", status: "Pending" },
  { id: 3, description: "Bonus Processing Request", status: "In Review" }];










function StatCard({ icon, label, value, trend, trendDirection }) {
  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all active:scale-[0.98]">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-primary/5 rounded-xl border border-primary/10">{icon}</div>
        {trend && (
          <div className={`flex items-center gap-1 text-[10px] sm:text-xs font-bold px-2 py-1 rounded-full ${trendDirection === "up" ? "bg-green-50 text-green-600" :
            trendDirection === "down" ? "bg-red-50 text-red-600" :
              "bg-blue-50 text-blue-600"
            }`}>
            {trendDirection === "up" && <TrendingUp className="w-3 h-3" />}
            {trend}
          </div>
        )}
      </div>
      <div>
        <p className="text-gray-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
        <p className="text-xl sm:text-3xl font-black text-gray-900 tracking-tight">{value}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  return (
    <DashboardLayout activeRoute="dashboard">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="px-1">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Operational Overview</h1>
          <p className="text-xs sm:text-sm text-gray-500">Real-time enterprise metrics & workforce analytics</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            icon={<Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />}
            label="Employees"
            value="220"
            trend="+12"
            trendDirection="up"
          />
          <StatCard
            icon={<AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />}
            label="Payroll Status"
            value="Jun '24"
            trend="Draft"
            trendDirection="neutral"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />}
            label="Net Payroll"
            value="₹28.0L"
            trend="5.2%"
            trendDirection="up"
          />
          <StatCard
            icon={<Clock className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />}
            label="Approvals"
            value="03"
            trend="Urgent"
            trendDirection="down"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Statutory Summary */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
            <h3 className="text-base font-bold text-gray-800 mb-6 flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full" />
              Statutory Contributions
            </h3>
            <div className="space-y-6 flex-1 flex flex-col justify-center">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-gray-500 uppercase">EPF Contribution</p>
                  <p className="text-sm font-bold text-primary">₹2,80,000</p>
                </div>
                <div className="w-full bg-gray-50 rounded-full h-2.5 overflow-hidden border border-gray-100">
                  <div className="bg-primary h-full rounded-full shadow-[0_0_10px_rgba(var(--primary),0.3)] transition-all duration-1000" style={{ width: "85%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-gray-500 uppercase">ESI Contribution</p>
                  <p className="text-sm font-bold text-green-600">₹56,000</p>
                </div>
                <div className="w-full bg-gray-50 rounded-full h-2.5 overflow-hidden border border-gray-100">
                  <div className="bg-green-500 h-full rounded-full transition-all duration-1000" style={{ width: "70%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-gray-500 uppercase">Professional Tax</p>
                  <p className="text-sm font-bold text-orange-500">₹14,000</p>
                </div>
                <div className="w-full bg-gray-50 rounded-full h-2.5 overflow-hidden border border-gray-100">
                  <div className="bg-orange-400 h-full rounded-full transition-all duration-1000" style={{ width: "45%" }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Trend Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Disbursement Trend
              </h3>
              <select className="text-[10px] font-bold uppercase tracking-wider bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 outline-none">
                <option>Last 6 Months</option>
                <option>Year Target</option>
              </select>
            </div>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={payrollTrendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }}
                    dy={10}
                  />
                  <YAxis
                    hide={isMobile}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "none",
                      borderRadius: "16px",
                      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="hsl(218 85% 33%)"
                    strokeWidth={4}
                    dot={{ r: 4, strokeWidth: 2, fill: 'white' }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    name="Growth"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-base font-bold text-gray-800 mb-4">Pending Approvals</h3>
            <div className="space-y-2">
              {pendingApprovals.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100 hover:border-primary/20 transition-all group">
                  <div className="flex flex-col">
                    <p className="text-sm font-bold text-gray-700">{item.description}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Ref: SF-PR-{item.id}092</p>
                  </div>
                  <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${item.status === "Pending" ? "bg-orange-50 text-orange-600" : "bg-primary/10 text-primary"
                    }`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-base font-bold text-gray-800 mb-4">Internal Audit Trail</h3>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4">
                  <div className={`w-1.5 h-10 rounded-full ${activity.type === "success" ? "bg-green-500" :
                    activity.type === "warning" ? "bg-orange-500" : "bg-primary"
                    }`} />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-800 leading-none mb-1">{activity.action}</p>
                    <p className="text-[10px] text-gray-400 font-medium">
                      Executed by <span className="font-bold text-gray-600">{activity.user}</span> · {activity.date}
                    </p>
                  </div>
                  <button className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wider">Detail</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}