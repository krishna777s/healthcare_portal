import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, Calendar } from "lucide-react";

const reports = [
  { id: 1, name: "Blood Test Report", type: "Lab Report", date: "2026-01-28", doctor: "Dr. Sarah Johnson", status: "Available", result: "Normal" },
  { id: 2, name: "ECG Report", type: "Diagnostic", date: "2026-01-25", doctor: "Dr. Sarah Johnson", status: "Available", result: "Normal" },
  { id: 3, name: "X-Ray Report", type: "Imaging", date: "2026-01-20", doctor: "Dr. Michael Chen", status: "Available", result: "No Abnormalities" },
  { id: 4, name: "MRI Scan", type: "Imaging", date: "2026-01-15", doctor: "Dr. Sarah Johnson", status: "Available", result: "Under Review" },
  { id: 5, name: "Lipid Profile", type: "Lab Report", date: "2026-01-10", doctor: "Dr. Sarah Johnson", status: "Available", result: "Normal" },
  { id: 6, name: "Urinalysis", type: "Lab Report", date: "2026-01-05", doctor: "Dr. Michael Chen", status: "Available", result: "Normal" },
];

export default function MyReports() {
  return (
    <div className="p-6 space-y-6 animate-fade-in bg-[#131e3a] text-white">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">My Reports</h1>
        <p className="text-[#D1D5DB]">View and download your test results and lab reports</p>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report) => (
          <Card key={report.id} className="border-[#2D2755] bg-[#051650]/10 backdrop-blur-sm hover:bg-[#051650]/20 transition-all hover:shadow-lg hover:shadow-primary/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                {report.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#D1D5DB]">Type:</span>
                  <span className="text-white">{report.type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#D1D5DB]">Date:</span>
                  <span className="text-white flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {report.date}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#D1D5DB]">Doctor:</span>
                  <span className="text-white">{report.doctor}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#D1D5DB]">Result:</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    report.result === 'Normal' || report.result === 'No Abnormalities' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {report.result}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2 pt-3 border-t border-[#2D2755]">
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-[#4F83FF]/20 hover:bg-[#4F83FF]/30 text-[#4F83FF] transition-colors">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm font-medium">View</span>
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-[#4F83FF]/20 hover:bg-[#4F83FF]/30 text-[#4F83FF] transition-colors">
                  <Download className="h-4 w-4" />
                  <span className="text-sm font-medium">Download</span>
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
