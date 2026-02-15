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

import { useNavigate, Navigate } from "react-router-dom";
import { useSettings } from "./context/SettingsContext";

const queryClient = new QueryClient();

/**
 * FeatureRoute - Higher-Order Component for Settings-Driven access
 * Redirects to dashboard if the feature token is disabled in settings.
 */
const FeatureRoute = ({ children, feature }) => {
  const { isEnabled, isLoading } = useSettings();
  if (isLoading) return null; // Wait for settings
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
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/users" element={<Users />} />
              <Route path="/employees" element={<Employees />} />
              <Route path="/salary" element={<Salary />} />

              {/* Attendance Module */}
              <Route path="/attendance/daily" element={<FeatureRoute feature="enable_attendance"><DailyAttendance /></FeatureRoute>} />
              <Route path="/attendance/monthly" element={<FeatureRoute feature="enable_attendance"><MonthlyAttendance /></FeatureRoute>} />
              <Route path="/attendance/reports" element={<FeatureRoute feature="enable_attendance"><AttendanceReports /></FeatureRoute>} />

              {/* Reports */}
              <Route path="/reports/pay-bill" element={<FeatureRoute feature="enable_pay_bill"><PayBillDetail /></FeatureRoute>} />
              <Route path="/reports/pay-bill-abstract" element={<FeatureRoute feature="enable_pay_bill"><PayBillAbstract /></FeatureRoute>} />
              <Route path="/reports/abstract-1" element={<FeatureRoute feature="enable_abstract_1"><Abstract1 /></FeatureRoute>} />
              <Route path="/reports/abstract-2" element={<FeatureRoute feature="enable_abstract_2"><Abstract2 /></FeatureRoute>} />
              <Route path="/reports/bank-statement" element={<FeatureRoute feature="enable_bank_statement"><BankStatement /></FeatureRoute>} />
              <Route path="/reports/pay-certificate" element={<FeatureRoute feature="enable_pay_certificate"><PayCertificate /></FeatureRoute>} />
              <Route path="/reports/staff-report" element={<FeatureRoute feature="enable_staff_report"><StaffReport /></FeatureRoute>} />

              {/* Print Engine Dedicated Route */}
              <Route path="/print-report" element={<PrintReportView />} />

              <Route path="/settings" element={<Settings />} />
              <Route path="/license" element={<LicenseManagement />} />
              <Route path="/sync" element={<SyncDashboard />} />
              <Route path="/audit-logs" element={<AuditLogs />} />

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