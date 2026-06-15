import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pill, User, Calendar, FileText, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useDoctorPrescriptions } from "@/hooks/useDoctorData";
import { useMyPrescriptions } from "@/hooks/usePatientData";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import api from "@/lib/api";

export default function Prescriptions() {
  const { user } = useAuth();
  const isDoctor = user?.role === 'doctor';

  const doctorData = useDoctorPrescriptions();
  const patientData = useMyPrescriptions();

  const isLoading = isDoctor ? doctorData.isLoading : patientData.isLoading;
  const prescriptions = isDoctor ? (doctorData.data || []) : (patientData.data || []);

  const [selectedPrescription, setSelectedPrescription] = useState<any | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);

  const handleSelectPrescription = (prescription: any) => {
    setSelectedPrescription(prescription);
    setAiSummary(prescription?.ai_summary || null);
  };

  const handleGenerateSummary = async () => {
    if (!selectedPrescription) return;
    setIsGeneratingSummary(true);
    try {
      const endpoint = isDoctor 
        ? `/doctor/prescriptions/${selectedPrescription.id}/generate-summary`
        : `/patient/prescriptions/${selectedPrescription.id}/generate-summary`;
      const response = await api.post(endpoint);
      const summary = response.data.ai_summary || response.data.summary;
      setAiSummary(summary);
      selectedPrescription.ai_summary = summary;
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to generate AI summary");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

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
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 bg-[#1e2d4d] rounded-lg" />)}
            </div>
          ) : prescriptions.length === 0 ? (
            <p className="text-[#D1D5DB] text-center py-6">No prescriptions found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2D2755]">
                    <th className="text-left py-3 px-4 text-[#D1D5DB] font-medium">Date</th>
                    <th className="text-left py-3 px-4 text-[#D1D5DB] font-medium">Diagnosis</th>
                    <th className="text-left py-3 px-4 text-[#D1D5DB] font-medium">Medicines</th>
                    {isDoctor ? (
                      <th className="text-left py-3 px-4 text-[#D1D5DB] font-medium">Patient</th>
                    ) : (
                      <th className="text-left py-3 px-4 text-[#D1D5DB] font-medium">Prescribed By</th>
                    )}
                    <th className="text-left py-3 px-4 text-[#D1D5DB] font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {prescriptions.map((prescription: any) => {
                    const formattedDate = format(parseISO(prescription.created_at), "dd MMM yyyy");
                    const medicineNames = prescription.items?.map((item: any) => item.medicine_name).join(", ") || "No items";

                    return (
                      <tr key={prescription.id} className="border-b border-[#2D2755]/50 hover:bg-[#051650]/20 transition-colors">
                        <td className="py-3 px-4 text-[#D1D5DB] flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {formattedDate}
                        </td>
                        <td className="py-3 px-4 text-white font-medium">{prescription.diagnosis || "No diagnosis"}</td>
                        <td className="py-3 px-4 text-[#D1D5DB] max-w-[200px] truncate">{medicineNames}</td>
                        {isDoctor ? (
                          <td className="py-3 px-4 text-[#D1D5DB] flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {prescription.patient_name || "Patient"}
                          </td>
                        ) : (
                          <td className="py-3 px-4 text-[#D1D5DB]">{prescription.doctor_name || "Doctor"}</td>
                        )}
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleSelectPrescription(prescription)}
                            className="text-[#4F83FF] hover:text-[#6B9FFF] transition-colors text-sm font-medium flex items-center gap-1"
                          >
                            <FileText className="h-4 w-4" />
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prescription Details Modal */}
      <Dialog open={!!selectedPrescription} onOpenChange={(open) => !open && setSelectedPrescription(null)}>
        <DialogContent className="border-[#2D2755] bg-[#131e3a] text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Pill className="h-5 w-5 text-primary" />
              Prescription Details
            </DialogTitle>
            <DialogDescription className="text-[#D1D5DB]">
              Prescribed on {selectedPrescription ? format(parseISO(selectedPrescription.created_at), "dd MMM yyyy · hh:mm a") : ""}
            </DialogDescription>
          </DialogHeader>

          {selectedPrescription && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4 border-b border-[#2D2755] pb-4">
                <div>
                  <p className="text-xs text-[#D1D5DB]">Patient Name</p>
                  <p className="text-sm font-semibold text-white">{selectedPrescription.patient_name || "Patient"}</p>
                </div>
                <div>
                  <p className="text-xs text-[#D1D5DB]">Prescribed By</p>
                  <p className="text-sm font-semibold text-white">{selectedPrescription.doctor_name || "Doctor"}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-[#D1D5DB] mb-1">Diagnosis</p>
                <p className="text-sm text-white font-medium bg-[#051650]/20 p-2.5 rounded-lg border border-[#2D2755]">
                  {selectedPrescription.diagnosis || "No diagnosis specified"}
                </p>
              </div>

              {selectedPrescription.notes && (
                <div>
                  <p className="text-xs text-[#D1D5DB] mb-1">Clinical Notes</p>
                  <p className="text-sm text-white bg-[#051650]/20 p-2.5 rounded-lg border border-[#2D2755] italic">
                    {selectedPrescription.notes}
                  </p>
                </div>
              )}

              <div>
                <p className="text-xs text-[#D1D5DB] mb-2 font-semibold">Prescribed Medicines</p>
                <div className="space-y-2">
                  {selectedPrescription.items && selectedPrescription.items.length > 0 ? (
                    selectedPrescription.items.map((item: any) => (
                      <div key={item.id} className="p-3 bg-[#051650]/30 rounded-lg border border-[#2D2755]/50">
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-white font-semibold text-sm flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            {item.medicine_name}
                          </p>
                          <span className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary-foreground font-medium">
                            {item.duration || "As needed"}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-[#2D2755]/20 text-xs text-[#D1D5DB]">
                          <div>
                            <span className="font-medium text-white">Dosage:</span> {item.dosage || "—"}
                          </div>
                          <div>
                            <span className="font-medium text-white">Frequency:</span> {item.frequency || "—"}
                          </div>
                        </div>
                        {item.instructions && (
                          <p className="text-xs text-primary/85 mt-2 bg-primary/5 p-1.5 rounded border border-primary/10">
                            Instructions: {item.instructions}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-[#D1D5DB]">No medicines prescribed</p>
                  )}
                </div>
              </div>

              {selectedPrescription.image_url && (
                <div className="pt-2">
                  <p className="text-xs text-[#D1D5DB] mb-1">Prescription Image</p>
                  <a
                    href={`http://localhost:8000${selectedPrescription.image_url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    <FileText className="h-4 w-4" /> View uploaded file
                  </a>
                </div>
              )}

              {/* AI Clinical Summary Section */}
              <div className="pt-4 border-t border-[#2D2755]/60 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-[#D1D5DB] font-semibold flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                    AI Clinical Summary
                  </p>
                  {!aiSummary && !isGeneratingSummary && (
                    <button
                      onClick={handleGenerateSummary}
                      className="px-2.5 py-1 text-xs bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-lg shadow-md transition-all flex items-center gap-1"
                    >
                      <Sparkles className="h-3 w-3" /> Explain with AI
                    </button>
                  )}
                </div>

                {isGeneratingSummary ? (
                  <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-2 animate-pulse">
                    <div className="h-3 bg-[#2D2755] rounded w-3/4"></div>
                    <div className="h-3 bg-[#2D2755] rounded w-5/6"></div>
                    <div className="h-3 bg-[#2D2755] rounded w-2/3"></div>
                    <p className="text-[10px] text-amber-400 text-center italic">AI is generating prescription summary...</p>
                  </div>
                ) : aiSummary ? (
                  <div className="p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-xl text-xs text-[#D1D5DB] leading-relaxed space-y-2 max-h-[200px] overflow-y-auto animate-fade-in">
                    <p className="font-semibold text-amber-300">Smart Summary & Patient Guide:</p>
                    <div className="whitespace-pre-line text-white/90">{aiSummary.replace(/\*\*/g, "").replace(/\*/g, "")}</div>
                  </div>
                ) : (
                  <p className="text-xs text-[#9CA3AF] italic">No AI summary generated yet. Click "Explain with AI" to generate one.</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
