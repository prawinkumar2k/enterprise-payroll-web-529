import { useReducer, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";
import { useSync, SYNC_MODES } from "../context/SyncContext";
import {
  Settings,
  Menu,
  Users,
  Calculator,
  FileText,
  ScrollText,
  Home,
  ChevronDown,
  Calendar,
  RefreshCw,
  Cloud,
  CloudOff,
  Database,
  AlertCircle,
  LogOut,
  Building2,
  Shield,
  Wallet,
  Sun,
  Moon,
  User,
  BarChart3,
  IndianRupee,
  Clock,
} from "lucide-react";

function NavSidebar({
  menuItems,
  sidebarOpen,
  mobileSidebarOpen,
  setMobileSidebarOpen,
  filesOpen, setFilesOpen,
  reportsOpen, setReportsOpen,
  attendanceOpen, setAttendanceOpen,
  financeOpen, setFinanceOpen,
  monitoringOpen, setMonitoringOpen,
  activeRoute
}) {
  return (
    <nav className="flex-1 px-4 py-6 overflow-y-auto">
      <ul className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeRoute === item.id || (item.subItems?.some(s => s.id === activeRoute));

          if (item.subItems) {
            const isOpen = item.id === 'files' ? filesOpen :
              (item.id === 'reports' ? reportsOpen :
                (item.id === 'attendance' ? attendanceOpen :
                  (item.id === 'finance' ? financeOpen : 
                    (item.id === 'monitoring' ? monitoringOpen : false))));

            const toggleOpen = () => {
              if (item.id === 'files') setFilesOpen(!filesOpen);
              if (item.id === 'reports') setReportsOpen(!reportsOpen);
              if (item.id === 'attendance') setAttendanceOpen(!attendanceOpen);
              if (item.id === 'finance') setFinanceOpen(!financeOpen);
              if (item.id === 'monitoring') setMonitoringOpen(!monitoringOpen);
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
}

const initialLayoutState = {
  sidebarOpen: true,
  mobileSidebarOpen: false,
  userMenuOpen: false,
  filesOpen: false,
  reportsOpen: false,
  attendanceOpen: false,
  financeOpen: false,
  monitoringOpen: false,
  exporting: false,
};

function layoutReducer(state, action) {
  switch (action.type) {
    case 'SET': return { ...state, [action.field]: action.value };
    case 'TOGGLE': return { ...state, [action.field]: !state[action.field] };
    default: return state;
  }
}

export default function DashboardLayout({
  children,
  activeRoute = "dashboard"
}) {
  const { settings, theme, toggleTheme } = useSettings();
  const { mode, lastSync, isSyncing, progress, pendingCount, triggerManualSync } = useSync();
  const [state, dispatch] = useReducer(layoutReducer, initialLayoutState);
  const profileMenuRef = useRef(null);

  // Get user info from localStorage
  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
  })();

  const currentUser = {
    username: storedUser.username || storedUser.UserID || 'User',
    name: storedUser.name || storedUser.UserName || storedUser.username || 'User',
    role: (storedUser.role || storedUser.Role || 'employee').toLowerCase(),
    company_name: storedUser.company_name || storedUser.company_code || 'Enterprise',
    company_code: storedUser.company_code || '',
  };

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        dispatch({ type: 'SET', field: 'userMenuOpen', value: false });
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '#/login';
  };

  const roleLabel = {
    admin: 'Administrator',
    hr_officer: 'HR Officer',
    accountant: 'Accountant',
    auditor: 'Auditor',
    employee: 'Employee',
    company_admin: 'Company Admin',
    super_admin: 'Super Admin',
  }[currentUser.role] || currentUser.role;

  const { sidebarOpen, mobileSidebarOpen, userMenuOpen, filesOpen, reportsOpen, attendanceOpen, financeOpen, monitoringOpen, exporting } = state;

  const { data: betaStatus } = useQuery({
    queryKey: ['beta-status'],
    queryFn: () => fetch('/api/beta/status', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }).then(res => res.json()),
    retry: false,
    staleTime: 60_000,
  });

  const handleExportDiagnostics = async () => {
    dispatch({ type: 'SET', field: 'exporting', value: true });
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
    } catch {
      alert('Network error during diagnostic export.');
    } finally {
      dispatch({ type: 'SET', field: 'exporting', value: false });
    }
  };

  // DYNAMIC MENU ITEMS GENERATOR
  const adminMenuItems = [
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
        { id: "pay-bill-detail", label: settings?.title_pay_bill || "Pay Bill Detail", href: "/reports/pay-bill", feature: 'enable_pay_bill' },
        { id: "pay-bill-abstract", label: "Pay Bill Abstract", href: "/reports/pay-bill-abstract", feature: 'enable_pay_bill' },
        { id: "bank-statement", label: settings?.title_bank_statement || "Bank Statement", href: "/reports/bank-statement", feature: 'enable_bank_statement' },
        { id: "abstract-1", label: settings?.title_abstract_1 || "Abstract 1", href: "/reports/abstract-1", feature: 'enable_abstract_1' },
        { id: "abstract-2", label: settings?.title_abstract_2 || "Abstract 2", href: "/reports/abstract-2", feature: 'enable_abstract_2' },
        { id: "pay-certificate", label: settings?.title_pay_certificate || "Pay Certificate", href: "/reports/pay-certificate", feature: 'enable_pay_certificate' },
        { id: "staff-report", label: settings?.title_staff_report || "Staff Report", href: "/reports/staff-report", feature: 'enable_staff_report' }
      ]
    },
    {
      id: "finance",
      label: "FINANCE",
      icon: Wallet,
      feature: 'enable_income',
      subItems: [
        { id: "income", label: "Income", href: "/income", feature: 'enable_income' },
        { id: "expense", label: "Expense", href: "/expense", feature: 'enable_expense' },
        { id: "finance-dashboard", label: "Finance Dashboard", href: "/finance/dashboard" },
      ]
    },
    { id: "salary-revisions", label: "Salary Revisions", icon: BarChart3, href: "/salary-revisions" },
    {
      id: "monitoring",
      label: "MONITORING",
      icon: Shield,
      subItems: [
        { id: "mon-employees", label: "Employee List", href: "/company/employees" },
        { id: "mon-attendance", label: "Real-time Attendance", href: "/company/attendance" },
        { id: "mon-work", label: "Work Submissions", href: "/company/work" },
        { id: "mon-salary", label: "Salary Estimates", href: "/company/salary" },
        { id: "mon-leaves", label: "Leave Requests", href: "/company/leaves" },
        { id: "mon-permissions", label: "Permission Requests", href: "/company/permissions" },
      ]
    },
    { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
    { id: "license", label: "Licensing", icon: Database, href: "/license" },
    { id: "sync", label: "Sync Center", icon: RefreshCw, href: "/sync" }
  ];

  const employeeMenuItems = [
    { id: "ess-dashboard", label: "Command Center", icon: Home, href: "/employee/dashboard" },
    { id: "my-attendance", label: "My History", icon: Clock, href: "/employee/attendance" },
    { id: "my-leaves", label: "Leaves", icon: FileText, href: "/employee/leaves" },
    { id: "my-permissions", label: "Permissions", icon: Shield, href: "/employee/permissions" },
    { id: "my-work", label: "Work History", icon: ScrollText, href: "/employee/work" },
    { id: "my-salary", label: "Salary", icon: IndianRupee, href: "/employee/salary" },
    { id: "my-profile", label: "Profile", icon: User, href: "/employee/profile" },
  ];

  const isEmployee = currentUser.role === 'employee';
  const menuItems = isEmployee ? employeeMenuItems : adminMenuItems;

  const themeClasses = isEmployee 
    ? "bg-emerald-50/10 [--sidebar-primary:#059669] [--sidebar-primary-foreground:#ffffff]" 
    : "bg-indigo-50/10 [--sidebar-primary:#4f46e5] [--sidebar-primary-foreground:#ffffff]";

  return (
    <div className={`flex h-screen bg-background overflow-hidden relative ${theme === 'dark' ? 'dark' : ''} ${themeClasses}`}>
      {/* 1. Desktop Sidebar */}
      <aside className={`bg-sidebar border-r border-sidebar-border flex flex-col h-full transition-all duration-300 flex-shrink-0 max-lg:hidden ${sidebarOpen ? "w-64" : "w-20"}`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border flex-shrink-0">
          {sidebarOpen ? (
            <Link to="/" className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${isEmployee ? 'bg-emerald-600' : 'bg-indigo-600'}`}>
                <span className="text-white font-bold">
                  {currentUser.company_name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sidebar-foreground truncate tracking-tight leading-none mb-1">{currentUser.company_name}</span>
                <span className={`text-[8px] font-black uppercase tracking-widest ${isEmployee ? 'text-emerald-500' : 'text-indigo-500'}`}>
                  {isEmployee ? 'Field Operations' : 'Management Portal'}
                </span>
              </div>
            </Link>
          ) : (
            <Link to="/" className="flex items-center justify-center w-full">
              <div className="w-8 h-8 bg-sidebar-primary rounded flex items-center justify-center">
                <span className="text-sidebar-primary-foreground font-bold">
                  {currentUser.company_name.charAt(0).toUpperCase()}
                </span>
              </div>
            </Link>
          )}
        </div>

        <NavSidebar
          menuItems={menuItems}
          sidebarOpen={sidebarOpen}
          mobileSidebarOpen={mobileSidebarOpen}
          setMobileSidebarOpen={(v) => dispatch({ type: 'SET', field: 'mobileSidebarOpen', value: v })}
          filesOpen={filesOpen}
          setFilesOpen={(v) => dispatch({ type: 'SET', field: 'filesOpen', value: v })}
          reportsOpen={reportsOpen}
          setReportsOpen={(v) => dispatch({ type: 'SET', field: 'reportsOpen', value: v })}
          attendanceOpen={attendanceOpen}
          setAttendanceOpen={(v) => dispatch({ type: 'SET', field: 'attendanceOpen', value: v })}
          financeOpen={financeOpen}
          setFinanceOpen={(v) => dispatch({ type: 'SET', field: 'financeOpen', value: v })}
          monitoringOpen={monitoringOpen}
          setMonitoringOpen={(v) => dispatch({ type: 'SET', field: 'monitoringOpen', value: v })}
          activeRoute={activeRoute}
        />

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
                  <span className="text-[9px] font-black text-green-500 uppercase">Enterprise</span>
                </div>
              </div>
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-black text-foreground/40 uppercase tracking-tighter text-center w-full">v1.2.5 Premium</span>
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
            <button onClick={() => dispatch({ type: 'TOGGLE', field: 'sidebarOpen' })} className="p-2 hover:bg-secondary rounded-lg transition max-lg:hidden">
              <Menu className="w-5 h-5" />
            </button>
            <button onClick={() => dispatch({ type: 'TOGGLE', field: 'mobileSidebarOpen' })} className="p-2 hover:bg-secondary rounded-lg transition lg:hidden">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-black tracking-tight text-foreground uppercase hidden sm:block">
              {isEmployee ? 'Field Operations' : 'Payroll Authority'}
            </h1>

            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${isEmployee 
               ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' 
               : mode === SYNC_MODES.OFFLINE
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
              }`}>
              <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isEmployee || mode !== SYNC_MODES.OFFLINE ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              {isEmployee ? 'Mission Active' : (mode === SYNC_MODES.OFFLINE ? 'SQLite Only' : 'Cloud Connected')}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-xl bg-muted/50 border border-border flex items-center justify-center hover:bg-muted transition-all text-muted-foreground"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => dispatch({ type: 'TOGGLE', field: 'userMenuOpen' })}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-secondary transition-colors group"
              >
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 border border-primary/20">
                  <User className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="hidden sm:flex flex-col items-start leading-none">
                  <span className="text-sm font-bold text-foreground">{currentUser.name}</span>
                  <span className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter">{currentUser.company_name}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-card border border-border rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                  <div className="px-5 py-4 bg-muted/30 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-foreground truncate uppercase tracking-tight">{currentUser.name}</p>
                        <p className="text-xs text-muted-foreground truncate font-medium">@{currentUser.username}</p>
                      </div>
                    </div>
                  </div>

                  <div className="px-5 py-4 space-y-3.5 border-b border-border">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest leading-none mb-1">Entity Authority</p>
                        <p className="text-sm font-bold text-foreground truncate">{currentUser.company_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Shield className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest leading-none mb-1">Access Protocol</p>
                        <p className="text-sm font-bold text-foreground">{roleLabel}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors text-xs font-black uppercase tracking-widest"
                    >
                      <LogOut className="w-4 h-4" />
                      De-authenticate
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 w-full bg-background overflow-y-auto overflow-x-hidden relative px-4 sm:px-8 py-8">
          {betaStatus?.safeMode && (
            <div className="mb-8 bg-slate-800 text-white px-6 py-3 rounded-2xl flex items-center justify-between shadow-xl border-b border-primary/20">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-orange-400" />
                <div>
                  <p className="text-xs font-black uppercase tracking-widest">System Recovery Engine Active</p>
                  <p className="text-[10px] opacity-80 font-medium">System is operating in a restricted safe state. Background jobs are throttled.</p>
                </div>
              </div>
              <button
                onClick={handleExportDiagnostics}
                className="bg-primary/20 hover:bg-primary/40 text-primary text-[10px] font-black px-4 py-1.5 rounded-lg border border-primary/30 transition-all uppercase tracking-widest"
              >
                Export Logs
              </button>
            </div>
          )}
          {children}
        </main>
      </div>

      {/* Sync Blocking Overlay */}
      {isSyncing && (
        <div className="fixed inset-0 bg-background/40 backdrop-blur-[4px] z-[9999] flex flex-col items-center justify-center cursor-wait transition-all duration-500">
          <div className="bg-card/95 border border-border p-10 rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] flex flex-col items-center gap-6 max-w-sm text-center scale-100 animate-in fade-in zoom-in duration-300">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
              <RefreshCw className="w-16 h-16 text-primary animate-spin relative z-10" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Synchronizing</h3>
              <p className="text-sm text-muted-foreground font-medium px-4">
                Pushing local state to authority. Do not terminate process.
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
