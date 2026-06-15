import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FlaskConical, X, ExternalLink } from "lucide-react";
import { useAdminDiagnostics } from "@/hooks/useAdminData";
import { Skeleton } from "@/components/ui/skeleton";
import { getFileUrl } from "@/lib/api";

const priorityColor: Record<string, string> = {
  high: "bg-red-500/20 text-red-400",
  normal: "bg-blue-500/20 text-blue-400",
  low: "bg-gray-500/20 text-gray-400",
};

const statusColor: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400",
  available: "bg-green-500/20 text-green-400",
  reviewed: "bg-blue-500/20 text-blue-400",
};

export default function Diagnostics() {
  const { data: reports = [], isLoading } = useAdminDiagnostics();
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

  return (
    <div className="p-6 space-y-6 animate-fade-in bg-[#131e3a] text-white">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Diagnostics &amp; Lab Reports</h1>
        <p className="text-[#D1D5DB]">All lab reports — live from database</p>
      </div>

      <Card className="border-[#2D2755] bg-[#051650]/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FlaskConical className="h-5 w-5" />
            Lab Reports ({reports.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-lg bg-[#1e2d4d]" />
              ))}
            </div>
          ) : reports.length === 0 ? (
            <p className="text-center py-10 text-[#D1D5DB]">No lab reports found. Add seed data in pgAdmin.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2D2755]">
                    {["Report", "Type", "Patient", "Doctor", "Requested", "Result Date", "Priority"].map((h) => (
                      <th key={h} className="text-left py-3 px-3 text-[#D1D5DB] font-medium text-sm">{h}</th>
                    ))}
                    <th className="text-left py-3 px-3 text-[#D1D5DB] font-medium text-sm">
                      <span title="Whether the lab result is Available, Pending, or Reviewed">Status ⓘ</span>
                    </th>
                    <th className="text-left py-3 px-3 text-[#D1D5DB] font-medium text-sm">Report File</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r: any) => (
                    <tr key={r.id} className="border-b border-[#2D2755]/50 hover:bg-[#051650]/20 transition-colors">
                      <td className="py-3 px-3 text-white text-sm">{r.report_name}</td>
                      <td className="py-3 px-3 text-[#D1D5DB] text-sm capitalize">{r.report_type?.replace("_", " ") || "—"}</td>
                      <td className="py-3 px-3 text-[#D1D5DB] text-sm">{r.patient_name || "—"}</td>
                      <td className="py-3 px-3 text-[#D1D5DB] text-sm">{r.doctor_name || "—"}</td>
                      <td className="py-3 px-3 text-[#D1D5DB] text-sm">{r.requested_date || "—"}</td>
                      <td className="py-3 px-3 text-[#D1D5DB] text-sm">{r.result_date || "—"}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-1 rounded-full text-xs capitalize ${priorityColor[r.priority] || "bg-gray-500/20 text-gray-400"}`}>
                          {r.priority}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-1 rounded-full text-xs capitalize ${statusColor[r.status] || "bg-gray-500/20 text-gray-400"}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {r.file_url ? (
                          <button
                            onClick={() => openPdf(getFileUrl(r.file_url) || "", r.report_name)}
                            className="text-[#4F83FF] hover:text-[#6B9FFF] text-sm underline cursor-pointer"
                          >
                            View Report
                          </button>
                        ) : (
                          <span className="text-[#D1D5DB] text-xs">Not uploaded</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* PDF Viewer Modal */}
      <Dialog open={!!pdfUrl} onOpenChange={(open) => { if (!open) closePdf(); }}>
        <DialogContent className="max-w-5xl w-full h-[90vh] bg-[#0d1b35] border-[#2D2755] p-0 flex flex-col">
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
