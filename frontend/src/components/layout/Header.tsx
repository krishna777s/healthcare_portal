import { useState, useEffect } from "react";
import { Bell, User, LogOut, Sparkles, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ChangePasswordModal } from "@/components/auth/ChangePasswordModal";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showChangePassword, setShowChangePassword] = useState(false);

  const isPatient = user?.role === "patient";

  // Fetch patient appointments
  const { data: appointments = [] } = useQuery({
    queryKey: ["header-patient-appointments"],
    queryFn: async () => (await api.get("/patient/appointments")).data,
    enabled: isPatient,
    refetchInterval: 15_000, // Poll every 15s to keep notifications fresh
  });

  // Fetch patient prescriptions (which contains pharmacy_status)
  const { data: prescriptions = [] } = useQuery({
    queryKey: ["header-patient-prescriptions"],
    queryFn: async () => (await api.get("/patient/prescriptions")).data,
    enabled: isPatient,
    refetchInterval: 15_000, // Poll every 15s
  });

  // Effect to show toast popup when a prescription becomes ready
  useEffect(() => {
    if (!isPatient || !prescriptions.length) return;

    prescriptions.forEach((p: any) => {
      if (p.pharmacy_status === "ready") {
        const key = `toast-seen-ready-${p.id}`;
        if (!localStorage.getItem(key)) {
          toast({
            title: "Prescription Ready!",
            description: `Your prescription for ${p.diagnosis || "general treatment"} by Dr. ${p.doctor_name || "your doctor"} is ready for pickup at the pharmacy.`,
            variant: "default",
          });
          localStorage.setItem(key, "true");
        }
      }
    });
  }, [prescriptions, isPatient, toast]);

  // Format role for display
  const formatRole = (role?: string) => {
    if (!role) return "User";
    
    const roleMap: Record<string, string> = {
      'hospital_admin': 'Hospital Admin',
      'doctor': 'Doctor',
      'patient': 'Patient',
      'pharmacy': 'Pharmacy',
    };
    
    return roleMap[role] || role.charAt(0).toUpperCase() + role.slice(1);
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/select-role";
  };

  // Compile Dynamic Notifications
  let notifications: { id: string; title: string; description: string; time: string; urgent?: boolean }[] = [];

  if (isPatient) {
    // 1. Ready prescriptions
    prescriptions.forEach((p: any) => {
      if (p.pharmacy_status === "ready") {
        notifications.push({
          id: `presc-${p.id}`,
          title: "Prescription Ready",
          description: `Dr. ${p.doctor_name || "Doctor"} - Diagnosis: ${p.diagnosis || "General"} is ready for pickup.`,
          time: "Ready",
          urgent: true,
        });
      }
    });

    // 2. Scheduled appointments (today or upcoming)
    const todayStr = new Date().toISOString().split("T")[0];
    appointments.forEach((appt: any) => {
      if (appt.appointment_date >= todayStr && appt.status !== "cancelled" && appt.status !== "completed") {
        const isToday = appt.appointment_date === todayStr;
        notifications.push({
          id: `appt-${appt.id}`,
          title: isToday ? "Follow-up Appointment Today!" : "Upcoming Appointment",
          description: `With Dr. ${appt.doctor_name || "Doctor"} at ${appt.appointment_time}`,
          time: isToday ? "Today" : appt.appointment_date,
          urgent: isToday,
        });
      }
    });
  }

  // Fallback defaults for empty lists or other roles
  if (notifications.length === 0) {
    if (user?.role === "doctor") {
      notifications = [
        { id: "doc-1", title: "New patient registered", description: "John Doe - 5 minutes ago", time: "5m ago" },
        { id: "doc-2", title: "Lab report ready", description: "Radiology report ready for review", time: "1h ago" },
      ];
    } else if (user?.role === "hospital_admin") {
      notifications = [
        { id: "admin-1", title: "New doctor registered", description: "Dr. Priya Sharma has been added.", time: "5m ago" },
        { id: "admin-2", title: "System backup completed", description: "Database backup succeeded.", time: "1h ago" },
      ];
    } else {
      notifications = [
        { id: "dummy-1", title: "Welcome to Healthcare Portal", description: "Explore your digital medical records and prescriptions.", time: "Just now" },
      ];
    }
  }

  // ── Dismissible notification state ──────────────────────────────────────────
  const [dismissed, setDismissed] = useState<Set<string>>(() => {
    try {
      const saved = sessionStorage.getItem("dismissed-notifications");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });

  const dismissNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(dismissed).add(id);
    setDismissed(next);
    sessionStorage.setItem("dismissed-notifications", JSON.stringify([...next]));
  };

  return (
    <header className="h-16 border-b border-[#2D2755] bg-[#131e3a]/90 backdrop-blur-xl sticky top-0 z-30">
      <div className="h-full px-6 flex items-center justify-end gap-4">
        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative hover:bg-[#2D2755]/50">
                <Bell className="h-5 w-5 text-white" />
                {notifications.filter(n => !dismissed.has(n.id)).length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-primary text-xs">
                    {notifications.filter(n => !dismissed.has(n.id)).length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-[#051650]/95 backdrop-blur-md border-[#2D2755] text-white">
              <DropdownMenuLabel className="text-white flex items-center justify-between">
                <span>Notifications</span>
                {isPatient && <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#2D2755]" />
              <div className="max-h-[300px] overflow-y-auto space-y-0.5">
                {notifications.filter(n => !dismissed.has(n.id)).length === 0 ? (
                  <div className="py-6 text-center text-[#D1D5DB] text-sm">No new notifications</div>
                ) : (
                  notifications
                    .filter(n => !dismissed.has(n.id))
                    .map((n) => (
                      <DropdownMenuItem
                        key={n.id}
                        className="flex items-start py-3 hover:bg-[#051650] cursor-pointer text-white border-b border-[#2D2755]/30 last:border-none gap-2"
                        onSelect={(e) => e.preventDefault()}
                      >
                        <div className="flex-1 flex flex-col min-w-0">
                          <span className={`font-semibold text-sm ${n.urgent ? "text-amber-400" : "text-white"}`}>{n.title}</span>
                          <span className="text-xs text-[#D1D5DB] mt-0.5">{n.description}</span>
                          <span className="text-[10px] text-gray-400 mt-1">{n.time}</span>
                        </div>
                        <button
                          onClick={(e) => dismissNotification(n.id, e)}
                          className="flex-shrink-0 mt-0.5 text-[#D1D5DB] hover:text-white transition-colors p-0.5 rounded"
                          title="Dismiss"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </DropdownMenuItem>
                    ))
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 hover:bg-[#2D2755]/50">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium text-white">{user?.name || user?.email || "User"}</div>
                  <div className="text-xs text-[#D1D5DB]">{formatRole(user?.role)}</div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-[#051650]/90 backdrop-blur-sm border-[#2D2755] text-white">
              <DropdownMenuLabel className="text-white">
                <div className="flex flex-col">
                  <span className="font-semibold text-white">{user?.name || "User"}</span>
                  <span className="text-xs text-gray-400 font-normal mt-0.5">{formatRole(user?.role)}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#2D2755]" />
              <DropdownMenuItem className="hover:bg-[#051650] cursor-pointer text-white">Profile</DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-[#051650] cursor-pointer text-white">Settings</DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-[#051650] cursor-pointer text-white" onClick={() => setShowChangePassword(true)}>Change Password</DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-[#051650] cursor-pointer text-white">Help & Support</DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#2D2755]" />
              <DropdownMenuItem
                className="text-red-400 hover:bg-[#051650] cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <ChangePasswordModal open={showChangePassword} onOpenChange={setShowChangePassword} />
    </header>
  );
};
