import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, FileText, Calendar, User, ExternalLink } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useDoctorMedicalRecords } from "@/hooks/useDoctorData";
import { useMyMedicalRecords } from "@/hooks/usePatientData";
import { Skeleton } from "@/components/ui/skeleton";

export default function MedicalRecords() {
  const { user } = useAuth();
  const isDoctor = user?.role === 'doctor';

  const doctorData = useDoctorMedicalRecords();
  const patientData = useMyMedicalRecords();

  const isLoading = isDoctor ? doctorData.isLoading : patientData.isLoading;
  const records = isDoctor ? (doctorData.data || []) : (patientData.data || []);

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
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 bg-[#1e2d4d] rounded-lg" />)}
            </div>
          ) : records.length === 0 ? (
            <p className="text-[#D1D5DB] text-center py-6">No medical records found</p>
          ) : (
            <div className="space-y-4">
              {records.map((record: any) => (
                <div key={record.id} className="p-4 rounded-lg bg-[#051650]/30 hover:bg-[#051650]/50 transition-colors border border-[#2D2755]">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold capitalize">{record.record_type || "Record"}</h3>
                        <p className="text-primary font-medium text-sm">{record.title}</p>
                      </div>
                    </div>
                    {record.file_url && (
                      <a
                        href={`http://localhost:8000${record.file_url}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#4F83FF] hover:text-[#6B9FFF] transition-colors text-sm font-medium flex items-center gap-1"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View File
                      </a>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-3 border-t border-[#2D2755]/50">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-[#D1D5DB]" />
                      <span className="text-[#D1D5DB]">Date:</span>
                      <span className="text-white">{record.record_date || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-[#D1D5DB]" />
                      {isDoctor ? (
                        <>
                          <span className="text-[#D1D5DB]">Patient:</span>
                          <span className="text-white">{record.patient_name || "Patient"}</span>
                        </>
                      ) : (
                        <>
                          <span className="text-[#D1D5DB]">Doctor:</span>
                          <span className="text-white">{record.doctor_name || "—"}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {record.description && (
                    <div className="mt-3 pt-3 border-t border-[#2D2755]/50">
                      <p className="text-sm text-[#D1D5DB]">
                        <span className="font-medium text-white">Notes:</span> {record.description}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
