import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { RoleGuard } from "@/components/guards/RoleGuard";

// ─── Sidebars ─────────────────────────────────────────────────────────────────
import { Sidebar }          from "@/components/layout/Sidebar";
import { DoctorSidebar }    from "@/dashboards/doctor/DoctorSidebar";
import { PatientSidebar }   from "@/dashboards/patient/PatientSidebar";
import { PharmacySidebar }  from "@/dashboards/pharmacy/PharmacySidebar";
import { Header }           from "@/components/layout/Header";

// ─── Dashboards ───────────────────────────────────────────────────────────────
import RoleSelection    from "./pages/RoleSelection";
import Home             from "./pages/Home";
import Dashboard        from "./pages/Dashboard";
import DoctorDashboard  from "./dashboards/doctor/DoctorDashboard";
import PatientDashboard from "./dashboards/patient/PatientDashboard";
import PharmacyDashboard from "./dashboards/pharmacy/PharmacyDashboard";
import { AllOrdersPage, PendingPage, ReadyPage, DispensedPage } from "./dashboards/pharmacy/PharmacyOrdersPage";

// ─── Admin Pages ──────────────────────────────────────────────────────────────
import Entities     from "./pages/Entities";
import Departments  from "./pages/Departments";
import Staff        from "./pages/Staff";
import Patients     from "./pages/Patients";
import Diagnostics  from "./pages/Diagnostics";
import Pharmacy     from "./pages/Pharmacy";

// ─── Doctor Pages ─────────────────────────────────────────────────────────────
import Appointments   from "./pages/Appointments";
import MyPatients     from "./pages/MyPatients";
import Inpatients     from "./pages/Inpatients";
import ICU            from "./pages/ICU";
import Prescriptions  from "./pages/Prescriptions";
import MedicalRecords from "./pages/MedicalRecords";

// ─── Patient Pages ────────────────────────────────────────────────────────────
import MyAppointments from "./pages/MyAppointments";
import MyReports      from "./pages/MyReports";

// ─── Shared ───────────────────────────────────────────────────────────────────
import Profile  from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,       // data stays fresh for 5 minutes
      gcTime: 30 * 60 * 1000,          // keep in cache for 30 minutes
      refetchOnWindowFocus: false,      // don't refetch just because window was focused
      refetchOnMount: false,            // show cached data instantly on mount
      retry: 1,
    },
  },
});

// ─── Protected Route ──────────────────────────────────────────────────────────
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/select-role" replace />;
  return <>{children}</>;
};

// ─── Dashboard Layout ─────────────────────────────────────────────────────────
const DashboardLayout = () => {
  const { user } = useAuth();

  const getSidebarComponent = () => {
    if (user?.role === "doctor")    return <DoctorSidebar />;
    if (user?.role === "patient")   return <PatientSidebar />;
    if (user?.role === "pharmacy")  return <PharmacySidebar />;
    return <Sidebar />;   // hospital_admin default
  };

  const getDefaultDashboard = () => {
    if (user?.role === "doctor")    return <DoctorDashboard />;
    if (user?.role === "patient")   return <PatientDashboard />;
    if (user?.role === "pharmacy")  return <PharmacyDashboard />;
    return <Dashboard />;
  };

  return (
    <div className="min-h-screen w-full flex bg-[#131e3a]">
      {getSidebarComponent()}
      <div className="flex-1 lg:ml-64">
        <Header />
        <main className="min-h-[calc(100vh-4rem)] bg-[#131e3a] text-white">
          <Routes>
            {/* Default dashboard per role */}
            <Route path="/" element={getDefaultDashboard()} />

            {/* ── Hospital Admin Only ───────────────────────────────── */}
            <Route path="/entities" element={<RoleGuard allowedRoles={["hospital_admin"]}><Entities /></RoleGuard>} />
            <Route path="/departments" element={<RoleGuard allowedRoles={["hospital_admin"]}><Departments /></RoleGuard>} />
            <Route path="/staff" element={<RoleGuard allowedRoles={["hospital_admin"]}><Staff /></RoleGuard>} />
            <Route path="/pharmacy" element={<RoleGuard allowedRoles={["hospital_admin"]}><Pharmacy /></RoleGuard>} />

            {/* ── Admin + Doctor ────────────────────────────────────── */}
            <Route path="/patients"    element={<RoleGuard allowedRoles={["hospital_admin","doctor"]}><Patients /></RoleGuard>} />
            <Route path="/diagnostics" element={<RoleGuard allowedRoles={["hospital_admin","doctor"]}><Diagnostics /></RoleGuard>} />

            {/* ── Doctor Only ───────────────────────────────────────── */}
            <Route path="/appointments" element={<RoleGuard allowedRoles={["doctor"]}><Appointments /></RoleGuard>} />
            <Route path="/my-patients"  element={<RoleGuard allowedRoles={["doctor"]}><MyPatients /></RoleGuard>} />
            <Route path="/inpatients"   element={<RoleGuard allowedRoles={["doctor"]}><Inpatients /></RoleGuard>} />
            <Route path="/icu"          element={<RoleGuard allowedRoles={["doctor"]}><ICU /></RoleGuard>} />

            {/* ── Pharmacy Staff Only ───────────────────────────────── */}
            <Route path="/pharm-orders"    element={<RoleGuard allowedRoles={["pharmacy","hospital_admin"]}><AllOrdersPage /></RoleGuard>} />
            <Route path="/pharm-pending"   element={<RoleGuard allowedRoles={["pharmacy","hospital_admin"]}><PendingPage /></RoleGuard>} />
            <Route path="/pharm-ready"     element={<RoleGuard allowedRoles={["pharmacy","hospital_admin"]}><ReadyPage /></RoleGuard>} />
            <Route path="/pharm-dispensed" element={<RoleGuard allowedRoles={["pharmacy","hospital_admin"]}><DispensedPage /></RoleGuard>} />

            {/* ── Patient Only ──────────────────────────────────────── */}
            <Route path="/my-appointments" element={<RoleGuard allowedRoles={["patient"]}><MyAppointments /></RoleGuard>} />
            <Route path="/my-reports"      element={<RoleGuard allowedRoles={["patient"]}><MyReports /></RoleGuard>} />

            {/* ── Doctor + Patient ──────────────────────────────────── */}
            <Route path="/prescriptions"  element={<RoleGuard allowedRoles={["doctor","patient"]}><Prescriptions /></RoleGuard>} />
            <Route path="/medical-records" element={<RoleGuard allowedRoles={["doctor","patient"]}><MedicalRecords /></RoleGuard>} />

            {/* ── All Roles ─────────────────────────────────────────── */}
            <Route path="/profile" element={<Profile />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

// ─── App Routes ───────────────────────────────────────────────────────────────
const AppRoutes = () => (
  <Routes>
    <Route path="/"            element={<Home />} />
    <Route path="/select-role" element={<RoleSelection />} />
    <Route path="/auth"        element={<Home />} />
    <Route
      path="/dashboard/*"
      element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}
    />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
