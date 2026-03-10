import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { SettingsProvider, useSettings } from "./context/SettingsContext";
import { SyncProvider } from "./context/SyncContext";
<<<<<<< HEAD
=======
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Portfolio from "./pages/Portfolio";
import Industries from "./pages/Industries";
import Blog from "./pages/Blog";
import Careers from "./pages/Careers";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Salary from "./pages/Salary";
import PayBillDetail from "./pages/PayBillDetail";
import PayBillAbstract from "./pages/PayBillAbstract";
import Abstract1 from "./pages/Abstract1";
import Abstract2 from "./pages/Abstract2";
import PayCertificate from "./pages/PayCertificate";
import StaffReport from "./pages/StaffReport";
import BankStatement from "./pages/BankStatement";
import Settings from "./pages/Settings";
import Users from "./pages/Users";
import AuditLogs from "./pages/AuditLogs";
import DailyAttendance from "./pages/DailyAttendance";
import MonthlyAttendance from "./pages/MonthlyAttendance";
import AttendanceReports from "./pages/AttendanceReports";
import SyncDashboard from "./pages/SyncDashboard";
import LicenseManagement from "./pages/LicenseManagement";
import Placeholder from "./pages/Placeholder";
import PrintReportView from "./pages/PrintReportView";
import NotFound from "./pages/NotFound";
// ── New Phase 2 Pages ──
import IncomePage from "./pages/IncomePage";
import ExpensePage from "./pages/ExpensePage";
import FinanceDashboard from "./pages/FinanceDashboard";
import SalaryRevisionPage from "./pages/SalaryRevisionPage";
import ESSDashboard from "./pages/ESSDashboard";

>>>>>>> 60eb1353e3ebfe73e68f225b57a8ceadc0bc0fee

// Lazy-load all pages — each becomes its own JS chunk loaded on demand
const Home              = lazy(() => import("./pages/Home"));
const About             = lazy(() => import("./pages/About"));
const Services          = lazy(() => import("./pages/Services"));
const Portfolio         = lazy(() => import("./pages/Portfolio"));
const Industries        = lazy(() => import("./pages/Industries"));
const Blog              = lazy(() => import("./pages/Blog"));
const Careers           = lazy(() => import("./pages/Careers"));
const Contact           = lazy(() => import("./pages/Contact"));
const FAQ               = lazy(() => import("./pages/FAQ"));
const Login             = lazy(() => import("./pages/Login"));
const ForgotPassword    = lazy(() => import("./pages/ForgotPassword"));
const Dashboard         = lazy(() => import("./pages/Dashboard"));
const Employees         = lazy(() => import("./pages/Employees"));
const Salary            = lazy(() => import("./pages/Salary"));
const PayBillDetail     = lazy(() => import("./pages/PayBillDetail"));
const PayBillAbstract   = lazy(() => import("./pages/PayBillAbstract"));
const Abstract1         = lazy(() => import("./pages/Abstract1"));
const Abstract2         = lazy(() => import("./pages/Abstract2"));
const PayCertificate    = lazy(() => import("./pages/PayCertificate"));
const StaffReport       = lazy(() => import("./pages/StaffReport"));
const BankStatement     = lazy(() => import("./pages/BankStatement"));
const Settings          = lazy(() => import("./pages/Settings"));
const Users             = lazy(() => import("./pages/Users"));
const AuditLogs         = lazy(() => import("./pages/AuditLogs"));
const DailyAttendance   = lazy(() => import("./pages/DailyAttendance"));
const MonthlyAttendance = lazy(() => import("./pages/MonthlyAttendance"));
const AttendanceReports = lazy(() => import("./pages/AttendanceReports"));
const SyncDashboard     = lazy(() => import("./pages/SyncDashboard"));
const LicenseManagement = lazy(() => import("./pages/LicenseManagement"));
const Placeholder       = lazy(() => import("./pages/Placeholder"));
const PrintReportView   = lazy(() => import("./pages/PrintReportView"));
const Income            = lazy(() => import("./pages/Income"));
const Expense           = lazy(() => import("./pages/Expense"));
const NotFound          = lazy(() => import("./pages/NotFound"));
// Super Admin Panel
const SuperAdminDashboard = lazy(() => import('./pages/superadmin/SuperAdminDashboard'));
const SuperAdminCompanies = lazy(() => import('./pages/superadmin/SuperAdminCompanies'));
const SuperAdminPlans     = lazy(() => import('./pages/superadmin/SuperAdminPlans'));
/**
 * Guard for Super Admin routes — redirects to /login if no sa_token
 */
