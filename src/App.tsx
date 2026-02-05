import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { RoleGuard } from "@/components/guards/RoleGuard";
import { Sidebar } from "@/components/layout/Sidebar";
import { DoctorSidebar } from "@/dashboards/doctor/DoctorSidebar";
import { PatientSidebar } from "@/dashboards/patient/PatientSidebar";
import { Header } from "@/components/layout/Header";
import RoleSelection from "./pages/RoleSelection";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import DoctorDashboard from "./dashboards/doctor/DoctorDashboard";
import PatientDashboard from "./dashboards/patient/PatientDashboard";
import Entities from "./pages/Entities";
import Departments from "./pages/Departments";
import Staff from "./pages/Staff";
import Patients from "./pages/Patients";
import Diagnostics from "./pages/Diagnostics";
import Appointments from "./pages/Appointments";
import MyPatients from "./pages/MyPatients";
import Prescriptions from "./pages/Prescriptions";
import MedicalRecords from "./pages/MedicalRecords";
import MyAppointments from "./pages/MyAppointments";
import MyReports from "./pages/MyReports";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/select-role" replace />;
  }

  return <>{children}</>;
};

// Dashboard Layout Component
const DashboardLayout = () => {
  const { user } = useAuth();
  
  // Determine which dashboard to show based on role
  const getDashboardComponent = () => {
    if (user?.role === 'doctor') {
      return <DoctorDashboard />;
    }
    if (user?.role === 'patient') {
      return <PatientDashboard />;
    }
    // Default to hospital dashboard for hospital_admin and others
    return <Dashboard />;
  };
  
  // Determine which sidebar to show based on role
  const getSidebarComponent = () => {
    if (user?.role === 'doctor') {
      return <DoctorSidebar />;
    }
    if (user?.role === 'patient') {
      return <PatientSidebar />;
    }
    // Default to admin sidebar for hospital_admin and others
    return <Sidebar />;
  };
  
  return (
    <div className="min-h-screen w-full flex bg-[#131e3a]">
      {getSidebarComponent()}
      <div className="flex-1 lg:ml-64">
        <Header />
        <main className="min-h-[calc(100vh-4rem)] bg-[#131e3a] text-white">
          <Routes>
            <Route path="/" element={getDashboardComponent()} />
            
            {/* Hospital Admin Only Routes */}
            <Route 
              path="/entities" 
              element={
                <RoleGuard allowedRoles={["hospital_admin"]}>
                  <Entities />
                </RoleGuard>
              } 
            />
            <Route 
              path="/departments" 
              element={
                <RoleGuard allowedRoles={["hospital_admin"]}>
                  <Departments />
                </RoleGuard>
              } 
            />
            <Route 
              path="/staff" 
              element={
                <RoleGuard allowedRoles={["hospital_admin"]}>
                  <Staff />
                </RoleGuard>
              } 
            />
            
            {/* Hospital Admin & Doctor Routes */}
            <Route 
              path="/patients" 
              element={
                <RoleGuard allowedRoles={["hospital_admin", "doctor"]}>
                  <Patients />
                </RoleGuard>
              } 
            />
            <Route 
              path="/diagnostics" 
              element={
                <RoleGuard allowedRoles={["hospital_admin", "doctor"]}>
                  <Diagnostics />
                </RoleGuard>
              } 
            />
            
            {/* Doctor Only Routes */}
            <Route 
              path="/appointments" 
              element={
                <RoleGuard allowedRoles={["doctor"]}>
                  <Appointments />
                </RoleGuard>
              } 
            />
            <Route 
              path="/my-patients" 
              element={
                <RoleGuard allowedRoles={["doctor"]}>
                  <MyPatients />
                </RoleGuard>
              } 
            />
            
            {/* Patient Only Routes */}
            <Route 
              path="/my-appointments" 
              element={
                <RoleGuard allowedRoles={["patient"]}>
                  <MyAppointments />
                </RoleGuard>
              } 
            />
            <Route 
              path="/my-reports" 
              element={
                <RoleGuard allowedRoles={["patient"]}>
                  <MyReports />
                </RoleGuard>
              } 
            />
            
            {/* Shared Routes (Doctor & Patient) */}
            <Route 
              path="/prescriptions" 
              element={
                <RoleGuard allowedRoles={["doctor", "patient"]}>
                  <Prescriptions />
                </RoleGuard>
              } 
            />
            <Route 
              path="/medical-records" 
              element={
                <RoleGuard allowedRoles={["doctor", "patient"]}>
                  <MedicalRecords />
                </RoleGuard>
              } 
            />
            
            {/* All Roles */}
            <Route 
              path="/profile" 
              element={<Profile />} 
            />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public routes - always accessible */}
      <Route path="/" element={<Home />} />
      <Route path="/select-role" element={<RoleSelection />} />
      <Route path="/auth" element={<Home />} />
      
      {/* Protected dashboard routes */}
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      />
      
      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

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
