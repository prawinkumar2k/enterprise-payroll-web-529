import DashboardLayout from "@/components/DashboardLayout";
import { useState } from "react";
import { FileText, Download, Eye, Calendar, Filter } from "lucide-react";









const availableReports = [
  {
    id: "1",
    name: "Pay Bill Detail",
    description: "Detailed salary bill with employee-wise breakdown",
    type: "Financial",
    icon: "📊"
  },
  {
    id: "2",
    name: "Pay Bill Abstract",
    description: "Summary salary bill for approval and submission",
    type: "Financial",
    icon: "📋"
  },
  {
    id: "3",
    name: "Bank Statement",
    description: "Bank transfer statement for payroll processing",
    type: "Financial",
    icon: "🏦"
  },
  {
    id: "4",
    name: "Staff Report",
    description: "Complete staff attendance and payroll report",
    type: "HR",
    icon: "👥"
  },
  {
    id: "5",
    name: "Pay Certificate",
    description: "Individual pay certificate for employees",
    type: "Employee",
    icon: "📄"
  },
  {
    id: "6",
    name: "Bonus Pay Bill",
    description: "Bonus and special allowance bill",
    type: "Financial",
    icon: "💰"
  },
  {
    id: "7",
    name: "PF Contribution Register",
    description: "PF employee and employer contributions",
    type: "Statutory",
    icon: "📑"
  },
  {
    id: "8",
    name: "ESI Register",
    description: "ESI employee and employer details",
    type: "Statutory",
    icon: "📑"
  }];


const months = ["January", "February", "March", "April", "May", "June"];
const categories = ["Teaching", "Non-Teaching", "All"];
const reportTypes = ["All", "Financial", "HR", "Employee", "Statutory"];

export default function Reports() {
  const [selectedMonth, setSelectedMonth] = useState("June");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedReportType, setSelectedReportType] = useState("All");
  const [selectedReports, setSelectedReports] = useState([]);
  const [showSignatures, setShowSignatures] = useState(false);

  const filteredReports = availableReports.filter((report) => {
    const typeMatch =
      selectedReportType === "All" || report.type === selectedReportType;
    return typeMatch;
  });

  const toggleReportSelection = (reportId) => {
    setSelectedReports((prev) =>
      prev.includes(reportId) ?
        prev.filter((id) => id !== reportId) :
        [...prev, reportId]
    );
  };

  const handleGenerateReport = () => {
    console.log("Generating reports:", {
      month: selectedMonth,
      category: selectedCategory,
      reports: selectedReports,
      showSignatures
    });
  };

  return (
    <DashboardLayout activeRoute="reports">
      <div className="space-y-6">
        {/* Header */}
        <div className="px-1 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Intelligence & Analytics</h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Generate statutory filings, internal audits & financial statements
            </p>
          </div>
          <button
            onClick={handleGenerateReport}
            disabled={selectedReports.length === 0}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-700 disabled:opacity-50 disabled:grayscale transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            Generate ({selectedReports.length})
          </button>
        </div>

        {/* Global Parameters */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-100 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                <Calendar className="w-3 h-3" /> Period
              </label>
              <select
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:border-primary font-medium"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                {months.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Workforce Segment</label>
              <select
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:border-primary font-medium"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Report Classification</label>
              <select
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:border-primary font-medium"
                value={selectedReportType}
                onChange={(e) => setSelectedReportType(e.target.value)}
              >
                {reportTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end pb-1.5">
              <label className="flex items-center gap-3 cursor-pointer select-none group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={showSignatures}
                    onChange={(e) => setShowSignatures(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-10 h-5 rounded-full transition-colors ${showSignatures ? 'bg-primary' : 'bg-gray-200'}`} />
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${showSignatures ? 'translate-x-5' : ''}`} />
                </div>
                <span className="text-xs font-bold text-gray-500 group-hover:text-gray-700 transition-colors">Digital Signatures</span>
              </label>
            </div>
          </div>
        </div>

        {/* Report Selection Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              onClick={() => toggleReportSelection(report.id)}
              className={`group relative p-6 rounded-3xl border-2 transition-all duration-300 ${selectedReports.includes(report.id)
                ? "bg-primary/5 border-primary shadow-lg shadow-primary/10"
                : "bg-white border-gray-100 hover:border-gray-200 hover:shadow-md"
                }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-500">
                  {report.icon}
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedReports.includes(report.id) ? 'bg-primary border-primary' : 'bg-transparent border-gray-200'
                  }`}>
                  {selectedReports.includes(report.id) && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </div>

              <h3 className="font-bold text-gray-800 mb-1 leading-tight">{report.name}</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-3">{report.type}</p>
              <p className="text-xs text-gray-500 leading-relaxed min-h-[3em]">{report.description}</p>

              <div className="mt-4 flex gap-2 pt-4 border-t border-gray-50 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                <button className="flex-1 py-1.5 bg-gray-50 text-gray-600 rounded-lg font-bold text-[10px] hover:bg-gray-100">PREVIEW</button>
                <button className="flex-1 py-1.5 bg-primary/10 text-primary rounded-lg font-bold text-[10px] hover:bg-primary/20">DOWNLOAD</button>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Downloads Table-ish view for mobile */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-800">Transmission History</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {[
              { name: "Pay Bill Detail - May 2024", date: "2024-06-01", size: "2.4 MB", type: "PDF" },
              { name: "Bank Statement - May 2024", date: "2024-06-01", size: "1.1 MB", type: "XLSX" },
              { name: "Staff Report - April 2024", date: "2024-05-02", size: "3.2 MB", type: "PDF" },
            ].map((report, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-gray-50 rounded-xl text-primary">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{report.name}</p>
                    <p className="text-[10px] text-gray-400 font-bold">
                      GEN ON {report.date} • {report.size} • {report.type}
                    </p>
                  </div>
                </div>
                <button className="p-2 text-gray-400 hover:text-primary active:scale-90 transition-all">
                  <Download className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
          <div className="p-4 bg-gray-50/50 text-center">
            <button className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">View Full Archive</button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}