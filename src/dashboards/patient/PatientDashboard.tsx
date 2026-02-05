import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, FileText, UserCircle, Bell, Download, User, Phone, Mail } from "lucide-react";

const statsData = [
  { title: "Upcoming Appointments", value: "3", icon: Calendar, trend: { value: "1", isPositive: true } },
  { title: "Reports Available", value: "5", icon: FileText, trend: { value: "2", isPositive: true } },
  { title: "Notifications", value: "2", icon: Bell, trend: { value: "1", isPositive: true } },
];

const myAppointments = [
  { id: 1, date: "Feb 3, 2026", time: "10:00 AM", doctor: "Dr. Sarah Johnson", specialization: "Cardiologist", status: "Confirmed" },
  { id: 2, date: "Feb 5, 2026", time: "02:30 PM", doctor: "Dr. Michael Chen", specialization: "General Physician", status: "Pending" },
  { id: 3, date: "Feb 10, 2026", time: "11:00 AM", doctor: "Dr. Sarah Johnson", specialization: "Cardiologist", status: "Confirmed" },
];

const myReports = [
  { id: 1, name: "Blood Test Report", date: "2026-01-28", doctor: "Dr. Sarah Johnson", status: "Available" },
  { id: 2, name: "ECG Report", date: "2026-01-25", doctor: "Dr. Sarah Johnson", status: "Available" },
  { id: 3, name: "X-Ray Report", date: "2026-01-20", doctor: "Dr. Michael Chen", status: "Available" },
  { id: 4, name: "MRI Scan", date: "2026-01-15", doctor: "Dr. Sarah Johnson", status: "Available" },
  { id: 5, name: "Lipid Profile", date: "2026-01-10", doctor: "Dr. Sarah Johnson", status: "Available" },
];

const assignedDoctor = {
  name: "Dr. Sarah Johnson",
  specialization: "Cardiologist",
  email: "sarah.johnson@hospital.com",
  phone: "+1 (555) 123-4567",
  experience: "15 years",
};

const patientProfile = {
  name: "John Smith",
  age: 45,
  gender: "Male",
  bloodGroup: "O+",
  email: "john.smith@email.com",
  phone: "+1 (555) 987-6543",
};

export default function PatientDashboard() {
  return (
    <div className="p-6 space-y-6 animate-fade-in bg-[#131e3a] text-white">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">My Health Dashboard</h1>
        <p className="text-[#D1D5DB]">View your appointments, reports, and health information</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsData.map((stat, index) => (
          <div key={stat.title} className="animate-slide-in" style={{ animationDelay: `${index * 100}ms` }}>
            <StatsCard {...stat} />
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Appointments */}
        <Card className="border-[#2D2755] bg-[#051650]/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              My Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myAppointments.map((appointment) => (
                <div key={appointment.id} className="p-4 rounded-lg bg-[#051650]/30 hover:bg-[#051650]/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-4 w-4 text-[#4F83FF]" />
                        <span className="text-white font-medium">{appointment.date}</span>
                        <span className="text-[#D1D5DB]">at {appointment.time}</span>
                      </div>
                      <p className="text-white">{appointment.doctor}</p>
                      <p className="text-[#D1D5DB] text-sm">{appointment.specialization}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      appointment.status === 'Confirmed' ? 'bg-green-500/20 text-green-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {appointment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* My Reports */}
        <Card className="border-[#2D2755] bg-[#051650]/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="h-5 w-5" />
              My Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {myReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-3 rounded-lg bg-[#051650]/30 hover:bg-[#051650]/50 transition-colors">
                  <div className="flex-1">
                    <p className="text-white font-medium">{report.name}</p>
                    <p className="text-[#D1D5DB] text-sm">{report.date} • {report.doctor}</p>
                  </div>
                  <button className="flex items-center gap-1 px-3 py-1 rounded-md bg-[#4F83FF]/20 hover:bg-[#4F83FF]/30 text-[#4F83FF] transition-colors">
                    <Download className="h-4 w-4" />
                    <span className="text-sm">View</span>
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
