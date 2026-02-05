import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, User, TrendingUp, AlertCircle } from "lucide-react";

const statsData = [
  { title: "Total Patients", value: "42", icon: Users, trend: { value: "5", isPositive: true } },
  { title: "Active Cases", value: "38", icon: TrendingUp, trend: { value: "3", isPositive: true } },
  { title: "Critical", value: "3", icon: AlertCircle, trend: { value: "1", isPositive: false } },
  { title: "New This Week", value: "5", icon: User, trend: { value: "2", isPositive: true } },
];

const patients = [
  { id: 1, name: "John Smith", age: 45, condition: "Hypertension", lastVisit: "2026-01-28", status: "Stable", nextAppointment: "2026-02-05" },
  { id: 2, name: "Sarah Johnson", age: 32, condition: "Diabetes Type 2", lastVisit: "2026-01-30", status: "Under Review", nextAppointment: "2026-02-06" },
  { id: 3, name: "Michael Brown", age: 58, condition: "Cardiac Arrhythmia", lastVisit: "2026-02-01", status: "Critical", nextAppointment: "2026-02-04" },
  { id: 4, name: "Emily Davis", age: 27, condition: "Asthma", lastVisit: "2026-01-29", status: "Stable", nextAppointment: "2026-02-10" },
  { id: 5, name: "Robert Wilson", age: 61, condition: "Osteoarthritis", lastVisit: "2026-01-31", status: "Improving", nextAppointment: "2026-02-08" },
];

export default function MyPatients() {
  return (
    <div className="p-6 space-y-6 animate-fade-in bg-[#131e3a] text-white">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">My Patients</h1>
        <p className="text-[#D1D5DB]">Manage your assigned patients</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <div key={stat.title} className="animate-slide-in" style={{ animationDelay: `${index * 100}ms` }}>
            <StatsCard {...stat} />
          </div>
        ))}
      </div>

      {/* Patients Table */}
      <Card className="border-[#2D2755] bg-[#051650]/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5" />
            Patient List
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
                  <th className="text-left py-3 px-4 text-[#D1D5DB] font-medium">Next Appointment</th>
                  <th className="text-left py-3 px-4 text-[#D1D5DB] font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-[#D1D5DB] font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient.id} className="border-b border-[#2D2755]/50 hover:bg-[#051650]/20 transition-colors">
                    <td className="py-3 px-4 text-white flex items-center gap-2">
                      <User className="h-4 w-4 text-[#D1D5DB]" />
                      {patient.name}
                    </td>
                    <td className="py-3 px-4 text-[#D1D5DB]">{patient.age}</td>
                    <td className="py-3 px-4 text-[#D1D5DB]">{patient.condition}</td>
                    <td className="py-3 px-4 text-[#D1D5DB]">{patient.lastVisit}</td>
                    <td className="py-3 px-4 text-[#D1D5DB]">{patient.nextAppointment}</td>
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
