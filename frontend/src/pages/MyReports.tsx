import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ExternalLink, Calendar, AlertCircle } from "lucide-react";
import { useMyReports } from "@/hooks/usePatientData";
import { Skeleton } from "@/components/ui/skeleton";

export default function MyReports() {
  const { data: reports = [], isLoading } = useMyReports();

  return (
    <div className="p-6 space-y-6 animate-fade-in bg-[#131e3a] text-white">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">My Reports</h1>
        <p className="text-[#D1D5DB]">View and access your test results and lab reports</p>
      </div>

      {/* Reports Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48 bg-[#1e2d4d] rounded-xl" />)}
        </div>
      ) : reports.length === 0 ? (
        <Card className="border-[#2D2755] bg-[#051650]/10 backdrop-blur-sm p-6 text-center">
          <AlertCircle className="h-10 w-10 text-[#4F83FF] mx-auto mb-2 animate-bounce" />
          <p className="text-[#D1D5DB]">No lab reports available yet.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reports.map((report: any) => (
            <Card key={report.id} className="border-[#2D2755] bg-[#051650]/10 backdrop-blur-sm hover:bg-[#051650]/20 transition-all hover:shadow-lg hover:shadow-primary/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  {report.report_name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#D1D5DB]">Type:</span>
                    <span className="text-white capitalize">{report.report_type?.replace("_", " ")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#D1D5DB]">Requested Date:</span>
                    <span className="text-white flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {report.requested_date || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#D1D5DB]">Result Date:</span>
                    <span className="text-white flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {report.result_date || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#D1D5DB]">Doctor:</span>
                    <span className="text-white">{report.doctor_name || "—"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#D1D5DB]">Priority:</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${
                      report.priority === 'high'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {report.priority}
                    </span>
                  </div>
                  {report.notes && (
                    <div className="pt-2 border-t border-[#2D2755]/50">
                      <p className="text-xs text-[#9CA3AF] italic">Notes: {report.notes}</p>
                    </div>
                  )}
                </div>

                {report.file_url && (
                  <div className="pt-3 border-t border-[#2D2755]">
                    <a
                      href={`http://localhost:8000${report.file_url}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-[#4F83FF]/20 hover:bg-[#4F83FF]/30 text-[#4F83FF] transition-colors text-sm font-medium"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View Document
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
