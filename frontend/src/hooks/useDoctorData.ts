import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export const useDoctorStats = () =>
  useQuery({
    queryKey: ["doctor-stats"],
    queryFn: async () => (await api.get("/doctor/stats")).data,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });

export const useMyPatients = () =>
  useQuery({
    queryKey: ["doctor-my-patients"],
    queryFn: async () => (await api.get("/doctor/my-patients")).data,
    staleTime: 30_000,
  });

export const useInpatients = () =>
  useQuery({
    queryKey: ["doctor-inpatients"],
    queryFn: async () => (await api.get("/doctor/inpatients")).data,
    staleTime: 30_000,
  });

export const useIcuPatients = () =>
  useQuery({
    queryKey: ["doctor-icu-patients"],
    queryFn: async () => (await api.get("/doctor/icu-patients")).data,
    staleTime: 15_000,
    refetchInterval: 20_000, // auto-refresh every 20s for ICU
  });

export const useIcuAlerts = () =>
  useQuery({
    queryKey: ["doctor-icu-alerts"],
    queryFn: async () => (await api.get("/doctor/icu-alerts")).data,
    staleTime: 10_000,
    refetchInterval: 15_000, // auto-refresh every 15s
  });

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

export const useDoctorAppointments = () =>
  useQuery({
    queryKey: ["doctor-appointments"],
    queryFn: async () => (await api.get("/doctor/appointments")).data,
    staleTime: 30_000,
  });

export const usePendingReports = () =>
  useQuery({
    queryKey: ["doctor-pending-reports"],
    queryFn: async () => (await api.get("/doctor/pending-reports")).data,
    staleTime: 30_000,
  });

export const useDoctorPrescriptions = () =>
  useQuery({
    queryKey: ["doctor-prescriptions"],
    queryFn: async () => (await api.get("/doctor/prescriptions")).data,
    staleTime: 30_000,
  });

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

export const useDoctorMedicalRecords = () =>
  useQuery({
    queryKey: ["doctor-medical-records"],
    queryFn: async () => (await api.get("/doctor/medical-records")).data,
    staleTime: 30_000,
  });

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

