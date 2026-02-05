import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, User, CheckCircle } from "lucide-react";

const statsData = [
  { title: "Upcoming", value: "3", icon: Calendar, trend: { value: "1", isPositive: true } },
  { title: "Completed", value: "12", icon: CheckCircle, trend: { value: "2", isPositive: true } },
  { title: "This Month", value: "5", icon: Clock, trend: { value: "1", isPositive: true } },
];

const appointments = [
  { id: 1, date: "Feb 3, 2026", time: "10:00 AM", doctor: "Dr. Sarah Johnson", specialization: "Cardiologist", type: "Follow-up", status: "Confirmed" },
  { id: 2, date: "Feb 5, 2026", time: "02:30 PM", doctor: "Dr. Michael Chen", specialization: "General Physician", type: "Consultation", status: "Pending" },
  { id: 3, date: "Feb 10, 2026", time: "11:00 AM", doctor: "Dr. Sarah Johnson", specialization: "Cardiologist", type: "Check-up", status: "Confirmed" },
];

const pastAppointments = [
  { id: 1, date: "Jan 28, 2026", time: "09:30 AM", doctor: "Dr. Sarah Johnson", type: "Consultation", status: "Completed" },
  { id: 2, date: "Jan 15, 2026", time: "02:00 PM", doctor: "Dr. Michael Chen", type: "Follow-up", status: "Completed" },
];

export default function MyAppointments() {
  return (
    <div className="p-6 space-y-6 animate-fade-in bg-[#131e3a] text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Appointments</h1>
          <p className="text-[#D1D5DB]">View and manage your appointments</p>
        </div>
        <button className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors shadow-lg">
          Book New Appointment
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsData.map((stat, index) => (
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
          <div className="space-y-3">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="p-4 rounded-lg bg-[#051650]/30 hover:bg-[#051650]/50 transition-colors border border-[#2D2755]">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-[#4F83FF]" />
                      <span className="text-white font-medium">{appointment.date}</span>
                      <span className="text-[#D1D5DB]">at</span>
                      <Clock className="h-4 w-4 text-[#4F83FF]" />
                      <span className="text-white">{appointment.time}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <User className="h-4 w-4 text-[#D1D5DB]" />
                      <span className="text-white">{appointment.doctor}</span>
                      <span className="text-[#D1D5DB]">•</span>
                      <span className="text-[#D1D5DB]">{appointment.specialization}</span>
                    </div>
                    <p className="text-sm text-[#D1D5DB]">Type: {appointment.type}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      appointment.status === 'Confirmed' ? 'bg-green-500/20 text-green-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {appointment.status}
                    </span>
                    <button className="text-[#4F83FF] hover:text-[#6B9FFF] transition-colors text-sm font-medium">
                      Reschedule
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
          <div className="space-y-2">
            {pastAppointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-3 rounded-lg bg-[#051650]/30 hover:bg-[#051650]/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#D1D5DB]" />
                    <span className="text-white">{appointment.date}</span>
                  </div>
                  <span className="text-[#D1D5DB]">•</span>
                  <span className="text-[#D1D5DB]">{appointment.doctor}</span>
                  <span className="text-[#D1D5DB]">•</span>
                  <span className="text-[#D1D5DB]">{appointment.type}</span>
                </div>
                <button className="text-[#4F83FF] hover:text-[#6B9FFF] transition-colors text-sm font-medium">
                  View Details
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
