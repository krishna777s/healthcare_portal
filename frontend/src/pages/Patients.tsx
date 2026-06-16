import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, User, Plus, X, Edit, CheckSquare, Square, Check, AlertCircle, Calendar, History } from "lucide-react";
import {
  useAdminPatients,
  useAdminDoctors,
  useCreatePatient,
  useUpdatePatient,
  useBulkAssignPatients,
  useAdminCreateAppointment,
} from "@/hooks/useAdminData";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const formatDoctorName = (name: string) => {
  if (!name) return "";
  const trimmed = name.trim();
  if (trimmed.toLowerCase().startsWith("dr.")) {
    return trimmed;
  }
  return `Dr. ${trimmed}`;
};

const statusColor: Record<string, string> = {
  stable: "bg-green-500/20 text-green-400 border border-green-500/30",
  improving: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  under_review: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  critical: "bg-red-500/20 text-red-400 border border-red-500/30",
};

const typeColor: Record<string, string> = {
  outpatient: "bg-blue-500/10 text-blue-300 border border-blue-500/20",
  inpatient: "bg-amber-500/10 text-amber-300 border border-amber-500/20",
  icu: "bg-red-500/10 text-red-300 border border-red-500/20",
};

export default function Patients() {
  const { data: patients = [], isLoading, refetch } = useAdminPatients();
  const { data: doctors = [] } = useAdminDoctors();

  const createPatient = useCreatePatient();
  const updatePatient = useUpdatePatient();
  const bulkAssign = useBulkAssignPatients();
  const createAppointment = useAdminCreateAppointment();
  const { toast } = useToast();

  // Selection state for bulk assign
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDoctorId, setBulkDoctorId] = useState("");

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalPatient, setEditModalPatient] = useState<any | null>(null);
  const [apptModal, setApptModal] = useState<{ open: boolean; patientId: string; patientName: string; doctorId: string } | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    date_of_birth: "",
    gender: "male",
    blood_group: "",
    phone: "",
    patient_type: "outpatient",
    current_condition: "",
    assigned_doctor_id: "",
    ward: "",
    bed_number: "",
  });

  const [editFormData, setEditFormData] = useState({
    full_name: "",
    date_of_birth: "",
    gender: "male",
    blood_group: "",
    phone: "",
    patient_type: "outpatient",
    current_condition: "",
    status: "under_review",
    assigned_doctor_id: "",
    ward: "",
    bed_number: "",
  });

  const [apptForm, setApptForm] = useState({
    appointment_date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    appointment_time: "10:00",
    appointment_type: "follow-up",
    notes: "",
    doctor_id: ""
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(patients.map((p: any) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((x) => x !== id));
    }
  };

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPatient.mutateAsync({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        date_of_birth: formData.date_of_birth || null,
        gender: formData.gender,
        blood_group: formData.blood_group || null,
        phone: formData.phone || null,
        patient_type: formData.patient_type,
        current_condition: formData.current_condition || null,
        assigned_doctor_id: formData.assigned_doctor_id || null,
        ward: formData.ward || null,
        bed_number: formData.bed_number || null,
      });
      toast({
        title: "Success",
        description: "Patient Registered Successfully!",
      });
      setAddModalOpen(false);
      // Reset form
      setFormData({
        email: "",
        password: "",
        full_name: "",
        date_of_birth: "",
        gender: "male",
        blood_group: "",
        phone: "",
        patient_type: "outpatient",
        current_condition: "",
        assigned_doctor_id: "",
        ward: "",
        bed_number: "",
      });
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: err.response?.data?.detail || "Failed to register patient",
        variant: "destructive"
      });
    }
  };

  const handleEditClick = (patient: any) => {
    setEditModalPatient(patient);
    setEditFormData({
      full_name: patient.full_name || "",
      date_of_birth: patient.date_of_birth || "",
      gender: patient.gender || "male",
      blood_group: patient.blood_group || "",
      phone: patient.phone || "",
      patient_type: patient.patient_type || "outpatient",
      current_condition: patient.current_condition || "",
      status: patient.status || "under_review",
      assigned_doctor_id: doctors.find((d: any) => d.full_name === patient.assigned_doctor_name)?.id || "",
      ward: patient.ward || "",
      bed_number: patient.bed_number || "",
    });
  };

  const handleUpdatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalPatient) return;
    try {
      await updatePatient.mutateAsync({
        id: editModalPatient.id,
        data: {
          full_name: editFormData.full_name,
          date_of_birth: editFormData.date_of_birth || null,
          gender: editFormData.gender,
          blood_group: editFormData.blood_group || null,
          phone: editFormData.phone || null,
          patient_type: editFormData.patient_type,
          current_condition: editFormData.current_condition || null,
          status: editFormData.status,
          assigned_doctor_id: editFormData.assigned_doctor_id || null,
          ward: editFormData.ward || null,
          bed_number: editFormData.bed_number || null,
        },
      });
      toast({
        title: "Success",
        description: "Patient Details Updated Successfully!",
      });
      setEditModalPatient(null);
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: err.response?.data?.detail || "Failed to update patient details",
        variant: "destructive"
      });
    }
  };

  const handleBulkAssign = async () => {
    if (!bulkDoctorId || selectedIds.length === 0) return;
    try {
      await bulkAssign.mutateAsync({
        patient_ids: selectedIds,
        doctor_id: bulkDoctorId,
      });
      toast({
        title: "Success",
        description: "Patients Assigned to Doctor Successfully!",
      });
      setSelectedIds([]);
      setBulkDoctorId("");
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: err.response?.data?.detail || "Failed to assign patients",
        variant: "destructive"
      });
    }
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apptModal) return;
    try {
      const selectedDocId = apptForm.doctor_id || apptModal.doctorId;
      if (!selectedDocId) {
        toast({
          title: "Validation Error",
          description: "Please select or assign a doctor for this patient.",
          variant: "destructive"
        });
        return;
      }
      await createAppointment.mutateAsync({
        patient_id: apptModal.patientId,
        doctor_id: selectedDocId,
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
        notes: "",
        doctor_id: ""
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
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            <Users className="h-8 w-8 text-[#4F83FF]" /> All Patients
          </h1>
          <p className="text-[#D1D5DB]">Register new patients, view active cases, and assign doctors in bulk</p>
        </div>
        <div className="flex-shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/20 whitespace-nowrap"
          >
            <Plus className="h-5 w-5" /> Add Patient
          </button>
        </div>
      </div>

      {/* Bulk Assignment Control Banner */}
      {selectedIds.length > 0 && (
        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-in">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-blue-400" />
            <span className="font-semibold text-white">
              {selectedIds.length} patient{selectedIds.length > 1 ? "s" : ""} selected
            </span>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={bulkDoctorId}
              onChange={(e) => setBulkDoctorId(e.target.value)}
              className="bg-[#051650]/40 border border-[#2D2755] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#4F83FF]"
            >
              <option value="" className="bg-[#131e3a] text-white">
                -- Choose Doctor --
              </option>
              {doctors.map((d: any) => (
                <option key={d.id} value={d.id} className="bg-[#131e3a] text-white">
                  {formatDoctorName(d.full_name)} ({d.specialization})
                </option>
              ))}
            </select>
            <button
              onClick={handleBulkAssign}
              disabled={!bulkDoctorId || bulkAssign.isPending}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition-all"
            >
              {bulkAssign.isPending ? "Assigning..." : "Assign to Doctor"}
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="p-2 text-[#D1D5DB] hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Patients Table Card */}
      <Card className="border-[#2D2755] bg-[#051650]/10 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b border-[#2D2755] pb-4">
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-400" /> Patient Registry ({patients.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-xl bg-[#1e2d4d]" />
              ))}
            </div>
          ) : patients.length === 0 ? (
            <div className="text-center py-12 text-[#D1D5DB]">
              <Users className="h-12 w-12 mx-auto text-[#2D2755] mb-3" />
              <p className="font-semibold text-lg text-white">No Patients Registered</p>
              <p className="text-sm text-[#D1D5DB] mt-1">Use the "Add Patient" button above to add new records.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#2D2755] pb-2 text-[#D1D5DB] font-medium text-sm">
                    <th className="py-3 px-4 w-12 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === patients.length && patients.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-[#051650]/50"
                      />
                    </th>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Gender</th>
                    <th className="py-3 px-4">Blood</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Condition</th>
                    <th className="py-3 px-4">Assigned Doctor</th>
                    <th className="py-3 px-4">Last Visit</th>
                    <th className="py-3 px-4">Next Appt</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2D2755]/30">
                  {patients.map((p: any) => {
                    const isChecked = selectedIds.includes(p.id);
                    return (
                      <tr
                        key={p.id}
                        className={`hover:bg-[#051650]/20 transition-all ${
                          isChecked ? "bg-[#4F83FF]/5" : ""
                        }`}
                      >
                        <td className="py-4 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => handleSelectOne(p.id, e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-[#051650]/50"
                          />
                        </td>
                        <td className="py-4 px-4 font-semibold text-white flex items-center gap-2 mt-1">
                          <User className="h-4 w-4 text-[#4F83FF] flex-shrink-0" />
                          {p.full_name}
                        </td>
                        <td className="py-4 px-4 text-[#D1D5DB] capitalize text-sm">{p.gender || "—"}</td>
                        <td className="py-4 px-4 text-[#D1D5DB] text-sm">{p.blood_group || "—"}</td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${typeColor[p.patient_type] || "text-[#D1D5DB]"}`}>
                            {p.patient_type}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-[#D1D5DB] text-sm max-w-[120px] truncate">
                          {p.current_condition || "—"}
                        </td>
                        <td className="py-4 px-4 text-[#D1D5DB] text-sm">
                          {p.assigned_doctor_name ? (
                            <span className="text-white font-medium">{formatDoctorName(p.assigned_doctor_name)}</span>
                          ) : (
                            <span className="text-[#9CA3AF] italic">Unassigned</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-[#D1D5DB] text-xs">{p.last_visit || "—"}</td>
                        <td className="py-4 px-4 text-[#D1D5DB] text-xs">{p.next_appointment || "—"}</td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${statusColor[p.status] || "bg-gray-500/20 text-gray-400"}`}>
                            {p.status?.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() => handleEditClick(p)}
                            className="p-1.5 bg-[#4F83FF]/15 hover:bg-[#4F83FF]/30 text-[#4F83FF] rounded-lg transition-all"
                            title="Edit Patient Details"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              const docId = doctors.find((d: any) => d.full_name === p.assigned_doctor_name)?.id || "";
                              setApptModal({ open: true, patientId: p.id, patientName: p.full_name, doctorId: docId });
                              setApptForm(prev => ({ ...prev, doctor_id: docId }));
                            }}
                            className="p-1.5 bg-indigo-600/15 hover:bg-indigo-600/30 text-indigo-400 rounded-lg transition-all ml-1.5"
                            title="Schedule Appointment"
                          >
                            <Calendar className="h-4 w-4" />
                          </button>
                          <Link
                            to={`/dashboard/patient-history?patientId=${p.id}`}
                            className="inline-block p-1.5 bg-violet-600/15 hover:bg-violet-600/30 text-violet-400 rounded-lg transition-all ml-1.5 align-middle"
                            title="View Patient History"
                          >
                            <History className="h-4 w-4" />
                          </Link>
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

      {/* Add Patient Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#131e3a] border border-[#2D2755] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-in shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-[#2D2755]">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Plus className="h-5 w-5 text-blue-400" /> Add New Patient Record
              </h2>
              <button
                onClick={() => setAddModalOpen(false)}
                className="text-[#D1D5DB] hover:text-white p-1 hover:bg-[#051650]/40 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreatePatient} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Credentials */}
                <div className="col-span-2 p-3 bg-blue-500/5 rounded-xl border border-blue-500/10 space-y-3">
                  <p className="text-xs text-blue-400 font-semibold uppercase tracking-wider">Patient Login Credentials</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[#D1D5DB] text-xs mb-1 block">Email address *</label>
                      <input
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="patient@example.com"
                        className="w-full bg-[#051650]/30 border border-[#2D2755] rounded-lg px-3 py-2 text-white placeholder-[#6B7280] text-sm focus:outline-none focus:border-[#4F83FF]"
                      />
                    </div>
                    <div>
                      <label className="text-[#D1D5DB] text-xs mb-1 block">Password *</label>
                      <input
                        required
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="••••••••"
                        className="w-full bg-[#051650]/30 border border-[#2D2755] rounded-lg px-3 py-2 text-white placeholder-[#6B7280] text-sm focus:outline-none focus:border-[#4F83FF]"
                      />
                    </div>
                  </div>
                </div>

                {/* Profile details */}
                <div>
                  <label className="text-[#D1D5DB] text-xs mb-1 block">Full Name *</label>
                  <input
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full bg-[#051650]/30 border border-[#2D2755] rounded-lg px-3 py-2 text-white placeholder-[#6B7280] text-sm focus:outline-none focus:border-[#4F83FF]"
                  />
                </div>
                <div>
                  <label className="text-[#D1D5DB] text-xs mb-1 block">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    className="w-full bg-[#051650]/30 border border-[#2D2755] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#4F83FF]"
                  />
                </div>
                <div>
                  <label className="text-[#D1D5DB] text-xs mb-1 block">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full bg-[#051650]/30 border border-[#2D2755] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#4F83FF]"
                  >
                    <option value="male" className="bg-[#131e3a]">Male</option>
                    <option value="female" className="bg-[#131e3a]">Female</option>
                    <option value="other" className="bg-[#131e3a]">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#D1D5DB] text-xs mb-1 block">Blood Group</label>
                  <select
                    value={formData.blood_group}
                    onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                    className="w-full bg-[#051650]/30 border border-[#2D2755] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#4F83FF]"
                  >
                    <option value="" className="bg-[#131e3a]">Unknown</option>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                      <option key={bg} value={bg} className="bg-[#131e3a]">{bg}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[#D1D5DB] text-xs mb-1 block">Phone Number</label>
                  <input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                    className="w-full bg-[#051650]/30 border border-[#2D2755] rounded-lg px-3 py-2 text-white placeholder-[#6B7280] text-sm focus:outline-none focus:border-[#4F83FF]"
                  />
                </div>
                <div>
                  <label className="text-[#D1D5DB] text-xs mb-1 block">Patient Type</label>
                  <select
                    value={formData.patient_type}
                    onChange={(e) => setFormData({ ...formData, patient_type: e.target.value, ward: e.target.value === "inpatient" ? "General Ward B" : "", bed_number: e.target.value === "inpatient" ? "B-102" : e.target.value === "icu" ? "ICU-A1" : "" })}
                    className="w-full bg-[#051650]/30 border border-[#2D2755] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#4F83FF]"
                  >
                    <option value="outpatient" className="bg-[#131e3a]">Outpatient (Consultation)</option>
                    <option value="inpatient" className="bg-[#131e3a]">Inpatient (Admitted to Ward)</option>
                    <option value="icu" className="bg-[#131e3a]">ICU (Intensive Care)</option>
                  </select>
                </div>
                {formData.patient_type === "inpatient" && (
                  <>
                    <div>
                      <label className="text-[#D1D5DB] text-xs mb-1 block">Ward Name</label>
                      <input
                        value={formData.ward}
                        onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                        placeholder="e.g. General Ward B"
                        className="w-full bg-[#051650]/30 border border-[#2D2755] rounded-lg px-3 py-2 text-white placeholder-[#6B7280] text-sm focus:outline-none focus:border-[#4F83FF]"
                      />
                    </div>
                    <div>
                      <label className="text-[#D1D5DB] text-xs mb-1 block">Bed Number</label>
                      <input
                        value={formData.bed_number}
                        onChange={(e) => setFormData({ ...formData, bed_number: e.target.value })}
                        placeholder="e.g. B-102"
                        className="w-full bg-[#051650]/30 border border-[#2D2755] rounded-lg px-3 py-2 text-white placeholder-[#6B7280] text-sm focus:outline-none focus:border-[#4F83FF]"
                      />
                    </div>
                  </>
                )}
                {formData.patient_type === "icu" && (
                  <div>
                    <label className="text-[#D1D5DB] text-xs mb-1 block">ICU Bed Number</label>
                    <input
                      value={formData.bed_number}
                      onChange={(e) => setFormData({ ...formData, bed_number: e.target.value })}
                      placeholder="e.g. ICU-A1"
                      className="w-full bg-[#051650]/30 border border-[#2D2755] rounded-lg px-3 py-2 text-white placeholder-[#6B7280] text-sm focus:outline-none focus:border-[#4F83FF]"
                    />
                  </div>
                )}
                <div>
                  <label className="text-[#D1D5DB] text-xs mb-1 block">Current Medical Condition</label>
                  <input
                    value={formData.current_condition}
                    onChange={(e) => setFormData({ ...formData, current_condition: e.target.value })}
                    placeholder="e.g. Stage 1 Hypertension"
                    className="w-full bg-[#051650]/30 border border-[#2D2755] rounded-lg px-3 py-2 text-white placeholder-[#6B7280] text-sm focus:outline-none focus:border-[#4F83FF]"
                  />
                </div>
                <div>
                  <label className="text-[#D1D5DB] text-xs mb-1 block">Assign Doctor</label>
                  <select
                    value={formData.assigned_doctor_id}
                    onChange={(e) => setFormData({ ...formData, assigned_doctor_id: e.target.value })}
                    className="w-full bg-[#051650]/30 border border-[#2D2755] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#4F83FF]"
                  >
                    <option value="" className="bg-[#131e3a]">Unassigned</option>
                    {doctors.map((d: any) => (
                      <option key={d.id} value={d.id} className="bg-[#131e3a]">
                        {formatDoctorName(d.full_name)} ({d.specialization})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-[#2D2755]">
                <button
                  type="submit"
                  disabled={createPatient.isPending}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                >
                  {createPatient.isPending ? "Creating..." : "Register Patient"}
                </button>
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-6 py-2.5 bg-[#051650]/30 text-[#D1D5DB] hover:text-white rounded-xl hover:bg-[#051650]/50 transition-all border border-[#2D2755]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Patient Modal */}
      {editModalPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#131e3a] border border-[#2D2755] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-in shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-[#2D2755]">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Edit className="h-5 w-5 text-blue-400" /> Edit Patient Details — {editModalPatient.full_name}
              </h2>
              <button
                onClick={() => setEditModalPatient(null)}
                className="text-[#D1D5DB] hover:text-white p-1 hover:bg-[#051650]/40 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleUpdatePatient} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[#D1D5DB] text-xs mb-1 block">Full Name *</label>
                  <input
                    required
                    value={editFormData.full_name}
                    onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                    className="w-full bg-[#051650]/30 border border-[#2D2755] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#4F83FF]"
                  />
                </div>
                <div>
                  <label className="text-[#D1D5DB] text-xs mb-1 block">Date of Birth</label>
                  <input
                    type="date"
                    value={editFormData.date_of_birth}
                    onChange={(e) => setEditFormData({ ...editFormData, date_of_birth: e.target.value })}
                    className="w-full bg-[#051650]/30 border border-[#2D2755] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#4F83FF]"
                  />
                </div>
                <div>
                  <label className="text-[#D1D5DB] text-xs mb-1 block">Gender</label>
                  <select
                    value={editFormData.gender}
                    onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}
                    className="w-full bg-[#051650]/30 border border-[#2D2755] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#4F83FF]"
                  >
                    <option value="male" className="bg-[#131e3a]">Male</option>
                    <option value="female" className="bg-[#131e3a]">Female</option>
                    <option value="other" className="bg-[#131e3a]">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#D1D5DB] text-xs mb-1 block">Blood Group</label>
                  <select
                    value={editFormData.blood_group}
                    onChange={(e) => setEditFormData({ ...editFormData, blood_group: e.target.value })}
                    className="w-full bg-[#051650]/30 border border-[#2D2755] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#4F83FF]"
                  >
                    <option value="" className="bg-[#131e3a]">Unknown</option>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                      <option key={bg} value={bg} className="bg-[#131e3a]">{bg}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[#D1D5DB] text-xs mb-1 block">Phone Number</label>
                  <input
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full bg-[#051650]/30 border border-[#2D2755] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#4F83FF]"
                  />
                </div>
                <div>
                  <label className="text-[#D1D5DB] text-xs mb-1 block">Patient Type</label>
                  <select
                    value={editFormData.patient_type}
                    onChange={(e) => setEditFormData({ ...editFormData, patient_type: e.target.value, ward: e.target.value === "inpatient" ? "General Ward B" : "", bed_number: e.target.value === "inpatient" ? "B-102" : e.target.value === "icu" ? "ICU-A1" : "" })}
                    className="w-full bg-[#051650]/30 border border-[#2D2755] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#4F83FF]"
                  >
                    <option value="outpatient" className="bg-[#131e3a]">Outpatient (Consultation)</option>
                    <option value="inpatient" className="bg-[#131e3a]">Inpatient (Admitted to Ward)</option>
                    <option value="icu" className="bg-[#131e3a]">ICU (Intensive Care)</option>
                  </select>
                </div>
                {editFormData.patient_type === "inpatient" && (
                  <>
                    <div>
                      <label className="text-[#D1D5DB] text-xs mb-1 block">Ward Name</label>
                      <input
                        value={editFormData.ward}
                        onChange={(e) => setEditFormData({ ...editFormData, ward: e.target.value })}
                        placeholder="e.g. General Ward B"
                        className="w-full bg-[#051650]/30 border border-[#2D2755] rounded-lg px-3 py-2 text-white placeholder-[#6B7280] text-sm focus:outline-none focus:border-[#4F83FF]"
                      />
                    </div>
                    <div>
                      <label className="text-[#D1D5DB] text-xs mb-1 block">Bed Number</label>
                      <input
                        value={editFormData.bed_number}
                        onChange={(e) => setEditFormData({ ...editFormData, bed_number: e.target.value })}
                        placeholder="e.g. B-102"
                        className="w-full bg-[#051650]/30 border border-[#2D2755] rounded-lg px-3 py-2 text-white placeholder-[#6B7280] text-sm focus:outline-none focus:border-[#4F83FF]"
                      />
                    </div>
                  </>
                )}
                {editFormData.patient_type === "icu" && (
                  <div>
                    <label className="text-[#D1D5DB] text-xs mb-1 block">ICU Bed Number</label>
                    <input
                      value={editFormData.bed_number}
                      onChange={(e) => setEditFormData({ ...editFormData, bed_number: e.target.value })}
                      placeholder="e.g. ICU-A1"
                      className="w-full bg-[#051650]/30 border border-[#2D2755] rounded-lg px-3 py-2 text-white placeholder-[#6B7280] text-sm focus:outline-none focus:border-[#4F83FF]"
                    />
                  </div>
                )}
                <div>
                  <label className="text-[#D1D5DB] text-xs mb-1 block">Current Medical Condition</label>
                  <input
                    value={editFormData.current_condition}
                    onChange={(e) => setEditFormData({ ...editFormData, current_condition: e.target.value })}
                    className="w-full bg-[#051650]/30 border border-[#2D2755] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#4F83FF]"
                  />
                </div>
                <div>
                  <label className="text-[#D1D5DB] text-xs mb-1 block">Status</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full bg-[#051650]/30 border border-[#2D2755] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#4F83FF]"
                  >
                    <option value="stable" className="bg-[#131e3a]">Stable</option>
                    <option value="improving" className="bg-[#131e3a]">Improving</option>
                    <option value="under_review" className="bg-[#131e3a]">Under Review</option>
                    <option value="critical" className="bg-[#131e3a]">Critical</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-[#D1D5DB] text-xs mb-1 block">Assign Doctor</label>
                  <select
                    value={editFormData.assigned_doctor_id}
                    onChange={(e) => setEditFormData({ ...editFormData, assigned_doctor_id: e.target.value })}
                    className="w-full bg-[#051650]/30 border border-[#2D2755] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#4F83FF]"
                  >
                    <option value="" className="bg-[#131e3a]">Unassigned</option>
                    {doctors.map((d: any) => (
                      <option key={d.id} value={d.id} className="bg-[#131e3a]">
                        {formatDoctorName(d.full_name)} ({d.specialization})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-[#2D2755]">
                <button
                  type="submit"
                  disabled={updatePatient.isPending}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                >
                  {updatePatient.isPending ? "Saving Changes..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditModalPatient(null)}
                  className="px-6 py-2.5 bg-[#051650]/30 text-[#D1D5DB] hover:text-white rounded-xl hover:bg-[#051650]/50 transition-all border border-[#2D2755]"
                >
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
                <label className="text-[#D1D5DB] text-xs mb-1 block">Select Doctor *</label>
                <select
                  required
                  value={apptForm.doctor_id}
                  onChange={(e) => setApptForm({ ...apptForm, doctor_id: e.target.value })}
                  className="w-full bg-[#051650]/30 border border-[#2D2755] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#4F83FF] text-sm"
                >
                  <option value="" className="bg-[#131e3a]">-- Select Doctor --</option>
                  {doctors.map((d: any) => (
                    <option key={d.id} value={d.id} className="bg-[#131e3a]">
                      {formatDoctorName(d.full_name)} ({d.specialization})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[#D1D5DB] text-xs mb-1 block">Clinical Notes</label>
                <textarea
                  value={apptForm.notes}
                  onChange={(e) => setApptForm({ ...apptForm, notes: e.target.value })}
                  placeholder="Reason for appointment, instructions for the patient..."
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
