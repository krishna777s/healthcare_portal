import { useEffect, useState } from "react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, FileText, Bell, Download, X, AlertCircle, Clock } from "lucide-react";
import { usePatientStats, useMyAppointments, useMyReports, useNextAppointment } from "@/hooks/usePatientData";
import { Skeleton } from "@/components/ui/skeleton";
import { getFileUrl } from "@/lib/api";
import { format } from "date-fns";

export default function PatientDashboard() {
  const { data: stats, isLoading: statsLoading } = usePatientStats();
  const { data: appointments = [], isLoading: apptLoading } = useMyAppointments();
  const { data: reports = [], isLoading: reportsLoading } = useMyReports();
  const { data: nextAppt } = useNextAppointment();

  const [showReminder, setShowReminder] = useState(false);

  useEffect(() => {
    if (nextAppt?.show_reminder && !sessionStorage.getItem("appt-reminder-dismissed")) {
      setShowReminder(true);
    }
  }, [nextAppt]);

  const dismissReminder = () => {
    sessionStorage.setItem("appt-reminder-dismissed", "1");
    setShowReminder(false);
  };

  const statsCards = stats
    ? [
        { title: "Upcoming Appointments", value: String(stats.upcoming_appointments), icon: Calendar, trend: { value: "Live", isPositive: true } },
        { title: "Reports Available", value: String(stats.total_reports), icon: FileText, trend: { value: "Live", isPositive: true } },
        { title: "Prescriptions", value: String(stats.total_prescriptions), icon: Bell, trend: { value: "Live", isPositive: true } },
      ]
    : [];

  const upcomingAppts = appointments.filter((a: any) => new Date(a.appointment_date) >= new Date());
  const pastAppts = appointments.filter((a: any) => new Date(a.appointment_date) < new Date());

  return (
    <div className="p-6 space-y-6 animate-fade-in bg-[#131e3a] text-white">

      {/* Appointment Reminder Popup */}
      {showReminder && nextAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#131e3a] border border-[#4F83FF]/50 rounded-2xl w-full max-w-md shadow-2xl shadow-[#4F83FF]/20">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${nextAppt.is_today ? "bg-red-500/20" : "bg-[#4F83FF]/20"}`}>
                    {nextAppt.is_today
                      ? <AlertCircle className="h-6 w-6 text-red-400" />
                      : <Clock className="h-6 w-6 text-[#4F83FF]" />
                    }
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">
                      {nextAppt.is_today ? "Appointment Today!" : "Appointment Tomorrow!"}
                    </h3>
                    <p className="text-[#D1D5DB] text-sm">Don't forget your visit</p>
                  </div>
                </div>
                <button onClick={dismissReminder} className="text-[#D1D5DB] hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="bg-[#051650]/30 rounded-xl p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#D1D5DB] text-sm">Doctor</span>
                  <span className="text-white font-medium">{nextAppt.doctor_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#D1D5DB] text-sm">Specialization</span>
                  <span className="text-white">{nextAppt.doctor_specialization}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#D1D5DB] text-sm">Date</span>
                  <span className="text-white">{nextAppt.appointment_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#D1D5DB] text-sm">Time</span>
                  <span className="text-white">{nextAppt.appointment_time || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#D1D5DB] text-sm">Type</span>
                  <span className="text-white capitalize">{nextAppt.appointment_type}</span>
                </div>
              </div>
              <button
                onClick={dismissReminder}
                className="mt-4 w-full py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">My Health Dashboard</h1>
        <p className="text-[#D1D5DB]">View your appointments, reports, and health information</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsLoading
          ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl bg-[#1e2d4d]" />)
          : statsCards.map((stat, i) => (
              <div key={stat.title} className="animate-slide-in" style={{ animationDelay: `${i * 100}ms` }}>
                <StatsCard {...stat} />
              </div>
            ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <Card className="border-[#2D2755] bg-[#051650]/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="h-5 w-5" /> My Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {apptLoading ? (
              <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 bg-[#1e2d4d] rounded-lg" />)}</div>
            ) : upcomingAppts.length === 0 ? (
              <p className="text-[#D1D5DB] text-center py-6">No upcoming appointments</p>
            ) : (
              <div className="space-y-3">
                {upcomingAppts.map((a: any) => (
                  <div key={a.id} className="p-4 rounded-lg bg-[#051650]/30 hover:bg-[#051650]/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="h-4 w-4 text-[#4F83FF]" />
                          <span className="text-white font-medium">{a.appointment_date}</span>
                          {a.appointment_time && <span className="text-[#D1D5DB]">at {a.appointment_time}</span>}
                        </div>
                        <p className="text-white">{a.doctor_name}</p>
                        <p className="text-[#D1D5DB] text-sm">{a.doctor_specialization} · {a.appointment_type}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${a.status === "confirmed" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                        {a.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reports */}
        <Card className="border-[#2D2755] bg-[#051650]/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="h-5 w-5" /> My Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reportsLoading ? (
              <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 bg-[#1e2d4d] rounded-lg" />)}</div>
            ) : reports.length === 0 ? (
              <p className="text-[#D1D5DB] text-center py-6">No reports available yet</p>
            ) : (
              <div className="space-y-2">
                {reports.map((r: any) => (
                  <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-[#051650]/30 hover:bg-[#051650]/50 transition-colors">
                    <div className="flex-1">
                      <p className="text-white font-medium">{r.report_name}</p>
                      <p className="text-[#D1D5DB] text-sm">{r.result_date} · {r.doctor_name}</p>
                    </div>
                    {r.file_url ? (
                      <a
                        href={getFileUrl(r.file_url) || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 px-3 py-1 rounded-md bg-[#4F83FF]/20 hover:bg-[#4F83FF]/30 text-[#4F83FF] transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        <span className="text-sm">View</span>
                      </a>
                    ) : (
                      <span className="text-[#6B7280] text-sm">No file</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
