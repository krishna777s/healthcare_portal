import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, FileText, Bell, User, Clock, CheckCircle, BedDouble, Activity, AlertTriangle } from "lucide-react";
import { useDoctorStats, useDoctorAppointments, usePendingReports } from "@/hooks/useDoctorData";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

const statusColor: Record<string, string> = {
  stable: "bg-green-500/20 text-green-400",
  improving: "bg-blue-500/20 text-blue-400",
  under_review: "bg-yellow-500/20 text-yellow-400",
  critical: "bg-red-500/20 text-red-400",
};

const priorityColor: Record<string, string> = {
  high: "bg-red-500/20 text-red-400",
  normal: "bg-blue-500/20 text-blue-400",
  low: "bg-gray-500/20 text-gray-400",
};

export default function DoctorDashboard() {
  const { data: stats, isLoading: statsLoading } = useDoctorStats();
  const { data: appointments = [], isLoading: apptLoading } = useDoctorAppointments();
  const { data: pendingReports = [], isLoading: reportsLoading } = usePendingReports();

  const today = format(new Date(), "yyyy-MM-dd");
  const todayAppts = appointments.filter((a: any) => a.appointment_date === today);
  const upcomingAppts = appointments.filter((a: any) => a.appointment_date > today);

  const statsCards = stats
    ? [
        { title: "Outpatients", value: String(stats.outpatients), icon: Users, trend: { value: "Care", isPositive: true } },
        { title: "Today's Appointments", value: String(stats.todays_appointments), icon: Calendar, trend: { value: "Live", isPositive: true } },
        { title: "Pending Reports", value: String(stats.pending_reports), icon: FileText, trend: { value: "Live", isPositive: stats.pending_reports === 0 } },
        { title: "ICU Patients", value: String(stats.icu_patients), icon: Activity, trend: { value: String(stats.unread_icu_alerts) + " alerts", isPositive: stats.unread_icu_alerts === 0 } },
        { title: "Inpatients", value: String(stats.inpatients), icon: BedDouble, trend: { value: "Admitted", isPositive: true } },
        { title: "ICU Alerts", value: String(stats.unread_icu_alerts), icon: AlertTriangle, trend: { value: "Unread", isPositive: stats.unread_icu_alerts === 0 } },
      ]
    : [];

  return (
    <div className="p-6 space-y-6 animate-fade-in bg-[#131e3a] text-white">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Doctor Dashboard</h1>
        <p className="text-[#D1D5DB]">Live overview of your patients, appointments, and reports</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statsLoading
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl bg-[#1e2d4d]" />)
          : statsCards.map((stat, index) => (
              <div key={stat.title} className="animate-slide-in" style={{ animationDelay: `${index * 80}ms` }}>
                <StatsCard {...stat} />
              </div>
            ))}
      </div>

      {/* Appointments Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <Card className="border-[#2D2755] bg-[#051650]/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="h-5 w-5" /> Today's Appointments
              <span className="ml-auto text-sm font-normal text-[#D1D5DB]">{format(new Date(), "dd MMM yyyy")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {apptLoading ? (
              <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 bg-[#1e2d4d] rounded-lg" />)}</div>
            ) : todayAppts.length === 0 ? (
              <p className="text-[#D1D5DB] text-center py-6">No appointments today</p>
            ) : (
              <div className="space-y-3">
                {todayAppts.map((a: any) => (
                  <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-[#051650]/30 hover:bg-[#051650]/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-[#4F83FF]" />
                      <div>
                        <p className="text-white font-medium">{a.patient_name}</p>
                        <p className="text-[#D1D5DB] text-sm">{a.appointment_time} · {a.appointment_type}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${a.status === "confirmed" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                      {a.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card className="border-[#2D2755] bg-[#051650]/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="h-5 w-5" /> Upcoming Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {apptLoading ? (
              <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 bg-[#1e2d4d] rounded-lg" />)}</div>
            ) : upcomingAppts.length === 0 ? (
              <p className="text-[#D1D5DB] text-center py-6">No upcoming appointments</p>
            ) : (
              <div className="space-y-3">
                {upcomingAppts.slice(0, 5).map((a: any) => (
                  <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-[#051650]/30 hover:bg-[#051650]/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-14 text-center">
                        <span className="text-white font-medium text-sm">{format(new Date(a.appointment_date), "dd MMM")}</span>
                      </div>
                      <div>
                        <p className="text-white">{a.patient_name}</p>
                        <p className="text-[#D1D5DB] text-sm">{a.appointment_type}</p>
                      </div>
                    </div>
                    <Calendar className="h-4 w-4 text-[#D1D5DB]" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pending Reports */}
      <Card className="border-[#2D2755] bg-[#051650]/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="h-5 w-5" /> Pending Lab Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reportsLoading ? (
            <Skeleton className="h-32 bg-[#1e2d4d] rounded-lg" />
          ) : pendingReports.length === 0 ? (
            <p className="text-[#D1D5DB] text-center py-6">No pending reports</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2D2755]">
                    {["Patient", "Report", "Type", "Requested", "Priority"].map((h) => (
                      <th key={h} className="text-left py-3 px-4 text-[#D1D5DB] font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pendingReports.map((r: any) => (
                    <tr key={r.id} className="border-b border-[#2D2755]/50 hover:bg-[#051650]/20 transition-colors">
                      <td className="py-3 px-4 text-white">{r.patient_name}</td>
                      <td className="py-3 px-4 text-[#D1D5DB]">{r.report_name}</td>
                      <td className="py-3 px-4 text-[#D1D5DB] capitalize">{r.report_type?.replace("_", " ")}</td>
                      <td className="py-3 px-4 text-[#D1D5DB]">{r.requested_date || "—"}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${priorityColor[r.priority] || "bg-gray-500/20 text-gray-400"}`}>
                          {r.priority}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
