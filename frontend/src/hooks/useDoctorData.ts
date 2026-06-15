import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export const useDoctorStats = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["doctor-stats"],
    queryFn: async () => (await api.get("/doctor/stats")).data,
    staleTime: 15_000,
    refetchInterval: 30_000,
    enabled: user?.role === "doctor",
  });
};

export const useMyPatients = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["doctor-my-patients"],
    queryFn: async () => (await api.get("/doctor/my-patients")).data,
    staleTime: 30_000,
    enabled: user?.role === "doctor",
  });
};

export const useInpatients = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["doctor-inpatients"],
    queryFn: async () => (await api.get("/doctor/inpatients")).data,
    staleTime: 30_000,
    enabled: user?.role === "doctor",
  });
};

export const useIcuPatients = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["doctor-icu-patients"],
    queryFn: async () => (await api.get("/doctor/icu-patients")).data,
    staleTime: 15_000,
    refetchInterval: 20_000, // auto-refresh every 20s for ICU
    enabled: user?.role === "doctor",
  });
};

export const useIcuAlerts = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["doctor-icu-alerts"],
    queryFn: async () => (await api.get("/doctor/icu-alerts")).data,
    staleTime: 10_000,
    refetchInterval: 15_000, // auto-refresh every 15s
    enabled: user?.role === "doctor",
  });
};

export const useAcknowledgeAlert = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (alertId: string) =>
      (await api.put(`/doctor/icu-alerts/${alertId}/acknowledge`)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["doctor-icu-alerts"] });
      qc.invalidateQueries({ queryKey: ["doctor-stats"] });
    },
  });
};

export const useDoctorAppointments = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["doctor-appointments"],
    queryFn: async () => (await api.get("/doctor/appointments")).data,
    staleTime: 30_000,
    enabled: user?.role === "doctor",
  });
};

export const usePendingReports = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["doctor-pending-reports"],
    queryFn: async () => (await api.get("/doctor/pending-reports")).data,
    staleTime: 30_000,
    enabled: user?.role === "doctor",
  });
};

export const useDoctorPrescriptions = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["doctor-prescriptions"],
    queryFn: async () => (await api.get("/doctor/prescriptions")).data,
    staleTime: 30_000,
    enabled: user?.role === "doctor",
  });
};

export const useCreatePrescription = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) =>
      (await api.post("/doctor/prescriptions", data)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["doctor-prescriptions"] });
      qc.invalidateQueries({ queryKey: ["doctor-stats"] });
    },
  });
};

export const useDoctorMedicalRecords = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["doctor-medical-records"],
    queryFn: async () => (await api.get("/doctor/medical-records")).data,
    staleTime: 30_000,
    enabled: user?.role === "doctor",
  });
};

export const useCreateMedicalRecord = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) =>
      (await api.post("/doctor/medical-records", data)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["doctor-medical-records"] });
    },
  });
};

export const useCreateLabReport = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) =>
      (await api.post("/doctor/lab-reports", data)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["doctor-pending-reports"] });
      qc.invalidateQueries({ queryKey: ["doctor-stats"] });
    },
  });
};

export const useUploadLabReportFile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ reportId, formData }: { reportId: string; formData: FormData }) =>
      (await api.post(`/doctor/lab-reports/${reportId}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["doctor-pending-reports"] });
      qc.invalidateQueries({ queryKey: ["doctor-stats"] });
    },
  });
};

export const useCreateAppointment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) =>
      (await api.post("/doctor/appointments", data)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["doctor-appointments"] });
      qc.invalidateQueries({ queryKey: ["doctor-my-patients"] });
      qc.invalidateQueries({ queryKey: ["doctor-stats"] });
    },
  });
};

export const useUploadPrescriptionFile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ prescriptionId, formData }: { prescriptionId: string; formData: FormData }) =>
      (await api.post(`/doctor/prescriptions/${prescriptionId}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["doctor-prescriptions"] });
    },
  });
};

