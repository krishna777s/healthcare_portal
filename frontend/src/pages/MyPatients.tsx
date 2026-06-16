import { useState } from "react";
import { Link } from "react-router-dom";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, User, TrendingUp, AlertCircle, Plus, X, FileText, Activity, Calendar, History } from "lucide-react";
import {
  useMyPatients,
  useCreatePrescription,
  useCreateMedicalRecord,
  useCreateLabReport,
  useUploadLabReportFile,
  useCreateAppointment,
  useUploadPrescriptionFile,
} from "@/hooks/useDoctorData";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const statusColor: Record<string, string> = {
  stable: "bg-green-500/20 text-green-400",
  improving: "bg-blue-500/20 text-blue-400",
  under_review: "bg-yellow-500/20 text-yellow-400",
  critical: "bg-red-500/20 text-red-400",
};

export default function MyPatients() {
  const { data: patients = [], isLoading } = useMyPatients();
  const createPrescription = useCreatePrescription();
  const createMedicalRecord = useCreateMedicalRecord();
  const createLabReport = useCreateLabReport();
  const uploadLabReportFile = useUploadLabReportFile();
  const createAppointment = useCreateAppointment();
  const uploadPrescriptionFile = useUploadPrescriptionFile();
  const { toast } = useToast();

  // Modal States
  const [prescModal, setPrescModal] = useState<{ open: boolean; patientId: string; patientName: string } | null>(null);
  const [recordModal, setRecordModal] = useState<{ open: boolean; patientId: string; patientName: string } | null>(null);
  const [labModal, setLabModal] = useState<{ open: boolean; patientId: string; patientName: string } | null>(null);
  const [apptModal, setApptModal] = useState<{ open: boolean; patientId: string; patientName: string } | null>(null);
  const [prescFile, setPrescFile] = useState<File | null>(null);

  // Form States - Appointment
  const [apptForm, setApptForm] = useState({
    appointment_date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    appointment_time: "10:00",
    appointment_type: "follow-up",
    notes: ""
  });

  // Form States - Prescriptions
  const [medicines, setMedicines] = useState([{ medicine_name: "", dosage: "", frequency: "", duration: "", instructions: "" }]);
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");

  // Form States - Medical Records
  const [recordForm, setRecordForm] = useState({
    record_type: "consultation",
    title: "",
    description: "",
    record_date: new Date().toISOString().split("T")[0],
  });

  // Form States - Lab Reports
  const [labForm, setLabForm] = useState({
    report_name: "",
    report_type: "blood_test",
    priority: "normal",
    notes: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const statsCards = [
    { title: "Total Outpatients", value: String(patients.length), icon: Users },
    { title: "Active Cases", value: String(patients.filter((p: any) => p.status !== "stable").length), icon: TrendingUp },
    { title: "Critical Patients", value: String(patients.filter((p: any) => p.status === "critical").length), icon: AlertCircle },
    { title: "Follow-ups Due", value: String(patients.filter((p: any) => p.next_appointment).length), icon: User },
  ];

  const handleAddMedicine = () =>
    setMedicines([...medicines, { medicine_name: "", dosage: "", frequency: "", duration: "", instructions: "" }]);

  const handleMedicineChange = (idx: number, field: string, value: string) =>
    setMedicines(medicines.map((m, i) => (i === idx ? { ...m, [field]: value } : m)));

  const handleCreatePrescription = async () => {
    if (!prescModal) return;
    try {
      const rx = await createPrescription.mutateAsync({
        patient_id: prescModal.patientId,
        diagnosis,
        notes,
        items: medicines.filter((m) => m.medicine_name),
      });

      if (prescFile) {
        const formData = new FormData();
        formData.append("file", prescFile);
        await uploadPrescriptionFile.mutateAsync({
          prescriptionId: rx.id,
          formData,
        });
      }

      toast({
        title: "Success",
        description: "Prescription Added Successfully!",
      });
      setPrescModal(null);
      setMedicines([{ medicine_name: "", dosage: "", frequency: "", duration: "", instructions: "" }]);
      setDiagnosis("");
      setNotes("");
      setPrescFile(null);
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: err.response?.data?.detail || "Failed to create prescription",
        variant: "destructive"
      });
    }
  };

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordModal) return;
    try {
      await createMedicalRecord.mutateAsync({
        patient_id: recordModal.patientId,
        record_type: recordForm.record_type,
        title: recordForm.title,
        description: recordForm.description || null,
        record_date: recordForm.record_date || null,
      });
      toast({
        title: "Success",
        description: "Medical Record Added Successfully!",
      });
      setRecordModal(null);
      setRecordForm({
        record_type: "consultation",
        title: "",
        description: "",
        record_date: new Date().toISOString().split("T")[0],
      });
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: err.response?.data?.detail || "Failed to add medical record",
        variant: "destructive"
      });
    }
  };

  const handleCreateLabReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!labModal) return;
    try {
      setIsUploading(true);
      const report = await createLabReport.mutateAsync({
        patient_id: labModal.patientId,
        report_name: labForm.report_name,
        report_type: labForm.report_type,
        priority: labForm.priority,
        notes: labForm.notes || null,
      });

      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        await uploadLabReportFile.mutateAsync({
          reportId: report.id,
          formData,
        });
      }

      toast({
        title: "Success",
        description: "Lab Report Added Successfully!",
      });
      setLabModal(null);
      setLabForm({
        report_name: "",
        report_type: "blood_test",
        priority: "normal",
        notes: "",
      });
      setSelectedFile(null);
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: err.response?.data?.detail || "Failed to create lab report",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apptModal) return;
    try {
      await createAppointment.mutateAsync({
        patient_id: apptModal.patientId,
        appointment_date: apptForm.appointment_date,
        appointment_time: apptForm.appointment_time,
        appointment_type: apptForm.appointment_type,
        notes: apptForm.notes,
        status: "scheduled"
      });
      toast({
        title: "Success",
        description: "Appointment Scheduled Successfully!",
      });
      setApptModal(null);
      setApptForm({
        appointment_date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
        appointment_time: "10:00",
        appointment_type: "follow-up",
        notes: ""
      });
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: err.response?.data?.detail || "Failed to schedule appointment",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in bg-[#131e3a] text-white min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
          <Users className="h-8 w-8 text-[#4F83FF]" /> Outpatients
        </h1>
        <p className="text-[#D1D5DB]">Outpatients assigned to you — consult, prescribe, and log medical diagnostics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl bg-[#1e2d4d]" />)
          : statsCards.map((stat, i) => (
              <div key={stat.title} className="animate-slide-in" style={{ animationDelay: `${i * 80}ms` }}>
                <StatsCard {...stat} />
              </div>
            ))}
      </div>

      <Card className="border-[#2D2755] bg-[#051650]/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-400" /> Patient List ({patients.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 bg-[#1e2d4d] rounded-lg" />)}</div>
          ) : patients.length === 0 ? (
            <div className="text-center py-10 text-[#D1D5DB]">
              <p className="font-semibold text-lg text-white">No Assigned Patients</p>
              <p className="text-sm mt-1">Please ask the Administrator to assign patients to your profile.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2D2755]">
                    {["Name", "Gender", "Blood Group", "Condition", "Last Visit", "Next Appointment", "Status", "Clinical Actions"].map((h) => (
                      <th key={h} className="text-left py-3 px-3 text-[#D1D5DB] font-medium text-sm">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {patients.map((p: any) => (
                    <tr key={p.id} className="border-b border-[#2D2755]/50 hover:bg-[#051650]/20 transition-colors">
                      <td className="py-4 px-3 text-white font-semibold flex items-center gap-2">
                        <User className="h-4 w-4 text-[#4F83FF] flex-shrink-0" />
                        {p.full_name}
                      </td>
                      <td className="py-4 px-3 text-[#D1D5DB] text-sm capitalize">{p.gender || "—"}</td>
                      <td className="py-4 px-3 text-[#D1D5DB] text-sm">{p.blood_group || "—"}</td>
                      <td className="py-4 px-3 text-[#D1D5DB] text-sm">{p.current_condition || "—"}</td>
                      <td className="py-4 px-3 text-[#D1D5DB] text-xs">{p.last_visit || "—"}</td>
                      <td className="py-4 px-3 text-[#D1D5DB] text-xs">{p.next_appointment || "No appt"}</td>
                      <td className="py-4 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs capitalize font-semibold ${statusColor[p.status] || "bg-gray-500/20 text-gray-400"}`}>
                          {p.status?.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-4 px-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            onClick={() => setPrescModal({ open: true, patientId: p.id, patientName: p.full_name })}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 rounded-lg transition-colors font-medium border border-blue-500/20"
                          >
                            <Plus className="h-3.5 w-3.5" /> Rx
                          </button>
                          <button
                            onClick={() => setRecordModal({ open: true, patientId: p.id, patientName: p.full_name })}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 rounded-lg transition-colors font-medium border border-emerald-500/20"
                          >
                            <FileText className="h-3.5 w-3.5" /> Record
                          </button>
                          <button
                            onClick={() => setLabModal({ open: true, patientId: p.id, patientName: p.full_name })}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 rounded-lg transition-colors font-medium border border-amber-500/20"
                          >
                            <Activity className="h-3.5 w-3.5" /> Lab Report
                          </button>
                          <button
                            onClick={() => setApptModal({ open: true, patientId: p.id, patientName: p.full_name })}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 rounded-lg transition-colors font-medium border border-indigo-500/20"
                          >
                            <Calendar className="h-3.5 w-3.5" /> Schedule Appt
                          </button>
                          <Link
                            to={`/dashboard/patient-history?patientId=${p.id}`}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs bg-violet-600/20 hover:bg-violet-600/40 text-violet-300 rounded-lg transition-colors font-medium border border-violet-500/20"
                          >
                            <History className="h-3.5 w-3.5" /> History
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prescription Modal */}
      {prescModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#131e3a] border border-[#2D2755] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-[#2D2755]">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">Write Prescription — {prescModal.patientName}</h2>
              <button onClick={() => setPrescModal(null)} className="text-[#D1D5DB] hover:text-white p-1 hover:bg-[#051650]/40 rounded-lg"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-[#D1D5DB] text-xs mb-1 block">Diagnosis</label>
                <input
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="e.g. Hypertension Stage 1"
                  className="w-full bg-[#051650]/30 border border-[#2D2755] rounded-lg px-3 py-2 text-white placeholder-[#6B7280] text-sm focus:outline-none focus:border-[#4F83FF]"
                />
              </div>
              <div>
                <label className="text-[#D1D5DB] text-xs mb-1 block">Clinical Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes for pharmacist or patient..."
                  rows={2}
                  className="w-full bg-[#051650]/30 border border-[#2D2755] rounded-lg px-3 py-2 text-white placeholder-[#6B7280] text-sm focus:outline-none focus:border-[#4F83FF] resize-none"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[#D1D5DB] text-sm font-semibold">Prescribed Medicines</label>
                  <button onClick={handleAddMedicine} className="text-xs text-[#4F83FF] hover:text-[#6B9FFF] flex items-center gap-1 font-medium">
                    <Plus className="h-3.5 w-3.5" /> Add Medicine
                  </button>
                </div>
                <div className="space-y-3">
                  {medicines.map((m, idx) => (
                    <div key={idx} className="grid grid-cols-2 gap-2 p-3 bg-[#051650]/20 border border-[#2D2755]/40 rounded-xl relative">
                      {[
                        { field: "medicine_name", placeholder: "Medicine Name *", fullWidth: true },
                        { field: "dosage", placeholder: "Dosage (e.g. 500mg)" },
                        { field: "frequency", placeholder: "Frequency (e.g. Twice daily)" },
                        { field: "duration", placeholder: "Duration (e.g. 7 days)" },
                        { field: "instructions", placeholder: "Instructions (e.g. After meals)", fullWidth: true },
                      ].map(({ field, placeholder, fullWidth }) => (
                        <input
                          key={field}
                          value={(m as any)[field]}
                          onChange={(e) => handleMedicineChange(idx, field, e.target.value)}
                          placeholder={placeholder}
                          className={`bg-[#051650]/40 border border-[#2D2755] rounded-lg px-3 py-2 text-white placeholder-[#6B7280] text-sm focus:outline-none focus:border-[#4F83FF] ${fullWidth ? "col-span-2" : ""}`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[#D1D5DB] text-xs mb-1 block">Attach Prescription Scan (Optional Image for AI Vision)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPrescFile(e.target.files?.[0] || null)}
                  className="w-full bg-[#051650]/30 border border-[#2D2755] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#4F83FF] text-xs"
                />
              </div>
              <div className="flex gap-3 pt-4 border-t border-[#2D2755]">
                <button
                  onClick={handleCreatePrescription}
                  disabled={createPrescription.isPending}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                >
                  {createPrescription.isPending ? "Creating..." : "Save Rx & Send to Pharmacy"}
                </button>
                <button onClick={() => setPrescModal(null)} className="px-6 py-2.5 bg-[#051650]/30 text-[#D1D5DB] rounded-xl hover:bg-[#051650]/50 border border-[#2D2755] transition-all">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Medical Record Modal */}
      {recordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#131e3a] border border-[#2D2755] rounded-2xl w-full max-w-lg shadow-2xl animate-slide-in">
            <div className="flex items-center justify-between p-6 border-b border-[#2D2755]">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">Add Medical Record — {recordModal.patientName}</h2>
              <button onClick={() => setRecordModal(null)} className="text-[#D1D5DB] hover:text-white p-1 hover:bg-[#051650]/40 rounded-lg"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleCreateRecord} className="p-6 space-y-4">
              <div>
                <label className="text-[#D1D5DB] text-xs mb-1 block">Record Type</label>
                <select
                  value={recordForm.record_type}
                  onChange={(e) => setRecordForm({ ...recordForm, record_type: e.target.value })}
                  className="w-full bg-[#051650]/30 border border-[#2D2755] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#4F83FF]"
                >
                  <option value="consultation" className="bg-[#131e3a]">Consultation Notes</option>
                  <option value="surgery" className="bg-[#131e3a]">Surgery Summary</option>
                  <option value="vaccination" className="bg-[#131e3a]">Vaccination Record</option>
                </select>
              </div>
              <div>
                <label className="text-[#D1D5DB] text-xs mb-1 block">Record Title *</label>
                <input
                  required
                  value={recordForm.title}
                  onChange={(e) => setRecordForm({ ...recordForm, title: e.target.value })}
                  placeholder="e.g. Cardiovascular Evaluation"
                  className="w-full bg-[#051650]/30 border border-[#2D2755] rounded-lg px-3 py-2 text-white placeholder-[#6B7280] text-sm focus:outline-none focus:border-[#4F83FF]"
                />
              </div>
              <div>
                <label className="text-[#D1D5DB] text-xs mb-1 block">Record Date</label>
                <input
                  type="date"
                  value={recordForm.record_date}
                  onChange={(e) => setRecordForm({ ...recordForm, record_date: e.target.value })}
                  className="w-full bg-[#051650]/30 border border-[#2D2755] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#4F83FF]"
                />
              </div>
              <div>
                <label className="text-[#D1D5DB] text-xs mb-1 block">Clinical Summary / Details</label>
                <textarea
                  value={recordForm.description}
                  onChange={(e) => setRecordForm({ ...recordForm, description: e.target.value })}
                  placeholder="Enter detailed consultation notes, history, or post-operative observations..."
                  rows={4}
                  className="w-full bg-[#051650]/30 border border-[#2D2755] rounded-lg px-3 py-2 text-white placeholder-[#6B7280] text-sm focus:outline-none focus:border-[#4F83FF] resize-none"
                />
              </div>
              <div className="flex gap-3 pt-4 border-t border-[#2D2755]">
                <button
                  type="submit"
                  disabled={createMedicalRecord.isPending}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {createMedicalRecord.isPending ? "Saving..." : "Add to Medical Records"}
                </button>
                <button type="button" onClick={() => setRecordModal(null)} className="px-6 py-2.5 bg-[#051650]/30 text-[#D1D5DB] rounded-xl hover:bg-[#051650]/50 border border-[#2D2755] transition-all">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lab Report Modal */}
      {labModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#131e3a] border border-[#2D2755] rounded-2xl w-full max-w-lg shadow-2xl animate-slide-in">
            <div className="flex items-center justify-between p-6 border-b border-[#2D2755]">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">Upload Lab Report — {labModal.patientName}</h2>
              <button onClick={() => setLabModal(null)} className="text-[#D1D5DB] hover:text-white p-1 hover:bg-[#051650]/40 rounded-lg"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleCreateLabReport} className="p-6 space-y-4">
              <div>
                <label className="text-[#D1D5DB] text-xs mb-1 block">Report Name *</label>
                <input
                  required
                  value={labForm.report_name}
                  onChange={(e) => setLabForm({ ...labForm, report_name: e.target.value })}
                  placeholder="e.g. Lipid Profile Panel"
                  className="w-full bg-[#051650]/30 border border-[#2D2755] rounded-lg px-3 py-2 text-white placeholder-[#6B7280] text-sm focus:outline-none focus:border-[#4F83FF]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#D1D5DB] text-xs mb-1 block">Report Type</label>
                  <select
                    value={labForm.report_type}
                    onChange={(e) => setLabForm({ ...labForm, report_type: e.target.value })}
                    className="w-full bg-[#051650]/30 border border-[#2D2755] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#4F83FF] text-sm"
                  >
                    <option value="blood_test" className="bg-[#131e3a]">Blood Test</option>
                    <option value="ecg" className="bg-[#131e3a]">ECG / EKG</option>
                    <option value="xray" className="bg-[#131e3a]">X-Ray</option>
                    <option value="mri" className="bg-[#131e3a]">MRI / CT Scan</option>
                    <option value="lipid" className="bg-[#131e3a]">Lipid Panel</option>
                    <option value="urine" className="bg-[#131e3a]">Urinalysis</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#D1D5DB] text-xs mb-1 block">Priority</label>
                  <select
                    value={labForm.priority}
                    onChange={(e) => setLabForm({ ...labForm, priority: e.target.value })}
                    className="w-full bg-[#051650]/30 border border-[#2D2755] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#4F83FF] text-sm"
                  >
                    <option value="low" className="bg-[#131e3a]">Low</option>
                    <option value="normal" className="bg-[#131e3a]">Normal</option>
                    <option value="high" className="bg-[#131e3a]">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[#D1D5DB] text-xs mb-1 block">Diagnostic Notes</label>
                <textarea
                  value={labForm.notes}
                  onChange={(e) => setLabForm({ ...labForm, notes: e.target.value })}
                  placeholder="Notes for diagnosis, reference ranges, or comments..."
                  rows={2}
                  className="w-full bg-[#051650]/30 border border-[#2D2755] rounded-lg px-3 py-2 text-white placeholder-[#6B7280] text-sm focus:outline-none focus:border-[#4F83FF] resize-none"
                />
              </div>
              <div>
                <label className="text-[#D1D5DB] text-xs mb-1 block">Attach Report Document (Image / PDF)</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full bg-[#051650]/30 border border-[#2D2755] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#4F83FF] text-xs"
                />
              </div>
              <div className="flex gap-3 pt-4 border-t border-[#2D2755]">
                <button
                  type="submit"
                  disabled={createLabReport.isPending || isUploading}
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  {isUploading ? "Uploading file..." : "Save & Publish Report"}
                </button>
                <button type="button" onClick={() => setLabModal(null)} className="px-6 py-2.5 bg-[#051650]/30 text-[#D1D5DB] rounded-xl hover:bg-[#051650]/50 border border-[#2D2755] transition-all">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Appointment Modal */}
      {apptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#131e3a] border border-[#2D2755] rounded-2xl w-full max-w-lg shadow-2xl animate-slide-in">
            <div className="flex items-center justify-between p-6 border-b border-[#2D2755]">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">Schedule Appointment — {apptModal.patientName}</h2>
              <button onClick={() => setApptModal(null)} className="text-[#D1D5DB] hover:text-white p-1 hover:bg-[#051650]/40 rounded-lg"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleCreateAppointment} className="p-6 space-y-4">
              <div>
                <label className="text-[#D1D5DB] text-xs mb-1 block">Appointment Date *</label>
                <input
                  required
                  type="date"
                  value={apptForm.appointment_date}
                  onChange={(e) => setApptForm({ ...apptForm, appointment_date: e.target.value })}
                  className="w-full bg-[#051650]/30 border border-[#2D2755] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#4F83FF] text-sm"
                />
              </div>
              <div>
                <label className="text-[#D1D5DB] text-xs mb-1 block">Appointment Time *</label>
                <input
                  required
                  type="time"
                  value={apptForm.appointment_time}
                  onChange={(e) => setApptForm({ ...apptForm, appointment_time: e.target.value })}
                  className="w-full bg-[#051650]/30 border border-[#2D2755] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#4F83FF] text-sm"
                />
              </div>
              <div>
                <label className="text-[#D1D5DB] text-xs mb-1 block">Appointment Type</label>
                <select
                  value={apptForm.appointment_type}
                  onChange={(e) => setApptForm({ ...apptForm, appointment_type: e.target.value })}
                  className="w-full bg-[#051650]/30 border border-[#2D2755] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#4F83FF] text-sm"
                >
                  <option value="consultation" className="bg-[#131e3a]">Consultation</option>
                  <option value="follow-up" className="bg-[#131e3a]">Follow-up</option>
                  <option value="check-up" className="bg-[#131e3a]">Routine Check-up</option>
                  <option value="emergency" className="bg-[#131e3a]">Emergency</option>
                </select>
              </div>
              <div>
                <label className="text-[#D1D5DB] text-xs mb-1 block">Clinical Notes</label>
                <textarea
                  value={apptForm.notes}
                  onChange={(e) => setApptForm({ ...apptForm, notes: e.target.value })}
                  placeholder="Reason for appointment, diagnostic pre-requisites..."
                  rows={3}
                  className="w-full bg-[#051650]/30 border border-[#2D2755] rounded-lg px-3 py-2 text-white placeholder-[#6B7280] text-sm focus:outline-none focus:border-[#4F83FF] resize-none"
                />
              </div>
              <div className="flex gap-3 pt-4 border-t border-[#2D2755]">
                <button
                  type="submit"
                  disabled={createAppointment.isPending}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                >
                  {createAppointment.isPending ? "Scheduling..." : "Schedule Appointment"}
                </button>
                <button type="button" onClick={() => setApptModal(null)} className="px-6 py-2.5 bg-[#051650]/30 text-[#D1D5DB] rounded-xl hover:bg-[#051650]/50 border border-[#2D2755] transition-all">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
