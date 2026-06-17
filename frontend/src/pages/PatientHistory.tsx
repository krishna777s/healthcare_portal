import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSearchParams } from "react-router-dom";
import api, { getFileUrl } from "@/lib/api";
import {
  Search, Calendar, FileText, FlaskConical, ClipboardList,
  BedDouble, BrainCircuit, Loader2, Sparkles, Filter, CheckCircle2, Clock, X, ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Patient {
  id: string;
  full_name: string;
  email: string | null;
  phone: string;
  patient_type: string;
  blood_group?: string;
  current_condition: string;
  doctor_name?: string;
  doctor_id?: string;
}

interface TimelineEvent {
  id: string;
  type: "appointment" | "prescription" | "lab_report" | "medical_record" | "admission";
  date: string;
  title: string;
  description: string;
  doctor_name: string;
  meta: any;
}

function formatMessageText(text: string) {
  if (!text) return "";
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index} className="font-bold text-white">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export default function PatientHistory() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const urlPatientId = searchParams.get("patientId");

  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [patientDetail, setPatientDetail] = useState<any>(null);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [patientSearch, setPatientSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfTitle, setPdfTitle] = useState<string>("");

  const openPdf = (url: string, title: string) => {
    setPdfUrl(url);
    setPdfTitle(title);
  };

  const closePdf = () => {
    setPdfUrl(null);
    setPdfTitle("");
  };

  // Pagination & Filter state for main list
  const [currentPage, setCurrentPage] = useState(1);
  const [typeFilterSelect, setTypeFilterSelect] = useState("all");
  const [doctorFilterSelect, setDoctorFilterSelect] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const itemsPerPage = 8;

  // AI states
  const [analyzingHistory, setAnalyzingHistory] = useState(false);
  const [historyInsights, setHistoryInsights] = useState<string>("");
  const [summarizingReportId, setSummarizingReportId] = useState<string>("");
  const [reportSummaries, setReportSummaries] = useState<Record<string, string>>({});

  const token = sessionStorage.getItem("access_token") || "";

  // Reset pagination page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [patientSearch, typeFilterSelect, doctorFilterSelect]);

  // Effect to sync URL patientId changes to selectedPatientId
  useEffect(() => {
    if (urlPatientId && patients.some(p => p.id === urlPatientId)) {
      setSelectedPatientId(urlPatientId);
      setIsModalOpen(true);
    }
  }, [urlPatientId, patients]);

  // 1. Fetch Patients (if not patient)
  useEffect(() => {
    if (!user || user.role === "patient") return;

    const fetchPatientsList = async () => {
      setLoadingPatients(true);
      try {
        const res = await api.get("/ai-history/patients", { params: { token } });
        setPatients(res.data);
        if (res.data.length > 0) {
          if (urlPatientId && res.data.some((p: any) => p.id === urlPatientId)) {
            setSelectedPatientId(urlPatientId);
            setIsModalOpen(true);
          }
        }
      } catch (err) {
        console.error("Failed to load patients list", err);
        toast.error("Failed to load patients list");
      } finally {
        setLoadingPatients(false);
      }
    };

    fetchPatientsList();
  }, [user, token, urlPatientId]);

  // 2. Fetch Selected Patient History
  useEffect(() => {
    // If the logged in user is a patient, query their own history immediately
    const patientIdToQuery = user?.role === "patient" ? user.id : selectedPatientId;
    if (!patientIdToQuery) {
      setPatientDetail(null);
      setTimelineEvents([]);
      return;
    }

    const fetchPatientHistory = async () => {
      setLoadingHistory(true);
      setHistoryInsights("");
      try {
        const res = await api.get(`/ai-history/patient/${patientIdToQuery}`, { params: { token } });
        setPatientDetail(res.data.patient);
        setTimelineEvents(res.data.events);
      } catch (err) {
        console.error("Failed to fetch patient history", err);
        toast.error("Failed to load patient history timeline");
        setPatientDetail(null);
        setTimelineEvents([]);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchPatientHistory();
  }, [selectedPatientId, user, token]);

  // 3. AI patient insights
  const handleGenerateInsights = async () => {
    const pId = user?.role === "patient" ? user.id : selectedPatientId;
    if (!pId) return;

    setAnalyzingHistory(true);
    try {
      const res = await api.post(`/ai-history/copilot/patient-insights`, { patient_id: pId }, { params: { token } });
      setHistoryInsights(res.data.insights);
      toast.success("AI Insights generated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to analyze patient history.");
    } finally {
      setAnalyzingHistory(false);
    }
  };

  // 4. AI report summary
  const handleSummarizeReport = async (event: TimelineEvent) => {
    setSummarizingReportId(event.id);
    try {
      const res = await api.post(`/ai-history/copilot/summarize-report`, {
        report_name: event.title,
        report_type: event.meta.report_type || "diagnostic",
        notes: event.description,
        priority: event.meta.priority || "normal",
        is_patient: user?.role === "patient"
      }, { params: { token } });
      
      setReportSummaries(prev => ({
        ...prev,
        [event.id]: res.data.summary
      }));
      toast.success("Report summary generated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to summarize report.");
    } finally {
      setSummarizingReportId("");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPatientId("");
  };

  // Extract unique doctors dynamically from patients list
  const uniqueDoctors = Array.from(new Set(patients.map(p => p.doctor_name).filter(Boolean))) as string[];

  // Filters for Main Patient Grid
  const filteredPatients = patients.filter(p => {
    const matchesSearch =
      p.full_name.toLowerCase().includes(patientSearch.toLowerCase()) ||
      (p.email && p.email.toLowerCase().includes(patientSearch.toLowerCase())) ||
      (p.phone && p.phone.includes(patientSearch));

    const matchesType =
      typeFilterSelect === "all" || p.patient_type.toLowerCase() === typeFilterSelect.toLowerCase();

    const matchesDoctor =
      doctorFilterSelect === "all" || p.doctor_name === doctorFilterSelect;

    return matchesSearch && matchesType && matchesDoctor;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const filteredEvents = timelineEvents.filter(ev => {
    // Type Filter
    if (typeFilter !== "all" && ev.type !== typeFilter) return false;
    
    // Search Query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      const matchTitle = ev.title.toLowerCase().includes(query);
      const matchDesc = ev.description.toLowerCase().includes(query);
      const matchDoc = ev.doctor_name.toLowerCase().includes(query);
      return matchTitle || matchDesc || matchDoc;
    }
    return true;
  });

  const getEventIcon = (type: string) => {
    switch (type) {
      case "appointment": return <Calendar className="h-5 w-5 text-indigo-400" />;
      case "prescription": return <FileText className="h-5 w-5 text-emerald-400" />;
      case "lab_report": return <FlaskConical className="h-5 w-5 text-amber-400" />;
      case "medical_record": return <ClipboardList className="h-5 w-5 text-purple-400" />;
      case "admission": return <BedDouble className="h-5 w-5 text-rose-400" />;
      default: return <ClipboardList className="h-5 w-5 text-slate-400" />;
    }
  };

  const getEventBadgeClass = (type: string) => {
    switch (type) {
      case "appointment": return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
      case "prescription": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "lab_report": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "medical_record": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "admission": return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const renderTimelineContent = () => {
    if (loadingHistory) {
      return (
        <div className="flex-1 flex flex-col justify-center items-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-400" />
          <p className="text-slate-400 text-sm mt-3">Loading history timeline...</p>
        </div>
      );
    }

    if (!patientDetail) {
      return (
        <div className="flex-1 flex flex-col justify-center items-center py-20">
          <ClipboardList className="h-16 w-16 text-slate-600 mb-4" />
          <h3 className="text-lg font-semibold text-slate-300">No Patient Detail</h3>
          <p className="text-slate-500 text-sm mt-1">Please select a patient to view history.</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col">
        {/* Patient Overview Header */}
        <section className="p-6 border-b border-[#2D2755] bg-[#101935] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{patientDetail.full_name}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase border ${
                patientDetail.patient_type === "icu" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                patientDetail.patient_type === "inpatient" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              }`}>
                {patientDetail.patient_type}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-1 mt-3 text-sm text-slate-300">
              <p><strong>DOB:</strong> {patientDetail.date_of_birth}</p>
              <p className="capitalize"><strong>Gender:</strong> {patientDetail.gender}</p>
              <p><strong>Blood Group:</strong> {patientDetail.blood_group || "N/A"}</p>
              <p className="line-clamp-1"><strong>Condition:</strong> {patientDetail.current_condition || "None listed"}</p>
            </div>
          </div>

          {/* AI Analysis trigger */}
          <button
            onClick={handleGenerateInsights}
            disabled={analyzingHistory}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg shadow-indigo-950/40 hover:scale-105 flex-shrink-0"
          >
            {analyzingHistory ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <BrainCircuit className="h-4 w-4" />
                AI History Insights
              </>
            )}
          </button>
        </section>

        {/* AI Insights Collapsible Card */}
        {historyInsights && (
          <div className="mx-6 mt-4 p-4 rounded-xl border border-violet-500/30 bg-gradient-to-br from-[#17163a] to-[#121c42] shadow-xl relative animate-fade-in flex flex-col flex-shrink-0">
            <div className="flex items-center gap-2 mb-2 text-violet-400 font-bold text-sm flex-shrink-0">
              <Sparkles className="h-4 w-4" />
              AI CLINICAL INSIGHTS SUMMARY
            </div>
            <div className="flex-grow pr-2">
              <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{formatMessageText(historyInsights)}</p>
            </div>
            <button
              onClick={() => setHistoryInsights("")}
              className="absolute top-3 right-3 text-slate-400 hover:text-white text-xs font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Filters Bar */}
        <div className="px-6 py-4 flex flex-col sm:flex-row gap-3 items-center justify-between border-b border-[#2D2755] bg-[#0c1228]/80">
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {[
              { name: "All Timeline", value: "all" },
              { name: "Appointments", value: "appointment" },
              { name: "Prescriptions", value: "prescription" },
              { name: "Lab Reports", value: "lab_report" },
              { name: "Records", value: "medical_record" },
              { name: "Admissions", value: "admission" },
            ].map(tab => (
              <button
                key={tab.value}
                onClick={() => setTypeFilter(tab.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  typeFilter === tab.value
                    ? "bg-indigo-600 border-indigo-500 text-white"
                    : "bg-[#101935] border-[#2D2755] text-slate-300 hover:bg-[#182247]"
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>

          {/* Event Search */}
          <div className="relative w-full sm:w-64">
            <Filter className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter events..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#101935] border border-[#2D2755] rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Timeline scroll list */}
        <div className="px-6 py-6 space-y-6">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm bg-[#101935]/40 rounded-2xl border border-dashed border-[#2D2755]">
              No history events match the selection.
            </div>
          ) : (
            <div className="relative border-l border-[#2D2755] ml-4 pl-8 space-y-6">
              {filteredEvents.map(event => (
                <div key={event.id} className="relative group animate-fade-in">
                  {/* Circle Dot Icon */}
                  <span className="absolute -left-12 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-[#101935] border-2 border-[#2D2755] group-hover:border-indigo-500 transition-colors duration-200">
                    {getEventIcon(event.type)}
                  </span>

                  {/* Event Card */}
                  <div className="bg-[#101935]/90 border border-[#2D2755] rounded-xl p-5 hover:border-[#3d337a] transition-all duration-200 shadow-md">
                    {/* Card Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1c244c]/60 pb-3 mb-3">
                      <div>
                        <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${getEventBadgeClass(event.type)}`}>
                          {event.type.replace("_", " ")}
                        </span>
                        <h4 className="text-base font-bold text-white mt-1.5">{event.title}</h4>
                      </div>
                      <div className="text-right sm:text-right">
                        <p className="text-xs text-slate-400 flex items-center gap-1 sm:justify-end">
                          <Clock className="h-3 w-3" />
                          {event.date}
                        </p>
                        <p className="text-xs font-medium text-slate-300 mt-1">Consulting: Dr. {event.doctor_name}</p>
                      </div>
                    </div>

                    {/* Card Content Description */}
                    <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{event.description}</p>

                    {/* Event Specific Sub-Timeline data */}
                    {event.type === "prescription" && event.meta?.medicines && (
                      <div className="mt-4 bg-[#0a0f24] rounded-lg p-3 border border-[#1a2247]">
                        <p className="text-xs font-bold text-indigo-400 mb-2">Prescribed Medicines:</p>
                        <div className="space-y-2 text-xs">
                          {event.meta.medicines.map((med: any, idx: number) => (
                            <div key={idx} className="flex justify-between border-b border-[#182247]/50 pb-1.5 last:border-b-0 last:pb-0">
                              <div>
                                <span className="font-semibold text-white">{med.medicine_name}</span>
                                <span className="text-slate-400 ml-2">({med.dosage})</span>
                              </div>
                              <div className="text-slate-400 text-right">
                                <span>{med.frequency} • {med.duration}</span>
                                {med.instructions && <p className="text-[10px] text-emerald-500 italic mt-0.5">{med.instructions}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Pharmacy dispense status */}
                        {event.meta.pharmacy_status && (
                          <div className="mt-3 flex items-center gap-1.5 text-xs">
                            <span className="text-slate-400">Pharmacy Status:</span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                              event.meta.pharmacy_status === "dispensed" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                              event.meta.pharmacy_status === "ready" ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" :
                              "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}>
                              {event.meta.pharmacy_status}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {event.type === "admission" && event.meta && (
                      <div className="mt-3 grid grid-cols-2 gap-4 bg-[#0a0f24] rounded-lg p-3 border border-[#1a2247] text-xs text-slate-300">
                        <p><strong>Ward Room:</strong> {event.meta.ward}</p>
                        <p><strong>Bed ID:</strong> {event.meta.bed_number}</p>
                        {event.meta.discharge_date && (
                          <p className="col-span-2 text-indigo-400">
                            <strong>Discharged on:</strong> {event.meta.discharge_date}
                          </p>
                        )}
                      </div>
                    )}

                    {event.type === "lab_report" && event.meta && (
                      <div className="mt-4 flex flex-col gap-3">
                        <div className="grid grid-cols-2 gap-4 bg-[#0a0f24] rounded-lg p-3 border border-[#1a2247] text-xs text-slate-300">
                          <p><strong>Type:</strong> {event.meta.report_type}</p>
                          <p><strong>Status:</strong> <span className="capitalize text-emerald-400">{event.meta.status}</span></p>
                          <p><strong>Priority:</strong> <span className="uppercase text-amber-400">{event.meta.priority}</span></p>
                          {event.meta.file_url && (
                            <p>
                              <strong>Attachment:</strong>{" "}
                              <button
                                onClick={() => openPdf(getFileUrl(event.meta.file_url) || "", event.title)}
                                className="text-indigo-400 underline hover:text-indigo-300 cursor-pointer text-left font-semibold"
                              >
                                View Report File
                              </button>
                            </p>
                          )}
                        </div>

                        {reportSummaries[event.id] ? (
                          <div className="p-3.5 bg-gradient-to-r from-[#17163a] to-[#121c42] border border-amber-500/20 rounded-lg text-xs leading-relaxed animate-fade-in">
                            <p className="font-bold text-amber-400 mb-1.5 flex items-center gap-1">
                              <Sparkles className="h-3 w-3" />
                              AI LAB REPORT SUMMARY
                            </p>
                            <p className="text-slate-200 whitespace-pre-wrap">{formatMessageText(reportSummaries[event.id])}</p>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleSummarizeReport(event)}
                            disabled={summarizingReportId === event.id}
                            className="w-fit flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 text-xs font-semibold transition-all disabled:opacity-50"
                          >
                            {summarizingReportId === event.id ? (
                              <>
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Analyzing Lab Data...
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-3 w-3" />
                                AI Summarize Report
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // If patient role, display directly inline
  if (user?.role === "patient") {
    return (
      <div className="p-6 bg-[#131e3a] text-slate-100 min-h-screen flex flex-col">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            <ClipboardList className="h-8 w-8 text-[#4F83FF]" /> My Medical History
          </h1>
          <p className="text-[#D1D5DB]">
            Review your timeline of appointments, active prescriptions, lab report results, and clinical notes.
          </p>
        </div>
        <div className="bg-[#0d1531] border border-[#2D2755] rounded-2xl flex-1 flex flex-col overflow-y-auto">
          {renderTimelineContent()}
        </div>
      </div>
    );
  }

  // Else, Admins/Doctors see a full page paginated table list with popup modal detail trigger
  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-[#131e3a] text-slate-100 p-6 space-y-4 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
          <ClipboardList className="h-8 w-8 text-[#4F83FF]" /> Patient History Registry
        </h1>
        <p className="text-[#D1D5DB] text-sm">
          Manage and review complete timeline histories, diagnostic reports, and AI clinical summaries for hospital patients.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#051650]/10 border border-[#2D2755] p-4 rounded-2xl backdrop-blur-sm flex-shrink-0">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search patient by name or phone..."
            value={patientSearch}
            onChange={e => setPatientSearch(e.target.value)}
            className="w-full bg-[#182247]/50 border border-[#2D2755] rounded-xl pl-9 pr-4 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-300 font-medium">Patient Type:</span>
            <select
              value={typeFilterSelect}
              onChange={e => setTypeFilterSelect(e.target.value)}
              className="bg-[#182247]/50 border border-[#2D2755] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Types</option>
              <option value="outpatient">Outpatient</option>
              <option value="inpatient">Inpatient</option>
              <option value="icu">ICU</option>
            </select>
          </div>

          {/* Doctor filter only for hospital_admin */}
          {user?.role === "hospital_admin" && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-300 font-medium">Doctor:</span>
              <select
                value={doctorFilterSelect}
                onChange={e => setDoctorFilterSelect(e.target.value)}
                className="bg-[#182247]/50 border border-[#2D2755] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 max-w-[200px]"
              >
                <option value="all">All Doctors</option>
                {uniqueDoctors.map(docName => (
                  <option key={docName} value={docName}>{docName}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Patients List Table — overflow:auto on single wrapper enables sticky thead + horizontal scroll */}
      <div className="flex-1 min-h-0 bg-[#051650]/10 border border-[#2D2755] rounded-2xl backdrop-blur-sm overflow-auto">
        {loadingPatients ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-400" />
          </div>
        ) : paginatedPatients.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            No patient records match the filters.
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead className="sticky top-0 z-20 bg-[#0c132f]">
              <tr className="border-b border-[#2D2755]">
                <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-[#A0AEC0]">Patient Name</th>
                <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-[#A0AEC0]">Phone</th>
                <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-[#A0AEC0] text-center">Blood Group</th>
                <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-[#A0AEC0] text-center">Patient Type</th>
                {user?.role === "hospital_admin" && (
                  <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-[#A0AEC0]">Consulting Doctor</th>
                )}
                <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-[#A0AEC0]">Current Condition</th>
                <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-[#A0AEC0] text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPatients.map(p => (
                <tr key={p.id} className="border-b border-[#2D2755]/50 hover:bg-[#051650]/20 transition-colors">
                  <td className="py-3.5 px-4 text-white font-semibold">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-indigo-600/20 text-indigo-300 flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {p.full_name ? p.full_name[0].toUpperCase() : "P"}
                      </div>
                      <div>
                        <p className="leading-tight text-sm">{p.full_name}</p>
                        {p.email && <p className="text-[10px] text-slate-400 font-normal">{p.email}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 text-xs whitespace-nowrap">{p.phone || "—"}</td>
                  <td className="py-3.5 px-4 text-center text-xs">
                    {p.blood_group
                      ? <span className="px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/20 text-xs font-bold tracking-wide">{p.blood_group}</span>
                      : <span className="text-slate-500">—</span>
                    }
                  </td>
                  <td className="py-3.5 px-4 text-center text-xs">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase border ${
                      p.patient_type === "icu" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                      p.patient_type === "inpatient" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                      "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    }`}>
                      {p.patient_type}
                    </span>
                  </td>
                  {user?.role === "hospital_admin" && (
                    <td className="py-3.5 px-4 text-slate-300 text-xs whitespace-nowrap">{p.doctor_name || "—"}</td>
                  )}
                  <td className="py-3.5 px-4 text-slate-300 text-xs">
                    <div className="truncate max-w-[180px]" title={p.current_condition || ""}>
                      {p.current_condition || "—"}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => {
                        setSelectedPatientId(p.id);
                        setIsModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all shadow-md shadow-indigo-600/10"
                    >
                      <Clock className="h-3.5 w-3.5" /> Show History
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

      </div>

      {/* Pagination controls */}
      {totalPages > 0 && (
        <div className="flex items-center justify-between bg-[#051650]/5 border border-[#2D2755]/50 p-4 rounded-xl flex-shrink-0">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-xs font-semibold bg-[#182247] hover:bg-[#202e5c] disabled:opacity-40 text-slate-300 border border-[#2D2755] rounded-xl transition-all"
          >
            Previous
          </button>
          <span className="text-xs text-slate-400">
            Page {currentPage} of {totalPages} &nbsp;·&nbsp; {filteredPatients.length} patients
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-xs font-semibold bg-[#182247] hover:bg-[#202e5c] disabled:opacity-40 text-slate-300 border border-[#2D2755] rounded-xl transition-all"
          >
            Next
          </button>
        </div>
      )}

      {/* Timeline Modal Popup */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#0b122b] border border-[#2D2755] w-full max-w-5xl h-[90vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#2D2755] bg-[#101935]">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-indigo-400" />
                Clinical History Timeline
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-[#182247] transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto bg-[#0d1531]">
              {renderTimelineContent()}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#2D2755] bg-[#101935] flex justify-end">
              <button
                onClick={handleCloseModal}
                className="px-5 py-2 text-sm font-semibold bg-[#182247] text-[#D1D5DB] rounded-xl hover:bg-[#202e5c] transition-all border border-[#2D2755]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Viewer Modal */}
      <Dialog open={!!pdfUrl} onOpenChange={(open) => { if (!open) closePdf(); }}>
        <DialogContent className="max-w-5xl w-full h-[90vh] bg-[#0d1b35] border-[#2D2755] p-0 flex flex-col z-[60]">
          <DialogHeader className="px-4 py-3 border-b border-[#2D2755] flex-row items-center justify-between space-y-0">
            <DialogTitle className="text-white text-base font-semibold truncate max-w-lg">
              {pdfTitle}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <a
                href={pdfUrl || "#"}
                target="_blank"
                rel="noreferrer"
                className="text-[#D1D5DB] hover:text-white transition-colors"
                title="Open in new tab"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
              <button
                onClick={closePdf}
                className="text-[#D1D5DB] hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            {pdfUrl && (
              <iframe
                src={pdfUrl}
                className="w-full h-full border-0"
                title={pdfTitle}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
