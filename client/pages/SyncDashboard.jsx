
import { useState, useEffect } from "react";
import {
    RefreshCw,
    Cloud,
    CloudOff,
    Database,
    History,
    AlertTriangle,
    CheckCircle2,
    Activity,
    ArrowUpRight,
    ArrowDownLeft,
    ShieldAlert
} from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import { useSync, SYNC_MODES } from "../context/SyncContext";
import axios from "axios";
import { getApiUrl } from "../lib/api";

export default function SyncDashboard() {
    const { mode, lastSync, isSyncing, triggerManualSync, error: syncError, refreshStatus } = useSync();
    const [logs, setLogs] = useState([]);
    const [loadingLogs, setLoadingLogs] = useState(true);
    const [resetting, setResetting] = useState(false);

    useEffect(() => {
        fetchSyncLogs();
    }, []);

    const fetchSyncLogs = async () => {
        try {
            setLoadingLogs(true);
            const token = localStorage.getItem("token");
            const res = await axios.get(getApiUrl("/sync/logs"), {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setLogs(res.data.data);
            }
        } catch (err) {
            console.error("Failed to fetch sync logs", err);
        } finally {
            setLoadingLogs(false);
        }
    };

    const handleModeReset = async () => {
        if (!window.confirm("CRITICAL ACTION: This will manually force the system status to ONLINE. Only use this if a sync is frozen. Proceed?")) return;

        try {
            setResetting(true);
            const token = localStorage.getItem("token");
            await axios.post(getApiUrl("/sync/reset"), {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await refreshStatus();
            alert("System mode reset to ONLINE.");
        } catch (err) {
            alert("Reset failed: " + err.message);
        } finally {
            setResetting(false);
        }
    };

    return (
        <DashboardLayout activeRoute="settings">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Synchronization Center</h1>
                        <p className="text-sm text-muted-foreground">Manage your hybrid cloud-to-local data bridge.</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleModeReset}
                            disabled={resetting}
                            className="px-4 py-2 border border-destructive/20 text-destructive text-sm font-bold rounded-xl hover:bg-destructive/5 transition flex items-center gap-2"
                        >
                            <ShieldAlert className="w-4 h-4" />
                            Emergency Reset
                        </button>
                        <button
                            onClick={triggerManualSync}
                            disabled={isSyncing}
                            className="px-6 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 transition flex items-center gap-2"
                        >
                            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                            Run Full Sync
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Connection Status Card */}
                    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest leading-none">Connection</p>
                            {mode === SYNC_MODES.ONLINE ? (
                                <div className="p-2 bg-green-500/10 rounded-full"><Cloud className="w-5 h-5 text-green-500" /></div>
                            ) : (
                                <div className="p-2 bg-orange-500/10 rounded-full"><CloudOff className="w-5 h-5 text-orange-500" /></div>
                            )}
                        </div>
                        <h3 className="text-3xl font-black text-foreground">{mode}</h3>
                        <p className="text-xs text-muted-foreground mt-2 font-medium">
                            {mode === SYNC_MODES.ONLINE
                                ? "Connected to Cloud Authority"
                                : "Running on Local Persistence (SQLite)"
                            }
                        </p>
                    </div>

                    {/* Last Successful Sync Card */}
                    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest leading-none">Last Success</p>
                            <div className="p-2 bg-primary/10 rounded-full"><History className="w-5 h-5 text-primary" /></div>
                        </div>
                        <h3 className="text-2xl font-black text-foreground">
                            {lastSync ? new Date(lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never'}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-2 font-medium">
                            {lastSync ? new Date(lastSync).toLocaleDateString() : 'Initial sync pending'}
                        </p>
                    </div>

                    {/* Health Card */}
                    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest leading-none">Conflict Monitor</p>
                            <div className="p-2 bg-blue-500/10 rounded-full"><Activity className="w-5 h-5 text-blue-500" /></div>
                        </div>
                        <h3 className="text-3xl font-black text-foreground">
                            {logs.filter(l => l.status === 'CONFLICT').length}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-2 font-medium">
                            Active version collisions requiring review
                        </p>
                    </div>
                </div>

                {/* Sync History Table */}
                <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-border flex justify-between items-center">
                        <h2 className="font-bold text-foreground flex items-center gap-2">
                            <History className="w-5 h-5 text-muted-foreground" />
                            Sync History
                        </h2>
                        <button
                            onClick={fetchSyncLogs}
                            className="text-xs font-bold text-primary hover:underline hover:text-primary/80 transition"
                        >
                            Refresh Logs
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/5 text-muted-foreground font-black border-b border-border uppercase tracking-widest text-[10px]">
                                <tr>
                                    <th className="px-6 py-4">Action</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Table / UUID</th>
                                    <th className="px-6 py-4">Reason / Notes</th>
                                    <th className="px-6 py-4 text-right">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {loadingLogs ? (
                                    <tr><td colSpan="5" className="px-6 py-12 text-center text-muted-foreground font-medium italic">Loading logs...</td></tr>
                                ) : logs.length === 0 ? (
                                    <tr><td colSpan="5" className="px-6 py-12 text-center text-muted-foreground font-medium">No sync events recorded yet.</td></tr>
                                ) : (
                                    logs.map(log => (
                                        <tr key={log.id} className="hover:bg-muted/5 transition-colors whitespace-nowrap">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {log.action === 'PUSH' ? (
                                                        <ArrowUpRight className="w-4 h-4 text-blue-500" />
                                                    ) : (
                                                        <ArrowDownLeft className="w-4 h-4 text-green-500" />
                                                    )}
                                                    <span className="font-bold text-foreground uppercase text-xs">{log.action}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5">
                                                    {log.status === 'SUCCESS' && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
                                                    {log.status === 'CONFLICT' && <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />}
                                                    {log.status === 'ERROR' && <ShieldAlert className="w-3.5 h-3.5 text-red-500" />}
                                                    <span className={`text-[10px] font-black uppercase ${log.status === 'SUCCESS' ? 'text-green-600' :
                                                            log.status === 'CONFLICT' ? 'text-orange-600' : 'text-red-600'
                                                        }`}>
                                                        {log.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-foreground text-xs">{log.table_name || 'N/A'}</div>
                                                <div className="text-[9px] text-muted-foreground font-mono truncate max-w-[150px]">{log.record_uuid || 'BATCH'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="max-w-[200px] truncate text-muted-foreground text-xs" title={log.error_message}>
                                                    {log.conflict_reason || log.error_message || 'OK'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="text-foreground font-medium text-xs">
                                                    {new Date(log.created_at).toLocaleDateString()}
                                                </div>
                                                <div className="text-muted-foreground font-mono text-[10px]">
                                                    {new Date(log.created_at).toLocaleTimeString()}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
