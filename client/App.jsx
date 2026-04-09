import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { SettingsProvider, useSettings } from "./context/SettingsContext";
import { SyncProvider } from "./context/SyncContext";

// Lazy-load all pages — each becomes its own JS chunk loaded on demand
const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Services = lazy(() => import("./pages/Services"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const Industries = lazy(() => import("./pages/Industries"));
const Blog = lazy(() => import("./pages/Blog"));
const Careers = lazy(() => import("./pages/Careers"));
const Contact = lazy(() => import("./pages/Contact"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Login = lazy(() => import("./pages/Login"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Employees = lazy(() => import("./pages/Employees"));
const Salary = lazy(() => import("./pages/Salary"));
const PayBillDetail = lazy(() => import("./pages/PayBillDetail"));
const PayBillAbstract = lazy(() => import("./pages/PayBillAbstract"));
const Abstract1 = lazy(() => import("./pages/Abstract1"));
const Abstract2 = lazy(() => import("./pages/Abstract2"));
const PayCertificate = lazy(() => import("./pages/PayCertificate"));
const StaffReport = lazy(() => import("./pages/StaffReport"));
const BankStatement = lazy(() => import("./pages/BankStatement"));
const Settings = lazy(() => import("./pages/Settings"));
const Users = lazy(() => import("./pages/Users"));
const AuditLogs = lazy(() => import("./pages/AuditLogs"));
const DailyAttendance = lazy(() => import("./pages/DailyAttendance"));
const MonthlyAttendance = lazy(() => import("./pages/MonthlyAttendance"));
const AttendanceReports = lazy(() => import("./pages/AttendanceReports"));
const SyncDashboard = lazy(() => import("./pages/SyncDashboard"));
const LicenseManagement = lazy(() => import("./pages/LicenseManagement"));
const Placeholder = lazy(() => import("./pages/Placeholder"));
const PrintReportView = lazy(() => import("./pages/PrintReportView"));
const IncomePage = lazy(() => import("./pages/IncomePage"));
const ExpensePage = lazy(() => import("./pages/ExpensePage"));
const FinanceDashboard = lazy(() => import("./pages/FinanceDashboard"));
const SalaryRevisionPage = lazy(() => import("./pages/SalaryRevisionPage"));
const EmployeeDashboard = lazy(() => import("./pages/EmployeeDashboard"));
const EmployeeLeaves = lazy(() => import("./pages/EmployeeLeaves"));
const EmployeePermissions = lazy(() => import("./pages/EmployeePermissions"));
const EmployeeAttendance = lazy(() => import("./pages/EmployeeAttendance"));
const EmployeeWorkHistory = lazy(() => import("./pages/EmployeeWorkHistory"));
const EmployeeSalary = lazy(() => import("./pages/EmployeeSalary"));
const EmployeeProfile = lazy(() => import("./pages/EmployeeProfile"));
const CompanyEmployees = lazy(() => import("./pages/CompanyEmployeeList"));
const CompanyLeaves = lazy(() => import("./pages/CompanyLeaves"));
const CompanyPermissions = lazy(() => import("./pages/CompanyPermissions"));
const AttendanceMonitor = lazy(() => import("./pages/AttendanceMonitor"));
const WorkSubmissions = lazy(() => import("./pages/WorkSubmissionsView"));
const SalaryReport = lazy(() => import("./pages/EmployeeSalaryReport"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Super Admin Panel
const SuperAdminDashboard = lazy(() => import('./pages/superadmin/SuperAdminDashboard'));
const SuperAdminCompanies = lazy(() => import('./pages/superadmin/SuperAdminCompanies'));
const SuperAdminPlans = lazy(() => import('./pages/superadmin/SuperAdminPlans'));

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
 * RoleProtectedRoute - Enforces authentication and specific roles
 */
const RoleProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
  })();

  const userRole = (user.role || '').toLowerCase();
  
  // If no roles specified, just check token (standard protection)
  if (!allowedRoles || allowedRoles.length === 0) return children;

  // Check if user has required role
  if (!allowedRoles.includes(userRole)) {
    console.warn(`[Auth] Unauthorized access to role-protected route. User role: ${userRole}`);
    // Redirect to their own dashboard
    return <Navigate to={userRole === 'employee' ? "/employee/dashboard" : "/dashboard"} replace />;
  }

  return children;
};

/**
 * FeatureRoute - Higher-Order Component for Settings-Driven access
 * Only redirects if the feature is EXPLICITLY disabled (false).
 * If the flag is unset/undefined, access is ALLOWED by default.
 */
const FeatureRoute = ({ children, feature }) => {
  const { settings, isLoading } = useSettings();
  // Show a loading spinner while settings are being fetched to avoid flash redirects
  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
  if (!feature) return children;
  // Only block if the feature is EXPLICITLY set to false or 'false'
  // If unset/undefined, default to ALLOWED
  const val = settings?.[feature];
  const isDisabled = val === false || val === 'false';
  return isDisabled ? <Navigate to="/dashboard" replace /> : children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SettingsProvider>
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
                <Route path="/dashboard" element={<RoleProtectedRoute allowedRoles={['admin', 'super_admin', 'hr_officer', 'accountant', 'auditor']}><Dashboard /></RoleProtectedRoute>} />
                <Route path="/company/dashboard" element={<RoleProtectedRoute allowedRoles={['admin', 'super_admin', 'hr_officer', 'accountant', 'auditor']}><Dashboard /></RoleProtectedRoute>} />
                <Route path="/company/employees" element={<RoleProtectedRoute allowedRoles={['admin', 'super_admin', 'hr_officer', 'accountant', 'auditor']}><CompanyEmployees /></RoleProtectedRoute>} />
                <Route path="/company/salary" element={<RoleProtectedRoute allowedRoles={['admin', 'super_admin', 'hr_officer', 'accountant', 'auditor']}><SalaryReport /></RoleProtectedRoute>} />
                <Route path="/company/leaves" element={<RoleProtectedRoute allowedRoles={['admin', 'super_admin', 'hr_officer', 'accountant', 'auditor']}><CompanyLeaves /></RoleProtectedRoute>} />
                <Route path="/company/permissions" element={<RoleProtectedRoute allowedRoles={['admin', 'super_admin', 'hr_officer', 'accountant', 'auditor']}><CompanyPermissions /></RoleProtectedRoute>} />
                <Route path="/company/attendance" element={<RoleProtectedRoute allowedRoles={['admin', 'super_admin', 'hr_officer', 'accountant', 'auditor']}><AttendanceMonitor /></RoleProtectedRoute>} />
                <Route path="/company/work" element={<RoleProtectedRoute allowedRoles={['admin', 'super_admin', 'hr_officer', 'accountant', 'auditor']}><WorkSubmissions /></RoleProtectedRoute>} /> 

                <Route path="/employee/dashboard" element={<RoleProtectedRoute allowedRoles={['employee']}><EmployeeDashboard /></RoleProtectedRoute>} />
                <Route path="/employee/leaves" element={<RoleProtectedRoute allowedRoles={['employee']}><EmployeeLeaves /></RoleProtectedRoute>} />
                <Route path="/employee/permissions" element={<RoleProtectedRoute allowedRoles={['employee']}><EmployeePermissions /></RoleProtectedRoute>} />
                <Route path="/employee/attendance" element={<RoleProtectedRoute allowedRoles={['employee']}><EmployeeAttendance /></RoleProtectedRoute>} />
                <Route path="/employee/work" element={<RoleProtectedRoute allowedRoles={['employee']}><EmployeeWorkHistory /></RoleProtectedRoute>} />
                <Route path="/employee/salary" element={<RoleProtectedRoute allowedRoles={['employee']}><EmployeeSalary /></RoleProtectedRoute>} />
                <Route path="/employee/profile" element={<RoleProtectedRoute allowedRoles={['employee']}><EmployeeProfile /></RoleProtectedRoute>} />

                <Route path="/users" element={<RoleProtectedRoute allowedRoles={['admin', 'super_admin']}><Users /></RoleProtectedRoute>} />
                <Route path="/employees" element={<RoleProtectedRoute allowedRoles={['admin', 'super_admin', 'hr_officer']}><Employees /></RoleProtectedRoute>} />
                <Route path="/salary" element={<RoleProtectedRoute allowedRoles={['admin', 'super_admin', 'hr_officer', 'accountant']}><Salary /></RoleProtectedRoute>} />

                {/* Attendance Module */}
                <Route path="/attendance/daily" element={<RoleProtectedRoute allowedRoles={['admin', 'super_admin', 'hr_officer', 'accountant']}><FeatureRoute feature="enable_attendance"><DailyAttendance /></FeatureRoute></RoleProtectedRoute>} />
                <Route path="/attendance/monthly" element={<RoleProtectedRoute allowedRoles={['admin', 'super_admin', 'hr_officer', 'accountant']}><FeatureRoute feature="enable_attendance"><MonthlyAttendance /></FeatureRoute></RoleProtectedRoute>} />
                <Route path="/attendance/reports" element={<RoleProtectedRoute allowedRoles={['admin', 'super_admin', 'hr_officer', 'accountant']}><FeatureRoute feature="enable_attendance"><AttendanceReports /></FeatureRoute></RoleProtectedRoute>} />

                {/* Reports */}
                <Route path="/reports/pay-bill" element={<RoleProtectedRoute allowedRoles={['admin', 'super_admin', 'hr_officer', 'accountant']}><FeatureRoute feature="enable_pay_bill"><PayBillDetail /></FeatureRoute></RoleProtectedRoute>} />
                <Route path="/reports/pay-bill-abstract" element={<RoleProtectedRoute allowedRoles={['admin', 'super_admin', 'hr_officer', 'accountant']}><FeatureRoute feature="enable_pay_bill"><PayBillAbstract /></FeatureRoute></RoleProtectedRoute>} />
                <Route path="/reports/abstract-1" element={<RoleProtectedRoute allowedRoles={['admin', 'super_admin', 'hr_officer', 'accountant']}><FeatureRoute feature="enable_abstract_1"><Abstract1 /></FeatureRoute></RoleProtectedRoute>} />
                <Route path="/reports/abstract-2" element={<RoleProtectedRoute allowedRoles={['admin', 'super_admin', 'hr_officer', 'accountant']}><FeatureRoute feature="enable_abstract_2"><Abstract2 /></FeatureRoute></RoleProtectedRoute>} />
                <Route path="/reports/bank-statement" element={<RoleProtectedRoute allowedRoles={['admin', 'super_admin', 'hr_officer', 'accountant']}><FeatureRoute feature="enable_bank_statement"><BankStatement /></FeatureRoute></RoleProtectedRoute>} />
                <Route path="/reports/pay-certificate" element={<RoleProtectedRoute allowedRoles={['admin', 'super_admin', 'hr_officer', 'accountant']}><FeatureRoute feature="enable_pay_certificate"><PayCertificate /></FeatureRoute></RoleProtectedRoute>} />
                <Route path="/reports/staff-report" element={<RoleProtectedRoute allowedRoles={['admin', 'super_admin', 'hr_officer', 'accountant']}><FeatureRoute feature="enable_staff_report"><StaffReport /></FeatureRoute></RoleProtectedRoute>} />

                {/* Print Engine */}
                <Route path="/print-report" element={<RoleProtectedRoute allowedRoles={['admin', 'super_admin', 'hr_officer', 'accountant']}><PrintReportView /></RoleProtectedRoute>} />

                {/* System Routes */}
                <Route path="/settings" element={<RoleProtectedRoute allowedRoles={['admin', 'super_admin']}><Settings /></RoleProtectedRoute>} />
                <Route path="/license" element={<RoleProtectedRoute allowedRoles={['admin', 'super_admin']}><LicenseManagement /></RoleProtectedRoute>} />
                <Route path="/sync" element={<RoleProtectedRoute allowedRoles={['admin', 'super_admin']}><SyncDashboard /></RoleProtectedRoute>} />
                <Route path="/audit-logs" element={<RoleProtectedRoute allowedRoles={['admin', 'super_admin']}><AuditLogs /></RoleProtectedRoute>} />

                {/* Finance Module */}
                <Route path="/income" element={<RoleProtectedRoute allowedRoles={['admin', 'super_admin', 'accountant']}><FeatureRoute feature="enable_income"><IncomePage /></FeatureRoute></RoleProtectedRoute>} />
                <Route path="/expense" element={<RoleProtectedRoute allowedRoles={['admin', 'super_admin', 'accountant']}><FeatureRoute feature="enable_expense"><ExpensePage /></FeatureRoute></RoleProtectedRoute>} />
                <Route path="/finance/dashboard" element={<RoleProtectedRoute allowedRoles={['admin', 'super_admin', 'accountant']}><FinanceDashboard /></RoleProtectedRoute>} />

                {/* Salary Revisions */}
                <Route path="/salary-revisions" element={<RoleProtectedRoute allowedRoles={['admin', 'super_admin', 'hr_officer']}><SalaryRevisionPage /></RoleProtectedRoute>} />

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

                {/* ── Super Admin Panel ─────────────────────────────── */}
                <Route path="/superadmin/login" element={<Navigate to="/login" replace />} />
                <Route path="/superadmin/dashboard" element={<SAGuard><SuperAdminDashboard /></SAGuard>} />
                <Route path="/superadmin/companies" element={<SAGuard><SuperAdminCompanies /></SAGuard>} />
                <Route path="/superadmin/plans" element={<SAGuard><SuperAdminPlans /></SAGuard>} />
                <Route path="/superadmin" element={<Navigate to="/login" replace />} />

                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </Router>
        </TooltipProvider>
      </SyncProvider>
    </SettingsProvider>
  </QueryClientProvider>
);

export default App;