import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, User, Plus, X, Edit, Shield, Stethoscope, Briefcase, Calendar } from "lucide-react";
import {
  useAdminDoctors,
  useAdminStaff,
  useDepartments,
  useCreateDoctor,
  useCreateStaff,
} from "@/hooks/useAdminData";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function Staff() {
  const { data: doctors = [], isLoading: docLoading } = useAdminDoctors();
  const { data: staff = [], isLoading: staffLoading } = useAdminStaff();
  const { data: departments = [] } = useDepartments();

  const createDoctor = useCreateDoctor();
  const createStaff = useCreateStaff();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"doctors" | "pharmacists">("doctors");
  const [addDoctorOpen, setAddDoctorOpen] = useState(false);
  const [addPharmacistOpen, setAddPharmacistOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    specialization: "",
    qualification: "",
    experience_years: "",
    phone: "",
    department_id: "",
  });

  const [pharmacistFormData, setPharmacistFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    phone: "",
  });

  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createDoctor.mutateAsync({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        specialization: formData.specialization || null,
        qualification: formData.qualification || null,
        experience_years: formData.experience_years ? parseInt(formData.experience_years, 10) : null,
        phone: formData.phone || null,
        department_id: formData.department_id || null,
      });
      toast({
        title: "Success",
        description: "Doctor Created Successfully!",
      });
      setAddDoctorOpen(false);
      setFormData({
        email: "",
        password: "",
        full_name: "",
        specialization: "",
        qualification: "",
        experience_years: "",
        phone: "",
        department_id: "",
      });
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: err.response?.data?.detail || "Failed to create doctor",
        variant: "destructive"
      });
    }
  };

  const handleCreatePharmacist = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createStaff.mutateAsync({
        email: pharmacistFormData.email,
        password: pharmacistFormData.password,
        full_name: pharmacistFormData.full_name,
        role: "pharmacist",
        department_id: null,
        phone: pharmacistFormData.phone || null,
        shift: "morning",
      });
      toast({
        title: "Success",
        description: "Pharmacist Registered Successfully!",
      });
      setAddPharmacistOpen(false);
      setPharmacistFormData({
        email: "",
        password: "",
        full_name: "",
        role: "pharmacist",
        department_id: "",
        phone: "",
        shift: "morning",
      });
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: err.response?.data?.detail || "Failed to register staff",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in bg-[#131e3a] text-white min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            <Users className="h-8 w-8 text-[#4F83FF]" /> Hospital Personnel Registry
          </h1>
          <p className="text-[#D1D5DB]">Register and manage hospital doctors, pharmacists, and medical staff accounts</p>
        </div>
        <div>
          {activeTab === "doctors" ? (
            <button
              onClick={() => setAddDoctorOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-emerald-500/20"
            >
              <Plus className="h-5 w-5" /> Add Doctor
            </button>
          ) : (
            <button
              onClick={() => setAddPharmacistOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-emerald-500/20"
            >
              <Plus className="h-5 w-5" /> Register Pharmacist
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#2D2755] gap-6">
        <button
          onClick={() => setActiveTab("doctors")}
          className={`pb-3 text-lg font-semibold border-b-2 transition-all ${
            activeTab === "doctors"
              ? "border-[#4F83FF] text-[#4F83FF]"
              : "border-transparent text-[#D1D5DB] hover:text-white"
          }`}
        >
          Doctors Directory
        </button>
        <button
          onClick={() => setActiveTab("pharmacists")}
          className={`pb-3 text-lg font-semibold border-b-2 transition-all ${
            activeTab === "staff"
              ? "border-[#4F83FF] text-[#4F83FF]"
              : "border-transparent text-[#D1D5DB] hover:text-white"
          }`}
        >
          Pharmacists
        </button>
      </div>

      {/* Main Content */}
      {activeTab === "doctors" ? (
        <Card className="border-[#2D2755] bg-[#051650]/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-400" />
              Medical Doctors Directory
            </CardTitle>
          </CardHeader>
          <CardContent>
            {docLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 rounded-xl bg-[#1e2d4d]" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#2D2755] text-[#D1D5DB] text-sm font-medium">
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Specialization</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Experience</th>
                      <th className="py-3 px-4">Qualification</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2D2755]/30">
                    {doctors.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-[#D1D5DB]">
                          No doctors registered yet.
                        </td>
                      </tr>
                    ) : (
                      doctors.map((doc: any) => (
                        <tr key={doc.id} className="hover:bg-[#051650]/20 transition-all">
                          <td className="py-4 px-4 text-white font-semibold flex items-center gap-2 mt-1">
                            <User className="h-4 w-4 text-[#4F83FF] flex-shrink-0" />
                            {doc.full_name}
                          </td>
                          <td className="py-4 px-4 text-[#D1D5DB] text-sm">{doc.specialization || "—"}</td>
                          <td className="py-4 px-4 text-[#D1D5DB] text-sm">{doc.department_name || "—"}</td>
                          <td className="py-4 px-4 text-[#D1D5DB] text-sm">
                            {doc.experience_years ? `${doc.experience_years} years` : "—"}
                          </td>
                          <td className="py-4 px-4 text-[#D1D5DB] text-sm">{doc.qualification || "—"}</td>
                          <td className="py-4 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                doc.is_available
                                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                  : "bg-red-500/20 text-red-400 border border-red-500/30"
                              }`}
                            >
                              {doc.is_available ? "Available" : "Unavailable"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-[#2D2755] bg-[#051650]/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-400" />
              Pharmacists Directory
            </CardTitle>
          </CardHeader>
          <CardContent>
            {staffLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 rounded-xl bg-[#1e2d4d]" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#2D2755] text-[#D1D5DB] text-sm font-medium">
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Phone</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2D2755]/30">
                    {staff.filter((s: any) => s.role === 'pharmacist' || s.role === 'pharmacy').length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-[#D1D5DB]">
                          No pharmacists registered yet.
                        </td>
                      </tr>
                    ) : (
                      staff.filter((s: any) => s.role === 'pharmacist' || s.role === 'pharmacy').map((member: any) => (
                        <tr key={member.id} className="hover:bg-[#051650]/20 transition-all">
                          <td className="py-4 px-4 text-white font-semibold flex items-center gap-2 mt-1">
                            <User className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                            {member.full_name}
                          </td>
                          <td className="py-4 px-4 text-[#D1D5DB] text-sm">
                            <span className="capitalize">{member.role === "pharmacy" ? "pharmacist" : member.role}</span>
                          </td>
                          <td className="py-4 px-4 text-[#D1D5DB] text-sm">{member.email || "—"}</td>
                          <td className="py-4 px-4 text-[#D1D5DB] text-sm">{member.phone || "—"}</td>
                          <td className="py-4 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                member.is_active
                                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                  : "bg-red-500/20 text-red-400 border border-red-500/30"
                              }`}
                            >
                              {member.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add Doctor Modal */}
      {addDoctorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#131e3a] border border-[#2D2755] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-in shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-[#2D2755]">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Plus className="h-5 w-5 text-emerald-400" /> Register New Doctor
              </h2>
              <button
                onClick={() => setAddDoctorOpen(false)}
                className="text-[#D1D5DB] hover:text-white p-1 hover:bg-[#051650]/40 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateDoctor} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Doctor credentials */}
                <div className="col-span-2 p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 space-y-3">
                  <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="h-4 w-4" /> Doctor Login Credentials
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[#D1D5DB] text-xs mb-1 block">Email Address *</label>
                      <input
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="doctor@hospital.com"
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

                {/* Profile fields */}
                <div>
                  <label className="text-[#D1D5DB] text-xs mb-1 block">Full Name *</label>
                  <input
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Dr. John Smith"
                    className="w-full bg-[#051650]/30 border border-[#2D2755] rounded-lg px-3 py-2 text-white placeholder-[#6B7280] text-sm focus:outline-none focus:border-[#4F83FF]"
                  />
                </div>
                <div>
                  <label className="text-[#D1D5DB] text-xs mb-1 block">Specialization</label>
                  <input
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    placeholder="e.g. Cardiology"
                    className="w-full bg-[#051650]/30 border border-[#2D2755] rounded-lg px-3 py-2 text-white placeholder-[#6B7280] text-sm focus:outline-none focus:border-[#4F83FF]"
                  />
                </div>
                <div>
                  <label className="text-[#D1D5DB] text-xs mb-1 block">Department</label>
                  <select
                    value={formData.department_id}
                    onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                    className="w-full bg-[#051650]/30 border border-[#2D2755] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#4F83FF]"
                  >
                    <option value="" className="bg-[#131e3a]">Select Department</option>
                    {departments.map((dept: any) => (
                      <option key={dept.id} value={dept.id} className="bg-[#131e3a]">{dept.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[#D1D5DB] text-xs mb-1 block">Qualification</label>
                  <input
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    placeholder="e.g. MD, FACC"
                    className="w-full bg-[#051650]/30 border border-[#2D2755] rounded-lg px-3 py-2 text-white placeholder-[#6B7280] text-sm focus:outline-none focus:border-[#4F83FF]"
                  />
                </div>
                <div>
                  <label className="text-[#D1D5DB] text-xs mb-1 block">Experience (Years)</label>
                  <input
                    type="number"
                    value={formData.experience_years}
                    onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                    placeholder="e.g. 10"
                    className="w-full bg-[#051650]/30 border border-[#2D2755] rounded-lg px-3 py-2 text-white placeholder-[#6B7280] text-sm focus:outline-none focus:border-[#4F83FF]"
                  />
                </div>
                <div>
                  <label className="text-[#D1D5DB] text-xs mb-1 block">Phone Number</label>
                  <input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 019-2834"
                    className="w-full bg-[#051650]/30 border border-[#2D2755] rounded-lg px-3 py-2 text-white placeholder-[#6B7280] text-sm focus:outline-none focus:border-[#4F83FF]"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-[#2D2755]">
                <button
                  type="submit"
                  disabled={createDoctor.isPending}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {createDoctor.isPending ? "Creating..." : "Register Doctor"}
                </button>
                <button
                  type="button"
                  onClick={() => setAddDoctorOpen(false)}
                  className="px-6 py-2.5 bg-[#051650]/30 text-[#D1D5DB] hover:text-white rounded-xl hover:bg-[#051650]/50 transition-all border border-[#2D2755]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

            {/* Add Pharmacist Modal */}
      {addPharmacistOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#131e3a] border border-[#2D2755] rounded-2xl w-full max-w-xl shadow-2xl animate-slide-in my-8">
            <div className="flex items-center justify-between p-6 border-b border-[#2D2755] sticky top-0 bg-[#131e3a] rounded-t-2xl z-10">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">Register Pharmacist</h2>
              <button
                onClick={() => setAddPharmacistOpen(false)}
                className="text-[#D1D5DB] hover:text-white p-1 hover:bg-[#051650]/40 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreatePharmacist} className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[#D1D5DB] text-sm font-medium mb-1.5 block">Full Name *</label>
                    <input
                      required
                      value={pharmacistFormData.full_name}
                      onChange={(e) => setPharmacistFormData({ ...pharmacistFormData, full_name: e.target.value })}
                      placeholder="e.g. Jane Doe"
                      className="w-full bg-[#051650]/30 border border-[#2D2755] rounded-xl px-4 py-2.5 text-white placeholder-[#6B7280] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[#D1D5DB] text-sm font-medium mb-1.5 block">Phone Number</label>
                    <input
                      value={pharmacistFormData.phone}
                      onChange={(e) => setPharmacistFormData({ ...pharmacistFormData, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-[#051650]/30 border border-[#2D2755] rounded-xl px-4 py-2.5 text-white placeholder-[#6B7280] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[#D1D5DB] text-sm font-medium mb-1.5 block">Email (Login ID) *</label>
                    <input
                      required
                      type="email"
                      value={pharmacistFormData.email}
                      onChange={(e) => setPharmacistFormData({ ...pharmacistFormData, email: e.target.value })}
                      placeholder="jane@hospital.com"
                      className="w-full bg-[#051650]/30 border border-[#2D2755] rounded-xl px-4 py-2.5 text-white placeholder-[#6B7280] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[#D1D5DB] text-sm font-medium mb-1.5 block">Password *</label>
                    <input
                      required
                      type="password"
                      value={pharmacistFormData.password}
                      onChange={(e) => setPharmacistFormData({ ...pharmacistFormData, password: e.target.value })}
                      placeholder="Initial password"
                      className="w-full bg-[#051650]/30 border border-[#2D2755] rounded-xl px-4 py-2.5 text-white placeholder-[#6B7280] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-[#2D2755]">
                <button
                  type="button"
                  onClick={() => setAddPharmacistOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-[#D1D5DB] hover:text-white hover:bg-[#2D2755] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createStaff.isPending}
                  className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium text-sm transition-colors disabled:opacity-50"
                >
                  {createStaff.isPending ? "Registering..." : "Register Pharmacist"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
