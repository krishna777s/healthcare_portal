import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BedDouble, User, Clock, Plus, X, FileText, Activity, Edit } from "lucide-react";
import { useInpatients, useCreatePrescription, useCreateMedicalRecord, useCreateLabReport, useUploadLabReportFile, useDoctorUpdatePatient } from "@/hooks/useDoctorData";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function Inpatients() {
  const { data: admissions = [], isLoading } = useInpatients();
  const createPrescription = useCreatePrescription();
  const createMedicalRecord = useCreateMedicalRecord();
  const createLabReport = useCreateLabReport();
  const uploadLabReportFile = useUploadLabReportFile();

  // Modal States
  const [prescModal, setPrescModal] = useState<{ open: boolean; patientId: string; patientName: string } | null>(null);
  const [recordModal, setRecordModal] = useState<{ open: boolean; patientId: string; patientName: string } | null>(null);
  const [labModal, setLabModal] = useState<{ open: boolean; patientId: string; patientName: string } | null>(null);

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
  const [editModal, setEditModal] = useState<{ open: boolean; patient: any } | null>(null);
  const [editForm, setEditForm] = useState({
    current_condition: "",
    status: "stable",
    gender: "male",
    blood_group: "",
    phone: "",
    date_of_birth: "",
  });
  const updatePatient = useDoctorUpdatePatient();
  const { toast } = useToast();

  const handleAddMedicine = () =>
    setMedicines([...medicines, { medicine_name: "", dosage: "", frequency: "", duration: "", instructions: "" }]);

  const handleMedicineChange = (idx: number, field: string, value: string) =>
    setMedicines(medicines.map((m, i) => (i === idx ? { ...m, [field]: value } : m)));

  const handleCreatePrescription = async () => {
    if (!prescModal) return;
    await createPrescription.mutateAsync({
      patient_id: prescModal.patientId,
      diagnosis,
      notes,
      items: medicines.filter((m) => m.medicine_name),
    });
    setPrescModal(null);
    setMedicines([{ medicine_name: "", dosage: "", frequency: "", duration: "", instructions: "" }]);
    setDiagnosis("");
    setNotes("");
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
      setRecordModal(null);
      setRecordForm({
        record_type: "consultation",
        title: "",
        description: "",
        record_date: new Date().toISOString().split("T")[0],
      });
    } catch (err) {
      console.error(err);
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

      setLabModal(null);
      setLabForm({
        report_name: "",
        report_type: "blood_test",
        priority: "normal",
        notes: "",
      });
      setSelectedFile(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal) return;
    try {
      await updatePatient.mutateAsync({
        patientId: editModal.patient.patient_id,
        data: editForm,
      });
      toast({
        title: "Success",
        description: "Patient Details Updated Successfully!",
      });
      setEditModal(null);
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: err.response?.data?.detail || "Failed to update patient details",
        variant: "destructive"
      });
    }
  };
  return (
    <div className="p-6 space-y-6 animate-fade-in bg-[#131e3a] text-white min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
          <BedDouble className="h-8 w-8 text-[#4F83FF]" /> Inpatients
        </h1>
        <p className="text-[#D1D5DB]">Patients currently admitted to hospital wards under your care</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-yellow-500/30 bg-yellow-500/10 backdrop-blur-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-yellow-300 text-sm">Total Admitted</p>
              <p className="text-3xl font-bold text-yellow-400">{admissions.length}</p>
            </div>
            <BedDouble className="h-10 w-10 text-yellow-400 opacity-50" />
          </CardContent>
        </Card>
        <Card className="border-blue-500/30 bg-blue-500/10 backdrop-blur-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-blue-300 text-sm">Avg. Days Admitted</p>
              <p className="text-3xl font-bold text-blue-400">
                {admissions.length > 0
                  ? Math.round(admissions.reduce((acc: number, a: any) => acc + (a.days_admitted || 0), 0) / admissions.length)
                  : 0}
              </p>
            </div>
            <Clock className="h-10 w-10 text-blue-400 opacity-50" />
          </CardContent>
        </Card>
        <Card className="border-green-500/30 bg-green-500/10 backdrop-blur-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-green-300 text-sm">Ready for Discharge</p>
              <p className="text-3xl font-bold text-green-400">
                {admissions.filter((a: any) => (a.days_admitted || 0) > 5).length}
              </p>
            </div>
            <User className="h-10 w-10 text-green-400 opacity-50" />
          </CardContent>
        </Card>
      </div>

      <Card className="border-[#2D2755] bg-[#051650]/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BedDouble className="h-5 w-5 text-emerald-400" /> Admitted Patients Registry ({admissions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 bg-[#1e2d4d] rounded-lg" />)}
            </div>
          ) : admissions.length === 0 ? (
            <div className="text-center py-10 text-[#D1D5DB]">
              <p className="font-semibold text-lg text-white">No Inpatients Admitted</p>
              <p className="text-sm mt-1">There are no active ward admissions assigned to your profile.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2D2755]">
                    {["Patient", "Ward", "Bed", "Admitted On", "Days", "Diagnosis", "Clinical Actions"].map((h) => (
                      <th key={h} className="text-left py-3 px-4 text-[#D1D5DB] font-medium text-sm">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {admissions.map((a: any) => (
                    <tr key={a.id} className="border-b border-[#2D2755]/50 hover:bg-[#051650]/20 transition-colors">
                      <td className="py-4 px-4 text-white font-semibold flex items-center gap-2">
                        <User className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                        {a.patient_name}
                      </td>
                      <td className="py-4 px-4 text-[#D1D5DB] text-sm whitespace-nowrap">{a.ward || "—"}</td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-bold border border-yellow-500/30 whitespace-nowrap">
                          {a.bed_number || "—"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-[#D1D5DB] text-sm">{a.admission_date}</td>
                      <td className="py-4 px-4">
                        <span className={`font-bold ${(a.days_admitted || 0) > 7 ? "text-red-400" : "text-yellow-400"}`}>
                          {a.days_admitted ?? 0} days
                        </span>
                      </td>
                      <td className="py-4 px-4 text-[#D1D5DB] text-sm max-w-[150px] truncate">{a.diagnosis || "—"}</td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            onClick={() => setPrescModal({ open: true, patientId: a.patient_id, patientName: a.patient_name })}
                            disabled={!a.patient_id}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 rounded-lg transition-colors font-medium border border-blue-500/20 disabled:opacity-50"
                          >
                            <Plus className="h-3.5 w-3.5" /> Rx
                          </button>
                          <button
                            onClick={() => setRecordModal({ open: true, patientId: a.patient_id, patientName: a.patient_name })}
                            disabled={!a.patient_id}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 rounded-lg transition-colors font-medium border border-emerald-500/20 disabled:opacity-50"
                          >
                            <FileText className="h-3.5 w-3.5" /> Record
                          </button>
                          <button
                            onClick={() => setLabModal({ open: true, patientId: a.patient_id, patientName: a.patient_name })}
                            disabled={!a.patient_id}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 rounded-lg transition-colors font-medium border border-amber-500/20 disabled:opacity-50"
                          >
                            <Activity className="h-3.5 w-3.5" /> Lab Report
                          </button>
                          <button
                            onClick={() => {
                              setEditModal({ open: true, patient: a });
                              setEditForm({
                                current_condition: a.current_condition || "",
                                status: a.status || "stable",
                                gender: a.gender || "male",
                                blood_group: a.blood_group || "",
                                phone: a.phone || "",
                                date_of_birth: a.date_of_birth || "",
                              });
                            }}
                            disabled={!a.patient_id}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs bg-violet-600/20 hover:bg-violet-600/40 text-violet-300 rounded-lg transition-colors font-medium border border-violet-500/20 disabled:opacity-50"
                            title="Edit Patient Details"
                          >
                            <Edit className="h-3.5 w-3.5" /> Edit
                          </button>
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
                  placeholder="e.g. Inpatient Ward Treatment"
                  className="w-full bg-[#051650]/30 border border-[#2D2755] rounded-lg px-3 py-2 text-white placeholder-[#6B7280] text-sm focus:outline-none focus:border-[#4F83FF]"
                />
              </div>
              <div>
                <label className="text-[#D1D5DB] text-xs mb-1 block">Clinical Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional instructions..."
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
                        { field: "dosage", placeholder: "Dosage" },
                        { field: "frequency", placeholder: "Frequency" },
                        { field: "duration", placeholder: "Duration" },
                        { field: "instructions", placeholder: "Instructions", fullWidth: true },
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
                  placeholder="e.g. Ward Consultation Progress"
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
                  placeholder="Clinical updates for this inpatient stay..."
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
                  placeholder="e.g. Chest X-Ray scan"
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
                  placeholder="Notes for diagnosis..."
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
      {/* Edit Patient Modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#131e3a] border border-[#2D2755] rounded-2xl w-full max-w-lg shadow-2xl animate-slide-in">
            <div className="flex items-center justify-between p-6 border-b border-[#2D2755]">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Edit className="h-5 w-5 text-indigo-400" /> Edit Details — {editModal.patient.patient_name}
              </h2>
              <button onClick={() => setEditModal(null)} className="text-[#D1D5DB] hover:text-white p-1 hover:bg-[#051650]/40 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleUpdatePatient} className="p-6 space-y-4">
              <div>
                <label className="text-[#D1D5DB] text-xs mb-1 block">Current Condition</label>
                <input
                  value={editForm.current_condition}
                  onChange={(e) => setEditForm({ ...editForm, current_condition: e.target.value })}
                  placeholder="e.g. Type 2 Diabetes"
                  className="w-full bg-[#051650]/30 border border-[#2D2755] rounded-lg px-3 py-2 text-white placeholder-[#6B7280] text-sm focus:outline-none focus:border-[#4F83FF]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#D1D5DB] text-xs mb-1 block">Patient Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full bg-[#051650]/30 border border-[#2D2755] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#4F83FF] text-sm"
                  >
                    <option value="stable" className="bg-[#131e3a]">Stable</option>
                    <option value="improving" className="bg-[#131e3a]">Improving</option>
                    <option value="under_review" className="bg-[#131e3a]">Under Review</option>
                    <option value="critical" className="bg-[#131e3a]">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#D1D5DB] text-xs mb-1 block">Blood Group</label>
                  <input
                    value={editForm.blood_group}
                    onChange={(e) => setEditForm({ ...editForm, blood_group: e.target.value })}
                    placeholder="e.g. O+, A-"
                    className="w-full bg-[#051650]/30 border border-[#2D2755] rounded-lg px-3 py-2 text-white placeholder-[#6B7280] text-sm focus:outline-none focus:border-[#4F83FF]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#D1D5DB] text-xs mb-1 block">Gender</label>
                  <select
                    value={editForm.gender}
                    onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                    className="w-full bg-[#051650]/30 border border-[#2D2755] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#4F83FF] text-sm"
                  >
                    <option value="male" className="bg-[#131e3a]">Male</option>
                    <option value="female" className="bg-[#131e3a]">Female</option>
                    <option value="other" className="bg-[#131e3a]">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#D1D5DB] text-xs mb-1 block">Date of Birth</label>
                  <input
                    type="date"
                    value={editForm.date_of_birth}
                    onChange={(e) => setEditForm({ ...editForm, date_of_birth: e.target.value })}
                    className="w-full bg-[#051650]/30 border border-[#2D2755] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#4F83FF] text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-[#D1D5DB] text-xs mb-1 block">Phone Number</label>
                <input
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="e.g. +91-9000000001"
                  className="w-full bg-[#051650]/30 border border-[#2D2755] rounded-lg px-3 py-2 text-white placeholder-[#6B7280] text-sm focus:outline-none focus:border-[#4F83FF]"
                />
              </div>
              <div className="flex gap-3 pt-4 border-t border-[#2D2755]">
                <button
                  type="submit"
                  disabled={updatePatient.isPending}
                  className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-violet-500/20 disabled:opacity-50"
                >
                  {updatePatient.isPending ? "Saving..." : "Save Changes"}
                </button>
                <button type="button" onClick={() => setEditModal(null)} className="px-6 py-2.5 bg-[#051650]/30 text-[#D1D5DB] rounded-xl hover:bg-[#051650]/50 border border-[#2D2755] transition-all">
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
