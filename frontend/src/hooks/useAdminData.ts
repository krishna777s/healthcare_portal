import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export const useAdminStats = () =>
  useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => (await api.get("/admin/stats")).data,
    staleTime: 30_000,
  });

export const useAdminChartData = () =>
  useQuery({
    queryKey: ["admin-chart-data"],
    queryFn: async () => (await api.get("/admin/chart-data")).data,
    staleTime: 60_000,
  });

export const useDepartments = () =>
  useQuery({
    queryKey: ["admin-departments"],
    queryFn: async () => (await api.get("/admin/departments")).data,
    staleTime: 30_000,
  });

export const useAdminDoctors = () =>
  useQuery({
    queryKey: ["admin-doctors"],
    queryFn: async () => (await api.get("/admin/doctors")).data,
    staleTime: 30_000,
  });

export const useAdminStaff = () =>
  useQuery({
    queryKey: ["admin-staff"],
    queryFn: async () => (await api.get("/admin/staff")).data,
    staleTime: 30_000,
  });

export const useAdminPatients = () =>
  useQuery({
    queryKey: ["admin-patients"],
    queryFn: async () => (await api.get("/admin/patients")).data,
    staleTime: 30_000,
  });

export const useAdminDiagnostics = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["admin-diagnostics", user?.id],
    queryFn: async () => (await api.get("/admin/diagnostics")).data,
    staleTime: 30_000,
    enabled: !!user,
  });
};

export const useCreateDoctor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => (await api.post("/admin/doctors", data)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-doctors"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });
};

export const useCreatePatient = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => (await api.post("/admin/patients", data)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-patients"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });
};

export const useUpdatePatient = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) =>
      (await api.put(`/admin/patients/${id}`, data)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-patients"] });
    },
  });
};

export const useBulkAssignPatients = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { patient_ids: string[]; doctor_id: string }) =>
      (await api.post("/admin/patients/bulk-assign", data)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-patients"] });
    },
  });
};

export const useAdminCreateAppointment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) =>
      (await api.post("/admin/appointments", data)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-patients"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });
};

export const useCreateDepartment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => (await api.post("/admin/departments", data)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-departments"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });
};

export const useUpdateDepartment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) =>
      (await api.put(`/admin/departments/${id}`, data)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-departments"] });
    },
  });
};

export const useCreateStaff = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => (await api.post("/admin/staff", data)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-staff"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });
};

