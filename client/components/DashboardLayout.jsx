import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Menu,
  X,
  LogOut,
  Settings,

  Users,
  Calculator,
  FileText,
  ScrollText,
  Home,
  ChevronDown,
  Bell,
  User
} from
  "lucide-react";







export default function DashboardLayout({
  children,
  activeRoute = "dashboard",
  userRole = "Admin",
  disableContentWrapper = false
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [filesOpen, setFilesOpen] = useState(false);

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
    { id: "payroll", label: "Payroll Processing", icon: Calculator, href: "/payroll" },
    { id: "reports", label: "Reports", icon: FileText, href: "/reports" },
    { id: "settings", label: "Settings", icon: Settings, href: "/settings" }];

  const filteredMenuItems = menuItems.filter((item) => {
    if (userRole === "Employee") return item.id === "dashboard";
    if (userRole === "Auditor") return ["dashboard", "files", "reports"].includes(item.id);
    return true;
  });

  const NavContent = () => (
    <nav className="flex-1 px-4 py-6 overflow-y-auto">
      <ul className="space-y-2">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeRoute === item.id || (item.subItems?.some(s => s.id === activeRoute));

          if (item.subItems) {
            return (
              <li key={item.id} className="space-y-1">
                <button
                  onClick={() => setFilesOpen(!filesOpen)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors ${isActive ?
                    "text-sidebar-foreground bg-sidebar-accent/50" :
                    "text-sidebar-foreground hover:bg-sidebar-accent"}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {(sidebarOpen || mobileSidebarOpen) && <span className="text-sm font-medium">{item.label}</span>}
                  </div>
                  {(sidebarOpen || mobileSidebarOpen) && <ChevronDown className={`w-4 h-4 transition-transform ${filesOpen ? 'rotate-180' : ''}`} />}
                </button>

                {(sidebarOpen || mobileSidebarOpen) && filesOpen && (
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
    <div
      className={`h-screen bg-background overflow-hidden transition-all duration-300 grid ${
        // Grid Template:
        // Mobile: 1 column (sidebar absolute)
        // Desktop: 2 columns (sidebar width defined by state)
        window.innerWidth < 1024
          ? "grid-cols-1"
          : sidebarOpen
            ? "grid-cols-[16rem_1fr]"
            : "grid-cols-[5rem_1fr]"
        }`}
    >
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Grid Area 1 (Row spanning) */}
      <aside
        className={`bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300
          ${mobileSidebarOpen ? "fixed inset-y-0 left-0 z-50 w-64 translate-x-0" : "hidden lg:flex relative"}
          ${!mobileSidebarOpen && "h-full"}
          lg:col-start-1 lg:row-span-2
        `}
      >

        {/* Logo Section */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border flex-shrink-0">
          {(sidebarOpen || mobileSidebarOpen) ? (
            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-sidebar-primary rounded flex items-center justify-center flex-shrink-0">
                <span className="text-sidebar-primary-foreground font-bold">S</span>
              </div>
              <span className="font-bold text-sidebar-foreground truncate">SearchFirst Payroll</span>
            </Link>
          ) : (
            <Link to="/" className="flex items-center justify-center w-full">
              <div className="w-8 h-8 bg-sidebar-primary rounded flex items-center justify-center">
                <span className="text-sidebar-primary-foreground font-bold">S</span>
              </div>
            </Link>
          )}
          <button
            onClick={() => {
              if (window.innerWidth < 1024) setMobileSidebarOpen(false);
              else setSidebarOpen(!sidebarOpen);
            }}
            className="p-1 hover:bg-sidebar-accent rounded transition lg:hidden"
          >
            <X className="w-5 h-5 text-sidebar-foreground" />
          </button>
        </div>

        <NavContent />

        {/* User Info Footer (Sidebar) */}
        {(sidebarOpen || mobileSidebarOpen) && (
          <div className="p-4 border-t border-sidebar-border mt-auto">
            <div className="bg-sidebar-accent rounded-lg p-3">
              <p className="text-[10px] uppercase font-bold text-sidebar-foreground/50 mb-1 leading-none">Role</p>
              <p className="text-sm text-sidebar-foreground font-semibold truncate">{userRole}</p>
            </div>
          </div>
        )}
      </aside>

      {/* Content Area Wrapper - Grid Column 2 */}
      <div className="flex flex-col h-screen overflow-hidden lg:col-start-2">

        {/* Header */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 sm:px-6 flex-shrink-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 hover:bg-secondary rounded-lg transition lg:hidden"
            >
              <Menu className="w-6 h-6 text-foreground" />
            </button>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:block p-2 hover:bg-secondary rounded-lg transition"
            >
              <Menu className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="text-lg sm:text-xl font-semibold text-foreground truncate max-w-[150px] sm:max-w-none">
              {filteredMenuItems.find(m => m.id === activeRoute || m.subItems?.some(s => s.id === activeRoute))?.label || "Dashboard"}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button className="hidden sm:flex p-2 hover:bg-secondary rounded-lg transition relative">
              <Bell className="w-5 h-5 text-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full border-2 border-card"></span>
            </button>

            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-2 sm:px-3 py-1.5 hover:bg-secondary rounded-lg transition group"
              >
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <span className="hidden sm:inline text-sm font-medium text-foreground">Admin</span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-[60]">
                  <div className="px-4 py-3 border-b border-border sm:hidden">
                    <p className="text-xs font-bold text-muted-foreground uppercase">Role: {userRole}</p>
                  </div>
                  <button className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-secondary transition flex items-center gap-2">
                    <User className="w-4 h-4" /> Profile
                  </button>
                  <button className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-secondary transition flex items-center gap-2">
                    <Settings className="w-4 h-4" /> Settings
                  </button>
                  <div className="border-t border-border"></div>
                  <Link
                    to="/login"
                    className="w-full px-4 py-2.5 text-left text-sm text-destructive hover:bg-destructive/10 transition flex items-center gap-2 font-medium"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content - Scrollable or Fixed */}
        <main className={`flex-1 w-full bg-background ${disableContentWrapper ? 'overflow-hidden' : 'overflow-y-auto scrollbar-thin'}`}>
          {disableContentWrapper ? (
            children
          ) : (
            <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
              {children}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}