import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pill, User, Calendar, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const prescriptions = [
  { id: 1, medication: "Lisinopril 10mg", dosage: "1 tablet daily", prescribedBy: "Dr. Sarah Johnson", date: "2026-01-28", duration: "30 days", refills: 2, status: "Active" },
  { id: 2, medication: "Metformin 500mg", dosage: "2 tablets twice daily", prescribedBy: "Dr. Sarah Johnson", date: "2026-01-25", duration: "90 days", refills: 3, status: "Active" },
  { id: 3, medication: "Atorvastatin 20mg", dosage: "1 tablet at bedtime", prescribedBy: "Dr. Michael Chen", date: "2026-01-20", duration: "30 days", refills: 1, status: "Active" },
  { id: 4, medication: "Albuterol Inhaler", dosage: "2 puffs as needed", prescribedBy: "Dr. Sarah Johnson", date: "2026-01-15", duration: "90 days", refills: 4, status: "Active" },
  { id: 5, medication: "Amoxicillin 500mg", dosage: "1 capsule 3 times daily", prescribedBy: "Dr. Sarah Johnson", date: "2026-01-10", duration: "7 days", refills: 0, status: "Completed" },
];

export default function Prescriptions() {
  const { user } = useAuth();
  const isDoctor = user?.role === 'doctor';

  return (
    <div className="p-6 space-y-6 animate-fade-in bg-[#131e3a] text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {isDoctor ? "Prescriptions Management" : "My Prescriptions"}
          </h1>
          <p className="text-[#D1D5DB]">
            {isDoctor ? "Manage patient prescriptions" : "View your current and past prescriptions"}
          </p>
        </div>
        {isDoctor && (
          <button className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors shadow-lg">
            New Prescription
          </button>
        )}
      </div>

      {/* Prescriptions List */}
      <Card className="border-[#2D2755] bg-[#051650]/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Pill className="h-5 w-5" />
            {isDoctor ? "Recent Prescriptions" : "My Prescriptions"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2D2755]">
                  <th className="text-left py-3 px-4 text-[#D1D5DB] font-medium">Medication</th>
                  <th className="text-left py-3 px-4 text-[#D1D5DB] font-medium">Dosage</th>
                  {isDoctor && <th className="text-left py-3 px-4 text-[#D1D5DB] font-medium">Patient</th>}
                  {!isDoctor && <th className="text-left py-3 px-4 text-[#D1D5DB] font-medium">Prescribed By</th>}
                  <th className="text-left py-3 px-4 text-[#D1D5DB] font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-[#D1D5DB] font-medium">Duration</th>
                  <th className="text-left py-3 px-4 text-[#D1D5DB] font-medium">Refills</th>
                  <th className="text-left py-3 px-4 text-[#D1D5DB] font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-[#D1D5DB] font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((prescription) => (
                  <tr key={prescription.id} className="border-b border-[#2D2755]/50 hover:bg-[#051650]/20 transition-colors">
                    <td className="py-3 px-4 text-white flex items-center gap-2">
                      <Pill className="h-4 w-4 text-[#4F83FF]" />
                      {prescription.medication}
                    </td>
                    <td className="py-3 px-4 text-[#D1D5DB]">{prescription.dosage}</td>
                    {isDoctor ? (
                      <td className="py-3 px-4 text-[#D1D5DB] flex items-center gap-2">
                        <User className="h-4 w-4" />
                        John Smith
                      </td>
                    ) : (
                      <td className="py-3 px-4 text-[#D1D5DB]">{prescription.prescribedBy}</td>
                    )}
                    <td className="py-3 px-4 text-[#D1D5DB] flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {prescription.date}
                    </td>
                    <td className="py-3 px-4 text-[#D1D5DB]">{prescription.duration}</td>
                    <td className="py-3 px-4 text-[#D1D5DB]">{prescription.refills} left</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        prescription.status === 'Active' ? 'bg-green-500/20 text-green-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {prescription.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button className="text-[#4F83FF] hover:text-[#6B9FFF] transition-colors text-sm font-medium flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        View
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
