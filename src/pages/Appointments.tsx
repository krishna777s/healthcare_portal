import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, CheckCircle, XCircle, User } from "lucide-react";

const statsData = [
  { title: "Today's Appointments", value: "8", icon: Calendar, trend: { value: "2", isPositive: true } },
  { title: "Upcoming This Week", value: "24", icon: Clock, trend: { value: "5", isPositive: true } },
  { title: "Completed Today", value: "6", icon: CheckCircle, trend: { value: "1", isPositive: true } },
  { title: "Cancelled", value: "2", icon: XCircle, trend: { value: "1", isPositive: false } },
];

const appointments = [
  { id: 1, time: "09:00 AM", patient: "John Smith", type: "Follow-up", status: "Confirmed" },
  { id: 2, time: "10:30 AM", patient: "Sarah Johnson", type: "Consultation", status: "Confirmed" },
  { id: 3, time: "11:30 AM", patient: "Michael Brown", type: "Check-up", status: "Pending" },
  { id: 4, time: "02:00 PM", patient: "Emily Davis", type: "Review", status: "Confirmed" },
  { id: 5, time: "03:30 PM", patient: "Robert Wilson", type: "Prescription", status: "Confirmed" },
  { id: 6, time: "04:30 PM", patient: "Lisa Anderson", type: "Consultation", status: "Pending" },
];

export default function Appointments() {
  return (
    <div className="p-6 space-y-6 animate-fade-in bg-[#131e3a] text-white">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Appointments</h1>
        <p className="text-[#D1D5DB]">Manage your appointment schedule</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
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
            Today's Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2D2755]">
                  <th className="text-left py-3 px-4 text-[#D1D5DB] font-medium">Time</th>
                  <th className="text-left py-3 px-4 text-[#D1D5DB] font-medium">Patient</th>
                  <th className="text-left py-3 px-4 text-[#D1D5DB] font-medium">Type</th>
                  <th className="text-left py-3 px-4 text-[#D1D5DB] font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-[#D1D5DB] font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr key={appointment.id} className="border-b border-[#2D2755]/50 hover:bg-[#051650]/20 transition-colors">
                    <td className="py-3 px-4 text-white flex items-center gap-2">
                      <Clock className="h-4 w-4 text-[#4F83FF]" />
                      {appointment.time}
                    </td>
                    <td className="py-3 px-4 text-white flex items-center gap-2">
                      <User className="h-4 w-4 text-[#D1D5DB]" />
                      {appointment.patient}
                    </td>
                    <td className="py-3 px-4 text-[#D1D5DB]">{appointment.type}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        appointment.status === 'Confirmed' ? 'bg-green-500/20 text-green-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {appointment.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button className="text-[#4F83FF] hover:text-[#6B9FFF] transition-colors text-sm font-medium">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
