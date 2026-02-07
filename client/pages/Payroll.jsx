import DashboardLayout from "@/components/DashboardLayout";
import { useState } from "react";
import { ChevronRight, Lock, Download, Save } from "lucide-react";




















const samplePayroll = [
  {
    empId: "EMP001",
    name: "Rajesh Kumar",
    department: "Administration",
    basicPay: 50000,
    da: 15000,
    hra: 12000,
    allowances: 3000,
    grossSalary: 80000,
    pf: 6000,
    esi: 1200,
    pt: 200,
    advance: 5000,
    otherDeductions: 500,
    totalDeductions: 12900,
    netSalary: 67100,
    status: "Calculated"
  },
  {
    empId: "EMP002",
    name: "Priya Sharma",
    department: "Teaching",
    basicPay: 45000,
    da: 13500,
    hra: 10800,
    allowances: 2000,
    grossSalary: 71300,
    pf: 5400,
    esi: 1200,
    pt: 200,
    advance: 0,
    otherDeductions: 300,
    totalDeductions: 7100,
    netSalary: 64200,
    status: "Calculated"
  },
  {
    empId: "EMP003",
    name: "Amit Patel",
    department: "Support Staff",
    basicPay: 25000,
    da: 7500,
    hra: 6000,
    allowances: 1000,
    grossSalary: 39500,
    pf: 2000,
    esi: 600,
    pt: 0,
    advance: 2000,
    otherDeductions: 200,
    totalDeductions: 4800,
    netSalary: 34700,
    status: "Calculated"
  }];


const months = ["January", "February", "March", "April", "May", "June"];
const years = [2024, 2023, 2022];
const paymentModes = [
  "Cheque with PF",
  "Cheque without PF",
  "Cash with PF",
  "Cash without PF"];


