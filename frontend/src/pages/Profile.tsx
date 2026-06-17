import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Phone, Calendar, MapPin, Shield, BedDouble, UserCheck, Activity } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

// ── Patient type display config ───────────────────────────────────────────────
const patientTypeConfig: Record<string, { label: string; color: string; bg: string; icon: any; desc: string }> = {
  outpatient: {
    label: "Outpatient",
    color: "text-blue-400",
    bg: "bg-blue-500/15 border border-blue-500/30",
    icon: UserCheck,
    desc: "Visiting for consultations — not admitted to a ward",
  },
  inpatient: {
    label: "Inpatient",
    color: "text-yellow-400",
    bg: "bg-yellow-500/15 border border-yellow-500/30",
    icon: BedDouble,
    desc: "Currently admitted to a hospital ward under doctor supervision",
  },
  icu: {
    label: "ICU Patient",
    color: "text-red-400",
    bg: "bg-red-500/15 border border-red-500/30",
    icon: Activity,
    desc: "Critical care — admitted to the Intensive Care Unit",
  },
};

export default function Profile() {
  const { user } = useAuth();
  const isPatient = user?.role === "patient";

  // Fetch real patient profile data from backend
  const { data: patientProfile, isLoading } = useQuery({
    queryKey: ["patient-profile"],
    queryFn: async () => (await api.get("/patient/profile")).data,
    enabled: isPatient,
  });

  const isDoctorOrAdmin = user?.role === "doctor" || user?.role === "hospital_admin";

  // For patient: use real data; for others: use auth user info
  const displayName = isPatient
    ? (patientProfile?.full_name || user?.name || "—")
    : (user?.name || "User Name");

  const displayEmail = isPatient
    ? (patientProfile?.email || user?.email || "—")
    : (user?.email || "—");

  const patientType = patientProfile?.patient_type;
  const typeConfig = patientType ? patientTypeConfig[patientType] : null;
  const TypeIcon = typeConfig?.icon;

  return (
    <div className="p-6 space-y-6 animate-fade-in bg-[#131e3a] text-white">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
        <p className="text-[#D1D5DB]">Manage your personal information</p>
      </div>

      {/* Patient Type Banner — only for patients */}
      {isPatient && (
        <div>
          {isLoading ? (
            <Skeleton className="h-20 rounded-xl bg-[#1e2d4d]" />
          ) : typeConfig ? (
            <div className={`flex items-center gap-4 p-4 rounded-xl ${typeConfig.bg}`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-white/5`}>
                {TypeIcon && <TypeIcon className={`h-6 w-6 ${typeConfig.color}`} />}
              </div>
              <div>
                <p className="text-xs text-[#D1D5DB] uppercase tracking-wider font-semibold mb-0.5">Patient Type</p>
                <p className={`text-xl font-bold ${typeConfig.color}`}>{typeConfig.label}</p>
                <p className="text-xs text-[#D1D5DB] mt-0.5">{typeConfig.desc}</p>
              </div>
              {patientProfile?.status && (
                <div className="ml-auto text-right">
                  <p className="text-xs text-[#D1D5DB] uppercase tracking-wider font-semibold mb-0.5">Status</p>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold capitalize bg-white/10 text-white">
                    {patientProfile.status.replace("_", " ")}
                  </span>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="border-[#2D2755] bg-[#051650]/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Picture
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="h-16 w-16 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-white font-semibold">{displayName}</p>
              <p className="text-xs text-[#D1D5DB] mt-0.5 capitalize">
                {user?.role === "hospital_admin" ? "Hospital Administrator" : user?.role || "User"}
              </p>
            </div>
            <button className="px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-colors text-sm font-medium">
              Change Photo
            </button>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="lg:col-span-2 border-[#2D2755] bg-[#051650]/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading && isPatient ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 rounded-lg bg-[#1e2d4d]" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-[#D1D5DB]">Full Name</label>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-[#051650]/30 border border-[#2D2755]">
                    <User className="h-4 w-4 text-[#D1D5DB]" />
                    <span className="text-white">{displayName}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-[#D1D5DB]">Email</label>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-[#051650]/30 border border-[#2D2755]">
                    <Mail className="h-4 w-4 text-[#D1D5DB]" />
                    <span className="text-white">{displayEmail}</span>
                  </div>
                </div>

                {isPatient && patientProfile?.phone && (
                  <div className="space-y-2">
                    <label className="text-sm text-[#D1D5DB]">Phone</label>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-[#051650]/30 border border-[#2D2755]">
                      <Phone className="h-4 w-4 text-[#D1D5DB]" />
                      <span className="text-white">{patientProfile.phone}</span>
                    </div>
                  </div>
                )}

                {isPatient && patientProfile?.date_of_birth && (
                  <div className="space-y-2">
                    <label className="text-sm text-[#D1D5DB]">Date of Birth</label>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-[#051650]/30 border border-[#2D2755]">
                      <Calendar className="h-4 w-4 text-[#D1D5DB]" />
                      <span className="text-white">{patientProfile.date_of_birth}</span>
                    </div>
                  </div>
                )}

                {/* Patient-only fields */}
                {isPatient && (
                  <>
                    {patientProfile?.blood_group && (
                      <div className="space-y-2">
                        <label className="text-sm text-[#D1D5DB]">Blood Group</label>
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-[#051650]/30 border border-[#2D2755]">
                          <Shield className="h-4 w-4 text-red-400" />
                          <span className="text-white font-semibold">{patientProfile.blood_group}</span>
                        </div>
                      </div>
                    )}

                    {patientProfile?.gender && (
                      <div className="space-y-2">
                        <label className="text-sm text-[#D1D5DB]">Gender</label>
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-[#051650]/30 border border-[#2D2755]">
                          <User className="h-4 w-4 text-[#D1D5DB]" />
                          <span className="text-white capitalize">{patientProfile.gender}</span>
                        </div>
                      </div>
                    )}

                    {patientProfile?.current_condition && (
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm text-[#D1D5DB]">Current Condition</label>
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-[#051650]/30 border border-[#2D2755]">
                          <MapPin className="h-4 w-4 text-[#D1D5DB]" />
                          <span className="text-white">{patientProfile.current_condition}</span>
                        </div>
                      </div>
                    )}

                    {patientProfile?.assigned_doctor_name && (
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm text-[#D1D5DB]">Assigned Doctor</label>
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-[#051650]/30 border border-[#2D2755]">
                          <User className="h-4 w-4 text-[#4F83FF]" />
                          <span className="text-white">Dr. {patientProfile.assigned_doctor_name}</span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors font-medium">
                Edit Profile
              </button>
              <button className="px-4 py-2 bg-[#051650]/30 hover:bg-[#051650]/50 text-white rounded-lg transition-colors border border-[#2D2755] font-medium">
                Change Password
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patient Type bifurcation explanation — only for patients */}
      {isPatient && !isLoading && (
        <Card className="border-[#2D2755] bg-[#051650]/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white text-base">Patient Category Explained</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(patientTypeConfig).map(([key, cfg]) => {
                const Icon = cfg.icon;
                const isCurrentType = key === patientType;
                return (
                  <div
                    key={key}
                    className={`p-4 rounded-xl border transition-all ${
                      isCurrentType
                        ? cfg.bg + " ring-1 ring-" + cfg.color.replace("text-", "")
                        : "border-[#2D2755] bg-[#051650]/5 opacity-50"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className={`h-5 w-5 ${cfg.color}`} />
                      <span className={`font-semibold text-sm ${isCurrentType ? cfg.color : "text-[#D1D5DB]"}`}>
                        {cfg.label}
                        {isCurrentType && <span className="ml-2 text-[10px] bg-white/10 px-1.5 py-0.5 rounded-full">YOUR TYPE</span>}
                      </span>
                    </div>
                    <p className="text-xs text-[#D1D5DB]">{cfg.desc}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
