import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { SettingsProvider } from "./context/SettingsContext";
import { SyncProvider } from "./context/SyncContext";
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


import { useNavigate, Navigate } from "react-router-dom";
import { useSettings } from "./context/SettingsContext";


const queryClient = new QueryClient();

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

              {/* Website Pages */}
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/contact" element={<Contact />} />

              {/* Catch-all Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </TooltipProvider>
      </SyncProvider>
    </SettingsProvider>
  </QueryClientProvider>;

export default App;