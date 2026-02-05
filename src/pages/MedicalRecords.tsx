import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, FileText, Calendar, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const medicalRecords = [
  { id: 1, type: "Consultation", date: "2026-02-01", doctor: "Dr. Sarah Johnson", diagnosis: "Hypertension - Stable", notes: "Blood pressure under control with current medication" },
  { id: 2, type: "Lab Results", date: "2026-01-28", doctor: "Dr. Sarah Johnson", diagnosis: "Blood Test Results", notes: "All parameters within normal range" },
  { id: 3, type: "Imaging", date: "2026-01-25", doctor: "Dr. Michael Chen", diagnosis: "X-Ray - Chest", notes: "No abnormalities detected" },
  { id: 4, type: "Procedure", date: "2026-01-20", doctor: "Dr. Sarah Johnson", diagnosis: "ECG", notes: "Normal sinus rhythm" },
  { id: 5, type: "Consultation", date: "2026-01-15", doctor: "Dr. Sarah Johnson", diagnosis: "Follow-up Visit", notes: "Patient responding well to treatment" },
];

export default function MedicalRecords() {
  const { user } = useAuth();
  const isDoctor = user?.role === 'doctor';

  return (
    <div className="p-6 space-y-6 animate-fade-in bg-[#131e3a] text-white">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          {isDoctor ? "Patient Medical Records" : "My Medical Records"}
        </h1>
        <p className="text-[#D1D5DB]">
          {isDoctor ? "View and manage patient medical history" : "View your complete medical history"}
        </p>
      </div>

      {/* Medical Records */}
      <Card className="border-[#2D2755] bg-[#051650]/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Medical History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {medicalRecords.map((record) => (
              <div key={record.id} className="p-4 rounded-lg bg-[#051650]/30 hover:bg-[#051650]/50 transition-colors border border-[#2D2755]">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{record.type}</h3>
                      <p className="text-[#D1D5DB] text-sm">{record.diagnosis}</p>
                    </div>
                  </div>
                  <button className="text-[#4F83FF] hover:text-[#6B9FFF] transition-colors text-sm font-medium">
                    View Full Record
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-3 border-t border-[#2D2755]/50">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-[#D1D5DB]" />
                    <span className="text-[#D1D5DB]">Date:</span>
                    <span className="text-white">{record.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-[#D1D5DB]" />
                    <span className="text-[#D1D5DB]">Doctor:</span>
                    <span className="text-white">{record.doctor}</span>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-[#2D2755]/50">
                  <p className="text-sm text-[#D1D5DB]">
                    <span className="font-medium text-white">Notes:</span> {record.notes}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
