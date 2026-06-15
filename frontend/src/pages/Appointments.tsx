import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, CheckCircle, XCircle, User } from "lucide-react";
import { useDoctorAppointments } from "@/hooks/useDoctorData";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function Appointments() {
  const { data: appointments = [], isLoading } = useDoctorAppointments();

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const todayAppts = appointments.filter((a: any) => a.appointment_date === todayStr);
  const upcomingAppts = appointments.filter((a: any) => a.appointment_date > todayStr);
  const completedToday = appointments.filter((a: any) => a.appointment_date === todayStr && a.status === 'completed');
  const cancelledAppts = appointments.filter((a: any) => a.status === 'cancelled');

  const statsData = [
    { title: "Today's Appointments", value: String(todayAppts.length), icon: Calendar, trend: { value: "Live", isPositive: true } },
    { title: "Upcoming This Week", value: String(upcomingAppts.length), icon: Clock, trend: { value: "Live", isPositive: true } },
    { title: "Completed Today", value: String(completedToday.length), icon: CheckCircle, trend: { value: "Live", isPositive: true } },
    { title: "Cancelled", value: String(cancelledAppts.length), icon: XCircle, trend: { value: "Live", isPositive: false } },
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in bg-[#131e3a] text-white">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Appointments</h1>
        <p className="text-[#D1D5DB]">Manage your appointment schedule</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 bg-[#1e2d4d] rounded-xl" />)
          : statsData.map((stat, index) => (
              <div key={stat.title} className="animate-slide-in" style={{ animationDelay: `${index * 100}ms` }}>
                <StatsCard {...stat} />
              </div>
            ))}
      </div>

      {/* Appointments Table */}
      <Card className="border-[#2D2755] bg-[#051650]/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Appointment Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 bg-[#1e2d4d] rounded-lg" />)}
            </div>
          ) : appointments.length === 0 ? (
            <p className="text-[#D1D5DB] text-center py-6">No scheduled appointments</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2D2755]">
                    <th className="text-left py-3 px-4 text-[#D1D5DB] font-medium">Date</th>
                    <th className="text-left py-3 px-4 text-[#D1D5DB] font-medium">Time</th>
                    <th className="text-left py-3 px-4 text-[#D1D5DB] font-medium">Patient</th>
                    <th className="text-left py-3 px-4 text-[#D1D5DB] font-medium">Type</th>
                    <th className="text-left py-3 px-4 text-[#D1D5DB] font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment: any) => (
                    <tr key={appointment.id} className="border-b border-[#2D2755]/50 hover:bg-[#051650]/20 transition-colors">
                      <td className="py-3 px-4 text-white">
                        {appointment.appointment_date}
                      </td>
                      <td className="py-3 px-4 text-white flex items-center gap-2">
                        <Clock className="h-4 w-4 text-[#4F83FF]" />
                        {appointment.appointment_time || "—"}
                      </td>
                      <td className="py-3 px-4 text-white">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-[#D1D5DB]" />
                          {appointment.patient_name}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#D1D5DB] capitalize">{appointment.appointment_type}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          appointment.status === 'confirmed' || appointment.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          appointment.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {appointment.status}
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
