import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, AlertTriangle, Heart, Thermometer, Wind, CheckCircle, Edit, X } from "lucide-react";
import { useIcuPatients, useIcuAlerts, useAcknowledgeAlert, useDoctorUpdatePatient } from "@/hooks/useDoctorData";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const severityStyle: Record<string, string> = {
  low: "border-l-blue-400 bg-blue-500/5",
  medium: "border-l-yellow-400 bg-yellow-500/5",
  high: "border-l-orange-400 bg-orange-500/5",
  critical: "border-l-red-500 bg-red-500/10",
};

const severityBadge: Record<string, string> = {
  low: "bg-blue-500/20 text-blue-400",
  medium: "bg-yellow-500/20 text-yellow-400",
  high: "bg-orange-500/20 text-orange-400",
  critical: "bg-red-500/20 text-red-400",
};

export default function ICU() {
  const { data: icuPatients = [], isLoading: patientsLoading } = useIcuPatients();
  const { data: alerts = [], isLoading: alertsLoading } = useIcuAlerts();
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
  const acknowledge = useAcknowledgeAlert();

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
  const unreadCount = alerts.filter((a: any) => !a.is_acknowledged).length;

  return (
    <div className="p-6 space-y-6 animate-fade-in bg-[#131e3a] text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Activity className="h-8 w-8 text-red-400" /> ICU Monitor
          </h1>
          <p className="text-[#D1D5DB]">Real-time ICU patient monitoring</p>
        </div>
        {unreadCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/40 rounded-xl animate-pulse">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <span className="text-red-400 font-bold">{unreadCount} unread alerts</span>
          </div>
        )}
      </div>

      {/* ICU Patients Grid */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">ICU Patients ({icuPatients.length})</h2>
        {patientsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 bg-[#1e2d4d] rounded-xl" />)}
          </div>
        ) : icuPatients.length === 0 ? (
          <Card className="border-[#2D2755] bg-[#051650]/10">
            <CardContent className="p-10 text-center text-[#D1D5DB]">
              No ICU patients currently under your care.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {icuPatients.map((p: any) => (
              <Card
                 key={p.id}
                 className={`border backdrop-blur-sm ${p.unread_alerts > 0 ? "border-red-500/50 bg-red-500/5" : "border-[#2D2755] bg-[#051650]/10"}`}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-base flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>{p.patient_name}</span>
                      {p.patient_id && (
                        <button
                          onClick={() => {
                            setEditModal({ open: true, patient: p });
                            setEditForm({
                              current_condition: p.condition || "",
                              status: p.status || "stable",
                              gender: p.gender || "male",
                              blood_group: p.blood_group || "",
                              phone: p.phone || "",
                              date_of_birth: p.date_of_birth || "",
                            });
                          }}
                          className="p-1 hover:bg-[#051650]/40 rounded text-violet-300 hover:text-violet-100 transition-colors"
                          title="Edit Details"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-bold">
                      Bed {p.bed_number}
                    </span>
                  </CardTitle>
                  <p className="text-[#D1D5DB] text-sm">{p.condition || "Under observation"}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-[#051650]/30">
                      <Heart className="h-4 w-4 text-red-400" />
                      <div>
                        <p className="text-[#D1D5DB] text-xs">Heart Rate</p>
                        <p className="text-white text-sm font-bold">{p.heart_rate ? `${p.heart_rate} bpm` : "—"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-[#051650]/30">
                      <Wind className="h-4 w-4 text-blue-400" />
                      <div>
                        <p className="text-[#D1D5DB] text-xs">O₂ Sat</p>
                        <p className="text-white text-sm font-bold">{p.oxygen_saturation ? `${p.oxygen_saturation}%` : "—"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-[#051650]/30">
                      <Activity className="h-4 w-4 text-green-400" />
                      <div>
                        <p className="text-[#D1D5DB] text-xs">Blood Pressure</p>
                        <p className="text-white text-sm font-bold">{p.blood_pressure || "—"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-[#051650]/30">
                      <Thermometer className="h-4 w-4 text-orange-400" />
                      <div>
                        <p className="text-[#D1D5DB] text-xs">Temp</p>
                        <p className="text-white text-sm font-bold">{p.temperature ? `${p.temperature}°C` : "—"}</p>
                      </div>
                    </div>
                  </div>
                  {p.unread_alerts > 0 && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-red-500/20 border border-red-500/30">
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                      <span className="text-red-400 text-sm font-medium">{p.unread_alerts} unread alert{p.unread_alerts > 1 ? "s" : ""}</span>
                    </div>
                  )}
                  <p className="text-[#D1D5DB] text-xs">Admitted: {p.admission_date}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Alert Feed */}
      <Card className="border-[#2D2755] bg-[#051650]/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-400" /> Sensor Alert Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alertsLoading ? (
            <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 bg-[#1e2d4d] rounded-lg" />)}</div>
          ) : alerts.length === 0 ? (
            <div className="py-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
              <p className="text-[#D1D5DB]">No alerts — all ICU sensors normal</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert: any) => (
                <div
                  key={alert.id}
                  className={`border-l-4 pl-4 pr-4 py-3 rounded-r-lg flex items-center justify-between ${
                    alert.is_acknowledged ? "opacity-50 " : ""
                  }${severityStyle[alert.severity] || "border-l-gray-400 bg-gray-500/5"}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${severityBadge[alert.severity]}`}>
                        {alert.severity}
                      </span>
                      <span className="text-white font-medium text-sm">{alert.patient_name}</span>
                      <span className="text-[#D1D5DB] text-xs">· Bed {alert.bed_number}</span>
                    </div>
                    <p className="text-[#D1D5DB] text-sm">{alert.message}</p>
                    <p className="text-[#9CA3AF] text-xs mt-1">
                      {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {!alert.is_acknowledged && (
                    <button
                      onClick={() => acknowledge.mutate(alert.id)}
                      className="ml-4 px-3 py-1.5 text-xs bg-[#4F83FF]/20 hover:bg-[#4F83FF]/40 text-[#4F83FF] rounded-lg transition-colors font-medium"
                    >
                      Acknowledge
                    </button>
                  )}
                  {alert.is_acknowledged && (
                    <CheckCircle className="h-5 w-5 text-green-400 ml-4 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
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
