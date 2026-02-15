
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";
import { useSync, SYNC_MODES } from "../context/SyncContext";
import {
  Settings,
  Menu,
  X,
  LogOut,
  Users,
  Calculator,
  FileText,
  ScrollText,
  Home,
  ChevronDown,
  Bell,
  User,
  Calendar,
  BarChart3,
  RefreshCw,
  Cloud,
  CloudOff,
  Database,
  AlertCircle
} from "lucide-react";

export default function DashboardLayout({
  children,
  activeRoute = "dashboard",
  userRole = "Admin",
  disableContentWrapper = false
}) {
  const { isEnabled, settings } = useSettings();
  const { mode, lastSync, isSyncing, progress, pendingCount, triggerManualSync, error } = useSync();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [filesOpen, setFilesOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [betaStatus, setBetaStatus] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetch('/api/beta/status', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => res.json())
      .then(data => setBetaStatus(data))
      .catch(() => { });
  }, []);

  const handleExportDiagnostics = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/beta/diagnostics/export', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      if (data.success) {
        alert(`Diagnostic package exported to Desktop: ${data.fileName}`);
      } else {
        alert('Failed to export diagnostics: ' + data.message);
      }
    } catch (e) {
      alert('Network error during diagnostic export.');
    } finally {
      setExporting(false);
    }
  };

  // DYNAMIC MENU ITEMS GENERATOR
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, href: "/dashboard" },
    {
      id: "files",
      label: "FILES",
      icon: FileText,
      subItems: [
        { id: "users", label: "User Details", href: "/users" },
        { id: "audit-logs", label: "Log Details", href: "/audit-logs" }
      ]
    },
    { id: "employees", label: "Employee Management", icon: Users, href: "/employees" },
    { id: "salary", label: "Salary Processing", icon: Calculator, href: "/salary" },
    {
      id: "attendance",
      label: "ATTENDANCE",
      icon: Calendar,
      feature: 'enable_attendance',
      subItems: [
        { id: "attendance-daily", label: "Daily Attendance", href: "/attendance/daily" },
        { id: "attendance-monthly", label: "Monthly Attendance", href: "/attendance/monthly" },
        { id: "attendance-reports", label: "Attendance Reports", href: "/attendance/reports" }
      ]
    },
    {
      id: "reports",
      label: "REPORTS",
      icon: ScrollText,
      subItems: [
        { id: "pay-bill-detail", label: settings.title_pay_bill || "Pay Bill Detail", href: "/reports/pay-bill", feature: 'enable_pay_bill' },
        { id: "pay-bill-abstract", label: "Pay Bill Abstract", href: "/reports/pay-bill-abstract", feature: 'enable_pay_bill' },
        { id: "bank-statement", label: settings.title_bank_statement || "Bank Statement", href: "/reports/bank-statement", feature: 'enable_bank_statement' },
        { id: "abstract-1", label: settings.title_abstract_1 || "Abstract 1", href: "/reports/abstract-1", feature: 'enable_abstract_1' },
        { id: "abstract-2", label: settings.title_abstract_2 || "Abstract 2", href: "/reports/abstract-2", feature: 'enable_abstract_2' },
        { id: "pay-certificate", label: settings.title_pay_certificate || "Pay Certificate", href: "/reports/pay-certificate", feature: 'enable_pay_certificate' },
        { id: "staff-report", label: settings.title_staff_report || "Staff Report", href: "/reports/staff-report", feature: 'enable_staff_report' }
      ]
    },
    { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
    { id: "license", label: "Licensing", icon: Database, href: "/license" },
    { id: "sync", label: "Sync Center", icon: RefreshCw, href: "/sync" }
  ];

  const NavContent = () => (
    <nav className="flex-1 px-4 py-6 overflow-y-auto">
      <ul className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeRoute === item.id || (item.subItems?.some(s => s.id === activeRoute));

          if (item.subItems) {
            const isOpen = item.id === 'files' ? filesOpen : (item.id === 'reports' ? reportsOpen : (item.id === 'attendance' ? attendanceOpen : false));
            const toggleOpen = () => {
              if (item.id === 'files') setFilesOpen(!filesOpen);
              if (item.id === 'reports') setReportsOpen(!reportsOpen);
              if (item.id === 'attendance') setAttendanceOpen(!attendanceOpen);
            };

            return (
              <li key={item.id} className="space-y-1">
                <button
                  onClick={toggleOpen}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors ${isActive ?
                    "text-sidebar-foreground bg-sidebar-accent/50" :
                    "text-sidebar-foreground hover:bg-sidebar-accent"}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {(sidebarOpen || mobileSidebarOpen) && <span className="text-sm font-medium">{item.label}</span>}
                  </div>
                  {(sidebarOpen || mobileSidebarOpen) && <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
                </button>

                {(sidebarOpen || mobileSidebarOpen) && isOpen && (
                  <ul className="pl-11 space-y-1 mt-1">
                    {item.subItems.map((sub) => (
                      <li key={sub.id}>
                        <Link
                          to={sub.href}
                          onClick={() => setMobileSidebarOpen(false)}
                          className={`block px-4 py-2 rounded-lg text-sm transition-colors ${activeRoute === sub.id ?
                            "text-sidebar-primary bg-sidebar-primary/10 font-semibold" :
                            "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"}`}
                        >
                          {sub.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          }

          return (
            <li key={item.id}>
              <Link
                to={item.href}
                onClick={() => setMobileSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${isActive ?
                  "bg-sidebar-primary text-sidebar-primary-foreground" :
                  "text-sidebar-foreground hover:bg-sidebar-accent"}`
                }>
                <Icon className="w-5 h-5 flex-shrink-0" />
                {(sidebarOpen || mobileSidebarOpen) && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      {/* 1. Desktop Sidebar */}
      <aside className={`bg-sidebar border-r border-sidebar-border flex flex-col h-full transition-all duration-300 flex-shrink-0 hidden lg:flex ${sidebarOpen ? "w-64" : "w-20"}`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border flex-shrink-0">
          {sidebarOpen ? (
            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-sidebar-primary rounded flex items-center justify-center flex-shrink-0">
                <span className="text-sidebar-primary-foreground font-bold">S</span>
              </div>
              <span className="font-bold text-sidebar-foreground truncate tracking-tight">{settings.org_name || "Enterprise Payroll"}</span>
            </Link>
          ) : (
            <Link to="/" className="flex items-center justify-center w-full">
              <div className="w-8 h-8 bg-sidebar-primary rounded flex items-center justify-center">
                <span className="text-sidebar-primary-foreground font-bold">P</span>
              </div>
            </Link>
          )}
        </div>

        <NavContent />

        {sidebarOpen && (
          <div className="p-4 border-t border-sidebar-border mt-auto space-y-3">
            <div className={`rounded-xl p-3 border transition-all duration-300 ${isSyncing
              ? 'bg-blue-500/10 border-blue-500/20'
              : mode === SYNC_MODES.OFFLINE
                ? 'bg-orange-500/10 border-orange-500/20'
                : 'bg-green-500/10 border-green-500/20'
              }`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] uppercase font-bold text-foreground/40 leading-none">System Status</p>
                {mode === SYNC_MODES.ONLINE && <Cloud className="w-3 h-3 text-green-500" />}
                {mode === SYNC_MODES.OFFLINE && <CloudOff className="w-3 h-3 text-orange-500" />}
                {isSyncing && <RefreshCw className="w-3 h-3 text-blue-500 animate-spin" />}
              </div>

              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-blue-500 animate-pulse' : mode === SYNC_MODES.OFFLINE ? 'bg-orange-500' : 'bg-green-500'}`} />
                <p className="text-sm font-bold text-foreground capitalize truncate">{isSyncing ? 'Syncing...' : (mode ? mode.toLowerCase() : 'Offline')}</p>
              </div>

              {pendingCount > 0 && !isSyncing && (
                <p className="text-[10px] text-orange-500 font-bold mt-2">
                  {pendingCount} changes pending
                </p>
              )}

              {lastSync && (
                <p className="text-[10px] text-foreground/60 mt-1 font-medium">
                  Last Sync: {new Date(lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>

            <button
              disabled={isSyncing}
              onClick={triggerManualSync}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground text-xs font-bold hover:opacity-90 disabled:opacity-50 transition"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              Sync Now
            </button>

            {/* SYSTEM INFO */}
            <div className="pt-2 border-t border-sidebar-border/50">
              <div className="flex flex-col gap-1 px-1 mb-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-foreground/30 uppercase tracking-widest">Product Status</span>
                  {betaStatus?.license?.includes('Trial') ? (
                    <span className="text-[9px] font-black text-orange-500 uppercase">Trial Mode</span>
                  ) : (
                    <span className="text-[9px] font-black text-green-500 uppercase">Full Access</span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-black text-foreground/40 uppercase tracking-tighter text-center w-full">v1.0.0 Stable</span>
              </div>
              <button
                onClick={handleExportDiagnostics}
                disabled={exporting}
                className="w-full mt-2 text-[9px] font-bold text-foreground/30 hover:text-primary uppercase tracking-widest text-left px-1 transition-colors flex items-center gap-1.5"
              >
                <div className={`w-1 h-1 rounded-full ${exporting ? 'bg-primary animate-ping' : 'bg-foreground/10'}`} />
                {exporting ? 'Packaging...' : 'System Diagnostics'}
              </button>
            </div>
          </div>
        )}
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 flex-shrink-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-secondary rounded-lg transition">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold">Payroll Engine</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
          </div>
        </header>

        <main className="flex-1 w-full bg-background overflow-y-auto overflow-x-hidden relative px-4 sm:px-8 py-8">
          {betaStatus?.safeMode && (
            <div className="bg-slate-800 text-white px-6 py-2 flex items-center justify-between sticky top-0 z-40 shadow-lg border-b border-primary/20">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-orange-400" />
                <div>
                  <p className="text-xs font-black uppercase tracking-tighter">System Recovery Engine Active</p>
                  <p className="text-[10px] opacity-80 font-medium tracking-tight">System is operating in a restricted safe state. Background sync and intensive jobs are throttled.</p>
                </div>
              </div>
              <button
                onClick={handleExportDiagnostics}
                className="bg-primary/20 hover:bg-primary/40 text-primary text-[10px] font-bold px-3 py-1 rounded-lg border border-primary/30 transition-all uppercase"
              >
                Export System Logs
              </button>
            </div>
          )}
          {children}
        </main>
      </div>

      {/* Sync Blocking Overlay */}
      {isSyncing && (
        <div className="fixed inset-0 bg-background/40 backdrop-blur-[4px] z-[9999] flex flex-col items-center justify-center cursor-wait transition-all duration-500">
          <div className="bg-card/95 border border-border p-10 rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] flex flex-col items-center gap-6 max-w-sm text-center border-t-primary/20 scale-100 animate-in fade-in zoom-in duration-300">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
              <RefreshCw className="w-16 h-16 text-primary animate-spin relative z-10" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Synchronizing</h3>
              <p className="text-sm text-muted-foreground font-medium px-4">
                Pushing your local changes to the cloud authority. Please do not close the application.
              </p>
            </div>

            <div className="w-full space-y-2 px-4">
              <div className="flex justify-between text-[11px] font-black text-muted-foreground uppercase tracking-widest">
                <span>{progress.stage || 'Preparing'}</span>
                <span>{progress.percent}%</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500 ease-out"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground font-bold">
                {progress.current} / {progress.total} Records Processed
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}