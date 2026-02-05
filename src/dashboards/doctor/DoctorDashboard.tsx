import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, FileText, Bell, User, Clock, CheckCircle } from "lucide-react";

const statsData = [
  { title: "Assigned Patients", value: "42", icon: Users, trend: { value: "5", isPositive: true } },
  { title: "Today's Appointments", value: "8", icon: Calendar, trend: { value: "2", isPositive: true } },
  { title: "Pending Reports", value: "12", icon: FileText, trend: { value: "3", isPositive: false } },
  { title: "Notifications", value: "6", icon: Bell, trend: { value: "2", isPositive: true } },
];

const myPatients = [
  { id: 1, name: "John Smith", age: 45, condition: "Hypertension", lastVisit: "2026-01-28", status: "Stable" },
  { id: 2, name: "Sarah Johnson", age: 32, condition: "Diabetes Type 2", lastVisit: "2026-01-30", status: "Under Review" },
  { id: 3, name: "Michael Brown", age: 58, condition: "Cardiac Arrhythmia", lastVisit: "2026-02-01", status: "Critical" },
  { id: 4, name: "Emily Davis", age: 27, condition: "Asthma", lastVisit: "2026-01-29", status: "Stable" },
  { id: 5, name: "Robert Wilson", age: 61, condition: "Osteoarthritis", lastVisit: "2026-01-31", status: "Improving" },
];

const todayAppointments = [
  { id: 1, time: "09:00 AM", patient: "John Smith", type: "Follow-up" },
  { id: 2, time: "10:30 AM", patient: "Sarah Johnson", type: "Consultation" },
  { id: 3, time: "02:00 PM", patient: "Michael Brown", type: "Check-up" },
  { id: 4, time: "03:30 PM", patient: "Emily Davis", type: "Prescription" },
];

const upcomingAppointments = [
  { id: 1, date: "Feb 3", patient: "Robert Wilson", type: "Follow-up" },
  { id: 2, date: "Feb 3", patient: "Lisa Anderson", type: "Initial Consultation" },
  { id: 3, date: "Feb 4", patient: "James Martinez", type: "Lab Review" },
  { id: 4, date: "Feb 5", patient: "Patricia Garcia", type: "Treatment Plan" },
];

const pendingReports = [
  { id: 1, patient: "Michael Brown", test: "ECG Report", requestedDate: "2026-02-01", priority: "High" },
  { id: 2, patient: "Sarah Johnson", test: "Blood Sugar Analysis", requestedDate: "2026-01-30", priority: "Medium" },
  { id: 3, patient: "John Smith", test: "Blood Pressure Monitor", requestedDate: "2026-01-28", priority: "Low" },
];

export default function DoctorDashboard() {
  return (
    <div className="p-6 space-y-6 animate-fade-in bg-[#131e3a] text-white">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Doctor Dashboard</h1>
        <p className="text-[#D1D5DB]">Manage your patients, appointments, and reports</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <div key={stat.title} className="animate-slide-in" style={{ animationDelay: `${index * 100}ms` }}>
            <StatsCard {...stat} />
          </div>
        ))}
      </div>

      {/* My Patients Section */}
      <Card className="border-[#2D2755] bg-[#051650]/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5" />
            My Patients
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2D2755]">
                  <th className="text-left py-3 px-4 text-[#D1D5DB] font-medium">Name</th>
                  <th className="text-left py-3 px-4 text-[#D1D5DB] font-medium">Age</th>
                  <th className="text-left py-3 px-4 text-[#D1D5DB] font-medium">Condition</th>
                  <th className="text-left py-3 px-4 text-[#D1D5DB] font-medium">Last Visit</th>
                  <th className="text-left py-3 px-4 text-[#D1D5DB] font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {myPatients.map((patient) => (
                  <tr key={patient.id} className="border-b border-[#2D2755]/50 hover:bg-[#051650]/20 transition-colors">
                    <td className="py-3 px-4 text-white flex items-center gap-2">
                      <User className="h-4 w-4 text-[#D1D5DB]" />
                      {patient.name}
                    </td>
                    <td className="py-3 px-4 text-[#D1D5DB]">{patient.age}</td>
                    <td className="py-3 px-4 text-[#D1D5DB]">{patient.condition}</td>
                    <td className="py-3 px-4 text-[#D1D5DB]">{patient.lastVisit}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        patient.status === 'Critical' ? 'bg-red-500/20 text-red-400' :
                        patient.status === 'Under Review' ? 'bg-yellow-500/20 text-yellow-400' :
                        patient.status === 'Improving' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {patient.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Appointments Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <Card className="border-[#2D2755] bg-[#051650]/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Today's Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todayAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 rounded-lg bg-[#051650]/30 hover:bg-[#051650]/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-[#4F83FF]" />
                      <span className="text-white font-medium">{appointment.time}</span>
                    </div>
                    <div>
                      <p className="text-white">{appointment.patient}</p>
                      <p className="text-[#D1D5DB] text-sm">{appointment.type}</p>
                    </div>
                  </div>
                  <CheckCircle className="h-5 w-5 text-[#D1D5DB] hover:text-green-400 cursor-pointer transition-colors" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

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
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 rounded-lg bg-[#051650]/30 hover:bg-[#051650]/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-16 text-center">
                      <span className="text-white font-medium">{appointment.date}</span>
                    </div>
                    <div>
                      <p className="text-white">{appointment.patient}</p>
                      <p className="text-[#D1D5DB] text-sm">{appointment.type}</p>
                    </div>
                  </div>
                  <Calendar className="h-5 w-5 text-[#D1D5DB]" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Reports */}
      <Card className="border-[#2D2755] bg-[#051650]/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Pending Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2D2755]">
                  <th className="text-left py-3 px-4 text-[#D1D5DB] font-medium">Patient</th>
                  <th className="text-left py-3 px-4 text-[#D1D5DB] font-medium">Test/Report</th>
                  <th className="text-left py-3 px-4 text-[#D1D5DB] font-medium">Requested Date</th>
                  <th className="text-left py-3 px-4 text-[#D1D5DB] font-medium">Priority</th>
                  <th className="text-left py-3 px-4 text-[#D1D5DB] font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingReports.map((report) => (
                  <tr key={report.id} className="border-b border-[#2D2755]/50 hover:bg-[#051650]/20 transition-colors">
                    <td className="py-3 px-4 text-white">{report.patient}</td>
                    <td className="py-3 px-4 text-[#D1D5DB]">{report.test}</td>
                    <td className="py-3 px-4 text-[#D1D5DB]">{report.requestedDate}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        report.priority === 'High' ? 'bg-red-500/20 text-red-400' :
                        report.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {report.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button className="text-[#4F83FF] hover:text-[#6B9FFF] transition-colors text-sm font-medium">
                        Review
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
