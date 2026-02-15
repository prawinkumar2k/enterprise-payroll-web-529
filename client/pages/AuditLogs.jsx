import { useState, useEffect } from "react";
import { Search, Filter, RotateCcw, Download } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedLog, setExpandedLog] = useState(null); // For mobile detail view

  // Filters
  const [userNameFilter, setUserNameFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const params = new URLSearchParams();
      if (userNameFilter) params.append("user", userNameFilter);
      if (roleFilter) params.append("role", roleFilter);
      if (actionFilter) params.append("actionType", actionFilter);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const res = await fetch(`/api/logs?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.success) {
        setLogs(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to fetch logs");
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setUserNameFilter("");
    setRoleFilter("");
    setActionFilter("");
    setStartDate("");
    setEndDate("");
    fetchLogsWithParams("", "", "", "", "");
  };

  const fetchLogsWithParams = async (u, r, a, s, e) => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const params = new URLSearchParams();
    if (u) params.append("user", u);
    if (r) params.append("role", r);
    if (a) params.append("actionType", a);
    if (s) params.append("startDate", s);
    if (e) params.append("endDate", e);
    try {
      const res = await fetch(`/api/logs?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setLogs(data.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  }

  return (
    <DashboardLayout activeRoute="audit-logs">
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-1">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Log Details</h1>
            <p className="text-xs sm:text-sm text-gray-500">Immutable enterprise audit trail</p>
          </div>
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="lg:hidden w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 active:bg-gray-50 transition-colors shadow-sm"
          >
            <Filter className="w-4 h-4" />
            {filtersOpen ? "Hide Filters" : "Show Filters"}
          </button>
        </div>

        {/* Adaptive Filter Bar */}
        <div className={`${filtersOpen ? 'flex' : 'hidden'} lg:flex bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex-col lg:flex-row flex-wrap gap-4 items-stretch lg:items-end transition-all duration-300`}>
          <div className="space-y-1.5 flex-1 min-w-[200px]">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">User Name</label>
            <input
              type="text"
              placeholder="Search user..."
              className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
              value={userNameFilter}
              onChange={e => setUserNameFilter(e.target.value)}
            />
          </div>

          <div className="space-y-1.5 lg:w-40">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Role</label>
            <select
              className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:border-primary cursor-pointer"
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="Auditor">Auditor</option>
              <option value="manager">Manager</option>
              <option value="employee">Employee</option>
            </select>
          </div>

          <div className="space-y-1.5 flex-1 min-w-[200px]">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Action Type</label>
            <input
              type="text"
              placeholder="e.g. LOGIN"
              className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary"
              value={actionFilter}
              onChange={e => setActionFilter(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Date Range</label>
            <div className="flex gap-2">
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none bg-gray-50 focus:bg-white"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none bg-gray-50 focus:bg-white"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2 lg:pt-0">
            <button
              onClick={() => fetchLogsWithParams(userNameFilter, roleFilter, actionFilter, startDate, endDate)}
              className="flex-1 lg:flex-none bg-primary text-white px-6 py-2 rounded-xl hover:bg-primary-700 transition shadow-lg shadow-primary/20 flex items-center justify-center gap-2 text-sm font-bold"
            >
              <Search className="w-4 h-4" />
              Apply
            </button>
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-2 text-sm"
              title="Reset Filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Adaptive Display */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50/50 text-gray-500 font-bold border-b border-gray-100 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-4">User Details</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Module</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan="6" className="p-12 text-center text-gray-400">Syncing audit trail...</td></tr>
                ) : logs.length === 0 ? (
                  <tr><td colSpan="6" className="p-12 text-center text-gray-400 font-medium">No logs recorded for this period.</td></tr>
                ) : (
                  logs.map(log => (
                    <tr key={log.LogID || log.id} className="hover:bg-gray-50/50 transition-colors whitespace-nowrap group">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{log.UserName}</div>
                        <div className="text-[10px] text-gray-400 font-mono tracking-tighter">ID: {log.UserID} • {log.Role}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${log.ActionType?.includes('FAILURE') ? 'bg-red-50 text-red-600' :
                          log.ActionType === 'LOGIN' ? 'bg-green-50 text-green-600' :
                            'bg-primary/5 text-primary'
                          }`}>
                          {log.ActionType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded border border-gray-100 uppercase">
                          {log.Module}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-[300px] truncate text-gray-600" title={log.Description}>
                          {log.Description}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-[10px] text-gray-400">{log.IPAddress}</td>
                      <td className="px-6 py-4 text-xs">
                        <div className="text-gray-900 font-medium">
                          {log.LogDate ? new Date(log.LogDate).toLocaleDateString() : '-'}
                        </div>
                        <div className="text-gray-400 font-mono text-[10px]">{log.LogTime || '-'}</div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-gray-100">
            {loading ? (
              <div className="p-12 text-center text-gray-400">Syncing...</div>
            ) : logs.length === 0 ? (
              <div className="p-12 text-center text-gray-400 font-medium whitespace-normal">No logs recorded.</div>
            ) : (
              logs.map(log => (
                <div
                  key={log.LogID || log.id}
                  className="p-4 bg-white active:bg-gray-50 transition-colors"
                  onClick={() => setExpandedLog(expandedLog === (log.LogID || log.id) ? null : (log.LogID || log.id))}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-primary font-bold text-xs border border-gray-200">
                        {log.UserName?.charAt(0) || '?'}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-sm leading-tight">{log.UserName || 'Unknown'}</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">{log.Role || 'N/A'}</div>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${log.ActionType?.includes('FAILURE') ? 'bg-red-50 text-red-600' :
                      log.ActionType === 'LOGIN' ? 'bg-green-50 text-green-600' :
                        'bg-primary/5 text-primary'
                      }`}>
                      {log.ActionType}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[9px] font-bold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 uppercase">
                      {log.Module}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono italic">@{log.IPAddress}</span>
                  </div>

                  <p className={`text-xs text-gray-600 leading-relaxed ${expandedLog === (log.LogID || log.id) ? '' : 'line-clamp-2'}`}>
                    {log.Description}
                  </p>

                  <div className="mt-3 flex justify-between items-center text-[10px] border-t border-gray-50 pt-3">
                    <div className="text-gray-400 font-bold uppercase tracking-tighter">ID: {log.UserID}</div>
                    <div className="text-gray-500 font-bold">
                      {log.LogDate ? new Date(log.LogDate).toLocaleDateString() : '-'} • {log.LogTime}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}