const SAGuard = ({ children }) => {
  const token = localStorage.getItem('sa_token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};


const queryClient = new QueryClient();

/** Simple full-screen spinner shown while a lazy page chunk loads */
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

/**
 * ProtectedRoute - Enforces authentication
 */
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

/**
 * FeatureRoute - Higher-Order Component for Settings-Driven access
 */
const FeatureRoute = ({ children, feature }) => {
  const { isEnabled, isLoading } = useSettings();
  if (isLoading) return null;
  if (!feature) return children;
  return isEnabled(feature) ? children : <Navigate to="/dashboard" replace />;
};

const App = () =>
  <QueryClientProvider client={queryClient}>
    <SettingsProvider> {/* Wrap whole app with Settings */}
      <SyncProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Router>
            <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Dashboard & Authenticated Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/employee/dashboard" element={<ProtectedRoute><ESSDashboard /></ProtectedRoute>} />

              <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
              <Route path="/employees" element={<ProtectedRoute><Employees /></ProtectedRoute>} />
              <Route path="/salary" element={<ProtectedRoute><Salary /></ProtectedRoute>} />


              {/* Attendance Module */}
              <Route path="/attendance/daily" element={<ProtectedRoute><FeatureRoute feature="enable_attendance"><DailyAttendance /></FeatureRoute></ProtectedRoute>} />
              <Route path="/attendance/monthly" element={<ProtectedRoute><FeatureRoute feature="enable_attendance"><MonthlyAttendance /></FeatureRoute></ProtectedRoute>} />
              <Route path="/attendance/reports" element={<ProtectedRoute><FeatureRoute feature="enable_attendance"><AttendanceReports /></FeatureRoute></ProtectedRoute>} />

              {/* Reports */}
              <Route path="/reports/pay-bill" element={<ProtectedRoute><FeatureRoute feature="enable_pay_bill"><PayBillDetail /></FeatureRoute></ProtectedRoute>} />
              <Route path="/reports/pay-bill-abstract" element={<ProtectedRoute><FeatureRoute feature="enable_pay_bill"><PayBillAbstract /></FeatureRoute></ProtectedRoute>} />
              <Route path="/reports/abstract-1" element={<ProtectedRoute><FeatureRoute feature="enable_abstract_1"><Abstract1 /></FeatureRoute></ProtectedRoute>} />
              <Route path="/reports/abstract-2" element={<ProtectedRoute><FeatureRoute feature="enable_abstract_2"><Abstract2 /></FeatureRoute></ProtectedRoute>} />
              <Route path="/reports/bank-statement" element={<ProtectedRoute><FeatureRoute feature="enable_bank_statement"><BankStatement /></FeatureRoute></ProtectedRoute>} />
              <Route path="/reports/pay-certificate" element={<ProtectedRoute><FeatureRoute feature="enable_pay_certificate"><PayCertificate /></FeatureRoute></ProtectedRoute>} />
              <Route path="/reports/staff-report" element={<ProtectedRoute><FeatureRoute feature="enable_staff_report"><StaffReport /></FeatureRoute></ProtectedRoute>} />

              {/* Print Engine Dedicated Route */}
              <Route path="/print-report" element={<ProtectedRoute><PrintReportView /></ProtectedRoute>} />

<<<<<<< HEAD
              {/* Finance Module */}
              <Route path="/income"  element={<FeatureRoute feature="enable_income"><Income /></FeatureRoute>} />
              <Route path="/expense" element={<FeatureRoute feature="enable_expense"><Expense /></FeatureRoute>} />

              <Route path="/settings" element={<Settings />} />
              <Route path="/license" element={<LicenseManagement />} />
              <Route path="/sync" element={<SyncDashboard />} />
              <Route path="/audit-logs" element={<AuditLogs />} />
=======
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/license" element={<ProtectedRoute><LicenseManagement /></ProtectedRoute>} />
              <Route path="/sync" element={<ProtectedRoute><SyncDashboard /></ProtectedRoute>} />
              <Route path="/audit-logs" element={<ProtectedRoute><AuditLogs /></ProtectedRoute>} />

              {/* ── Finance Module (Phase 2) ── */}
              <Route path="/income" element={<ProtectedRoute><IncomePage /></ProtectedRoute>} />
              <Route path="/expense" element={<ProtectedRoute><ExpensePage /></ProtectedRoute>} />
              <Route path="/finance/dashboard" element={<ProtectedRoute><FinanceDashboard /></ProtectedRoute>} />

              {/* ── Salary Revisions ── */}
              <Route path="/salary-revisions" element={<ProtectedRoute><SalaryRevisionPage /></ProtectedRoute>} />
>>>>>>> 60eb1353e3ebfe73e68f225b57a8ceadc0bc0fee

              {/* Website Pages */}
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/industries" element={<Industries />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/placeholder" element={<Placeholder />} />

              {/* Catch-all Route */}
              <Route path="*" element={<NotFound />} />

              {/* ── Super Admin Panel ─────────────────────────────── */}
              <Route path="/superadmin/login" element={<Navigate to="/login" replace />} />
              <Route path="/superadmin/dashboard" element={<SAGuard><SuperAdminDashboard /></SAGuard>} />
              <Route path="/superadmin/companies" element={<SAGuard><SuperAdminCompanies /></SAGuard>} />
              <Route path="/superadmin/plans" element={<SAGuard><SuperAdminPlans /></SAGuard>} />
              <Route path="/superadmin" element={<Navigate to="/login" replace />} />
            </Routes>
            </Suspense>
          </Router>
        </TooltipProvider>
      </SyncProvider>
    </SettingsProvider>
  </QueryClientProvider>;

export default App;