export default function Payroll() {
  const [selectedMonth, setSelectedMonth] = useState("June");
  const [selectedYear, setSelectedYear] = useState("2024");
  const [selectedMode, setSelectedMode] = useState("Cheque with PF");
  const [payrollData, setPayrollData] = useState(samplePayroll);
  const [payrollStatus, setPayrollStatus] = useState("Pending");
  const [expandedRow, setExpandedRow] = useState(null);

  const totalGrossSalary = payrollData.reduce((sum, p) => sum + p.grossSalary, 0);
  const totalDeductions = payrollData.reduce((sum, p) => sum + p.totalDeductions, 0);
  const totalNetSalary = payrollData.reduce((sum, p) => sum + p.netSalary, 0);
  const totalPF = payrollData.reduce((sum, p) => sum + p.pf, 0);
  const totalESI = payrollData.reduce((sum, p) => sum + p.esi, 0);

  const handleCalculatePayroll = () => {
    setPayrollStatus("Calculated");
  };

  const handleFinalizePayroll = () => {
    setPayrollStatus("Finalized");
  };

  const handleLockPayroll = () => {
    setPayrollStatus("Locked");
  };

  return (
    <DashboardLayout activeRoute="payroll">
      <div className="grid gap-4 sm:gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-1">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Payroll Processing</h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Process, finalize & lock monthly disbursement cycles
            </p>
          </div>
          <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all active:scale-95 shadow-sm">
            <Download className="w-4 h-4" />
            Export Summary
          </button>
        </div>

        {/* Period Selection */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 ml-1">Payroll Period</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Month</label>
              <select
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:border-primary cursor-pointer transition-all font-medium"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                {months.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Year</label>
              <select
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:border-primary cursor-pointer transition-all font-medium"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Payment Mode</label>
              <select
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:border-primary cursor-pointer transition-all font-medium"
                value={selectedMode}
                onChange={(e) => setSelectedMode(e.target.value)}
              >
                {paymentModes.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className={`p-3 rounded-xl ${payrollStatus === 'Locked' ? 'bg-green-50 text-green-600' : 'bg-primary/5 text-primary'
              }`}>
              {payrollStatus === 'Locked' ? <Lock className="w-5 h-5" /> : <Save className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cycle Status</p>
              <p className="text-lg font-black text-gray-900 leading-none">{payrollStatus}</p>
            </div>
          </div>

          <div className="flex w-full sm:w-auto gap-2">
            {payrollStatus === "Pending" && (
              <button onClick={handleCalculatePayroll} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 active:scale-95 transition-all">
                Run Engine
              </button>
            )}
            {payrollStatus === "Calculated" && (
              <>
                <button className="flex-1 sm:flex-none px-4 py-2.5 bg-gray-50 text-gray-600 rounded-xl font-bold text-sm">Review</button>
                <button onClick={handleFinalizePayroll} className="flex-1 sm:flex-none bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 active:scale-95">Finalize</button>
              </>
            )}
            {payrollStatus === "Finalized" && (
              <button onClick={handleLockPayroll} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-all">
                <Lock className="w-4 h-4" /> Lock Cycle
              </button>
            )}
            {payrollStatus === "Locked" && (
              <div className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-green-50 text-green-700 px-6 py-2.5 rounded-xl font-bold text-sm border border-green-100">
                Processed & Locked
              </div>
            )}
          </div>
        </div>

        {/* Financial KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Gross Bill</p>
            <p className="text-lg sm:text-2xl font-black text-gray-900">₹{(totalGrossSalary / 100000).toFixed(2)}L</p>
          </div>
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Deductions</p>
            <p className="text-lg sm:text-2xl font-black text-orange-600">₹{(totalDeductions / 100000).toFixed(2)}L</p>
          </div>
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Net Payable</p>
            <p className="text-lg sm:text-2xl font-black text-green-600">₹{(totalNetSalary / 100000).toFixed(2)}L</p>
          </div>
          <div className="bg-primary p-4 sm:p-5 rounded-2xl border border-primary/10 shadow-lg shadow-primary/20">
            <p className="text-[10px] font-bold text-primary-100 uppercase tracking-widest mb-1">Headcount</p>
            <p className="text-lg sm:text-2xl font-black text-white">{payrollData.length}</p>
          </div>
        </div>

        {/* Adaptive Table */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest">Disbursement Journal</h3>
            <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">Real-time Calculation</span>
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50/50 text-gray-500 font-bold border-b border-gray-100 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-4">Beneficiary</th>
                  <th className="px-6 py-4 text-right">Basic</th>
                  <th className="px-6 py-4 text-right">Gross</th>
                  <th className="px-6 py-4 text-right text-primary">EPF</th>
                  <th className="px-6 py-4 text-right text-green-600">ESI</th>
                  <th className="px-6 py-4 text-right text-orange-600">Deductions</th>
                  <th className="px-6 py-4 text-right font-black">Net Salary</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payrollData.map((record) => (
                  <tr key={record.empId} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900 leading-none mb-1">{record.name}</div>
                      <div className="text-[10px] text-gray-400 font-bold font-mono uppercase">{record.empId}</div>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-gray-600">₹{record.basicPay.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900">₹{record.grossSalary.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right font-bold text-primary">₹{record.pf.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right font-bold text-green-600">₹{record.esi.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right font-bold text-orange-600">₹{record.totalDeductions.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right font-black text-gray-900">₹{record.netSalary.toLocaleString()}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-primary/5 text-primary">
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Layout */}
          <div className="lg:hidden divide-y divide-gray-100">
            {payrollData.map((record) => (
              <div
                key={record.empId}
                className="p-4 bg-white active:bg-gray-50 transition-colors"
                onClick={() => setExpandedRow(expandedRow === record.empId ? null : record.empId)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-primary">
                      <div className="text-xs font-bold leading-none">{record.name.split(' ').map(n => n[0]).join('')}</div>
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 leading-none mb-1">{record.name}</div>
                      <div className="text-[10px] text-gray-400 font-bold font-mono tracking-widest">{record.empId}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-gray-900">₹{record.netSalary.toLocaleString()}</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase">Net Payable</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
                    <p className="text-[8px] font-bold text-gray-400 uppercase mb-0.5">Gross</p>
                    <p className="text-xs font-bold text-gray-800">₹{record.grossSalary.toLocaleString()}</p>
                  </div>
                  <div className="bg-red-50/30 p-2 rounded-xl border border-red-50">
                    <p className="text-[8px] font-bold text-red-400 uppercase mb-0.5">Total Deduct</p>
                    <p className="text-xs font-bold text-red-600 text-right">₹{record.totalDeductions.toLocaleString()}</p>
                  </div>
                </div>

                {expandedRow === record.empId && (
                  <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div>
                      <p className="text-[8px] font-bold text-gray-400 uppercase mb-1">Earnings Brkup</p>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px]"><span className="text-gray-500">Basic</span> <span className="font-bold text-gray-700">₹{record.basicPay}</span></div>
                        <div className="flex justify-between text-[10px]"><span className="text-gray-500">DA</span> <span className="font-bold text-gray-700">₹{record.da || 0}</span></div>
                        <div className="flex justify-between text-[10px]"><span className="text-gray-500">HRA</span> <span className="font-bold text-gray-700">₹{record.hra || 0}</span></div>
                      </div>
                    </div>
                    <div>
                      <p className="text-[8px] font-bold text-gray-400 uppercase mb-1">Deduction Brkup</p>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-primary-600"><span>EPF</span> <span>₹{record.pf}</span></div>
                        <div className="flex justify-between text-[10px] font-bold text-green-600"><span>ESI</span> <span>₹{record.esi}</span></div>
                        <div className="flex justify-between text-[10px] font-bold text-orange-600"><span>Prof Tx</span> <span>₹{record.pt}</span></div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-3 flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  <span>{record.department}</span>
                  <ChevronRight className={`w-3 h-3 transition-transform ${expandedRow === record.empId ? 'rotate-90' : ''}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}