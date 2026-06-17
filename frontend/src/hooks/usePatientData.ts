import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export const usePatientStats = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["patient-stats"],
    queryFn: async () => (await api.get("/patient/stats")).data,
    staleTime: 30_000,
    enabled: user?.role === "patient",
  });
};

export const usePatientProfile = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["patient-profile"],
    queryFn: async () => (await api.get("/patient/profile")).data,
    staleTime: 60_000,
    enabled: user?.role === "patient",
  });
};

export const useMyAppointments = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["patient-appointments"],
    queryFn: async () => (await api.get("/patient/appointments")).data,
    staleTime: 30_000,
    enabled: user?.role === "patient",
  });
};

export const useNextAppointment = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["patient-next-appointment"],
    queryFn: async () => (await api.get("/patient/next-appointment")).data,
    staleTime: 60_000,
    enabled: user?.role === "patient",
  });
};

export const useMyReports = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["patient-reports"],
    queryFn: async () => (await api.get("/patient/reports")).data,
    staleTime: 30_000,
    enabled: user?.role === "patient",
  });
};

export const useMyPrescriptions = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["patient-prescriptions"],
    queryFn: async () => (await api.get("/patient/prescriptions")).data,
    staleTime: 30_000,
    enabled: user?.role === "patient",
  });
};

export const useMyMedicalRecords = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["patient-medical-records"],
    queryFn: async () => (await api.get("/patient/medical-records")).data,
    staleTime: 30_000,
    enabled: user?.role === "patient",
  });
};
