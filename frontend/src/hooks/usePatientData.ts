import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export const usePatientStats = () =>
  useQuery({
    queryKey: ["patient-stats"],
    queryFn: async () => (await api.get("/patient/stats")).data,
    staleTime: 30_000,
  });

export const usePatientProfile = () =>
  useQuery({
    queryKey: ["patient-profile"],
    queryFn: async () => (await api.get("/patient/profile")).data,
    staleTime: 60_000,
  });

export const useMyAppointments = () =>
  useQuery({
    queryKey: ["patient-appointments"],
    queryFn: async () => (await api.get("/patient/appointments")).data,
    staleTime: 30_000,
  });

export const useNextAppointment = () =>
  useQuery({
    queryKey: ["patient-next-appointment"],
    queryFn: async () => (await api.get("/patient/next-appointment")).data,
    staleTime: 60_000,
  });

export const useMyReports = () =>
  useQuery({
    queryKey: ["patient-reports"],
    queryFn: async () => (await api.get("/patient/reports")).data,
    staleTime: 30_000,
  });

export const useMyPrescriptions = () =>
  useQuery({
    queryKey: ["patient-prescriptions"],
    queryFn: async () => (await api.get("/patient/prescriptions")).data,
    staleTime: 30_000,
  });

export const useMyMedicalRecords = () =>
  useQuery({
    queryKey: ["patient-medical-records"],
    queryFn: async () => (await api.get("/patient/medical-records")).data,
    staleTime: 30_000,
  });
