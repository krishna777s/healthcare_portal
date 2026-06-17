import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, User, CheckCircle } from "lucide-react";
import { useMyAppointments } from "@/hooks/usePatientData";
import { format, isAfter, isBefore, parseISO, startOfDay } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function MyAppointments() {
  const { data: appointments = [], isLoading } = useMyAppointments();

  const today = startOfDay(new Date());

  const upcomingAppointments = appointments.filter((a: any) => {
    const apptDate = parseISO(a.appointment_date);
    return (a.status === 'scheduled' || a.status === 'confirmed') && (isAfter(apptDate, today) || apptDate.getTime() === today.getTime());
  });

  const pastAppointments = appointments.filter((a: any) => {
    const apptDate = parseISO(a.appointment_date);
    return a.status === 'completed' || (isBefore(apptDate, today) && a.status !== 'scheduled' && a.status !== 'confirmed');
  });

  const statsData = [
    { title: "Upcoming", value: String(upcomingAppointments.length), icon: Calendar, trend: { value: "Live", isPositive: true } },
    { title: "Completed", value: String(appointments.filter((a: any) => a.status === 'completed').length), icon: CheckCircle, trend: { value: "Total", isPositive: true } },
    { title: "Total Booked", value: String(appointments.length), icon: Clock, trend: { value: "Lifetime", isPositive: true } },
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in bg-[#131e3a] text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Appointments</h1>
          <p className="text-[#D1D5DB]">View and manage your appointments</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 bg-[#1e2d4d] rounded-xl" />)
          : statsData.map((stat, index) => (
              <div key={stat.title} className="animate-slide-in" style={{ animationDelay: `${index * 100}ms` }}>
                <StatsCard {...stat} />
              </div>
            ))}
      </div>

      {/* Upcoming Appointments */}
      <Card className="border-[#2D2755] bg-[#051650]/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Appointments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-24 bg-[#1e2d4d] rounded-lg" />)}
            </div>
          ) : upcomingAppointments.length === 0 ? (
            <p className="text-[#D1D5DB] text-center py-6">No upcoming appointments</p>
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.map((appointment: any) => (
                <div key={appointment.id} className="p-4 rounded-lg bg-[#051650]/30 hover:bg-[#051650]/50 transition-colors border border-[#2D2755]">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-[#4F83FF]" />
                        <span className="text-white font-medium">{appointment.appointment_date}</span>
                        <span className="text-[#D1D5DB]">at</span>
                        <Clock className="h-4 w-4 text-[#4F83FF]" />
                        <span className="text-white">{appointment.appointment_time || "—"}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4 text-[#D1D5DB]" />
                        <span className="text-white">{appointment.doctor_name || "Doctor"}</span>
                        {appointment.doctor_specialization && (
                          <>
                            <span className="text-[#D1D5DB]">•</span>
                            <span className="text-[#D1D5DB]">{appointment.doctor_specialization}</span>
                          </>
                        )}
                      </div>
                      <p className="text-sm text-[#D1D5DB] capitalize">Type: {appointment.appointment_type}</p>
                      {appointment.notes && (
                        <p className="text-xs text-[#9CA3AF] mt-2 italic">Notes: {appointment.notes}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        appointment.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past Appointments */}
      <Card className="border-[#2D2755] bg-[#051650]/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Past Appointments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-16 bg-[#1e2d4d] rounded-lg" />)}
            </div>
          ) : pastAppointments.length === 0 ? (
            <p className="text-[#D1D5DB] text-center py-6">No past appointments</p>
          ) : (
            <div className="space-y-2">
              {pastAppointments.map((appointment: any) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 rounded-lg bg-[#051650]/30 hover:bg-[#051650]/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-[#D1D5DB]" />
                      <span className="text-white">{appointment.date || appointment.appointment_date}</span>
                    </div>
                    <span className="text-[#D1D5DB]">•</span>
                    <span className="text-white">{appointment.doctor_name || "Doctor"}</span>
                    <span className="text-[#D1D5DB]">•</span>
                    <span className="text-[#D1D5DB] capitalize">{appointment.appointment_type}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    appointment.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {appointment.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
