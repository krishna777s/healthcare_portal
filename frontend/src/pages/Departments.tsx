import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, Plus, X } from "lucide-react";
import { useDepartments, useCreateDepartment } from "@/hooks/useAdminData";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function Departments() {
  const { data: departments = [], isLoading } = useDepartments();
  const createDepartment = useCreateDepartment();
  const { toast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    head_doctor: "",
    total_beds: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createDepartment.mutateAsync(formData);
      toast({
        title: "Success",
        description: "Department Created Successfully!",
      });
      setModalOpen(false);
      setFormData({ name: "", description: "", head_doctor: "", total_beds: 0 });
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: err.response?.data?.detail || "Failed to create department",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in bg-[#131e3a] text-white min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            <Building2 className="h-8 w-8 text-[#4F83FF]" /> Departments
          </h1>
          <p className="text-[#D1D5DB]">All hospital departments — live from database</p>
        </div>
        <div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/20"
          >
            <Plus className="h-5 w-5" /> Add Department
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl bg-[#1e2d4d]" />
          ))}
        </div>
      ) : departments.length === 0 ? (
        <Card className="border-[#2D2755] bg-[#051650]/10">
          <CardContent className="p-10 text-center text-[#D1D5DB]">
            No departments found. Click "Add Department" to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept: any) => (
            <Card key={dept.id} className="border-[#2D2755] bg-[#051650]/10 backdrop-blur-sm hover:bg-[#051650]/20 transition-colors">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-lg">
                  <Building2 className="h-5 w-5 text-[#4F83FF]" />
                  {dept.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-[#D1D5DB] text-sm">{dept.description || "—"}</p>
                <div className="flex items-center justify-between pt-2 border-t border-[#2D2755]">
                  <div className="text-center">
                    <p className="text-[#D1D5DB] text-xs">Head Doctor</p>
                    <p className="text-white text-sm font-medium">{dept.head_doctor || "Unassigned"}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[#D1D5DB] text-xs">Beds</p>
                    <p className="text-white text-sm font-medium">{dept.total_beds ?? "—"}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[#D1D5DB] text-xs flex items-center gap-1"><Users className="h-3 w-3" /> Doctors</p>
                    <p className="text-[#4F83FF] text-sm font-bold">{dept.doctor_count}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Department Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#131e3a] border border-[#2D2755] rounded-2xl w-full max-w-md shadow-2xl animate-slide-in">
            <div className="flex items-center justify-between p-6 border-b border-[#2D2755]">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Plus className="h-5 w-5 text-blue-400" /> Add Department
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-[#D1D5DB] hover:text-white p-1 hover:bg-[#051650]/40 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-[#D1D5DB] text-xs mb-1 block">Department Name *</label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Cardiology"
                  className="w-full bg-[#051650]/30 border border-[#2D2755] rounded-lg px-3 py-2 text-white placeholder-[#6B7280] text-sm focus:outline-none focus:border-[#4F83FF]"
                />
              </div>
              <div>
                <label className="text-[#D1D5DB] text-xs mb-1 block">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Department details and focus area..."
                  className="w-full bg-[#051650]/30 border border-[#2D2755] rounded-lg px-3 py-2 text-white placeholder-[#6B7280] text-sm focus:outline-none focus:border-[#4F83FF] h-20 resize-none"
                />
              </div>
              <div>
                <label className="text-[#D1D5DB] text-xs mb-1 block">Head Doctor</label>
                <input
                  value={formData.head_doctor}
                  onChange={(e) => setFormData({ ...formData, head_doctor: e.target.value })}
                  placeholder="e.g. Dr. Jane Watson"
                  className="w-full bg-[#051650]/30 border border-[#2D2755] rounded-lg px-3 py-2 text-white placeholder-[#6B7280] text-sm focus:outline-none focus:border-[#4F83FF]"
                />
              </div>
              <div>
                <label className="text-[#D1D5DB] text-xs mb-1 block">Total Beds</label>
                <input
                  type="number"
                  value={formData.total_beds}
                  onChange={(e) => setFormData({ ...formData, total_beds: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  className="w-full bg-[#051650]/30 border border-[#2D2755] rounded-lg px-3 py-2 text-white placeholder-[#6B7280] text-sm focus:outline-none focus:border-[#4F83FF]"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-[#2D2755]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm bg-gray-600/20 hover:bg-gray-600/40 text-gray-300 rounded-lg transition-colors font-medium border border-gray-500/25"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createDepartment.isPending}
                  className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-semibold shadow-md disabled:opacity-50"
                >
                  {createDepartment.isPending ? "Saving..." : "Save Department"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
