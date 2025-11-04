import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FlaskConical, FileText, Calendar, TrendingUp } from "lucide-react";

const diagnostics = [
  { id: "LAB-2024-001", type: "Blood Test", patient: "John Doe", doctor: "Dr. Sarah Johnson", date: "2024-01-15", status: "Completed", aiAnalysis: "Normal" },
  { id: "LAB-2024-002", type: "X-Ray", patient: "Jane Smith", doctor: "Dr. Michael Chen", date: "2024-01-14", status: "In Progress", aiAnalysis: "Pending" },
  { id: "LAB-2024-003", type: "MRI Scan", patient: "Robert Williams", doctor: "Dr. Lisa Anderson", date: "2024-01-13", status: "Completed", aiAnalysis: "Abnormal" },
  { id: "LAB-2024-004", type: "CT Scan", patient: "Maria Garcia", doctor: "Dr. James Wilson", date: "2024-01-12", status: "Completed", aiAnalysis: "Normal" },
  { id: "LAB-2024-005", type: "Biopsy", patient: "William Brown", doctor: "Dr. Emily Rodriguez", date: "2024-01-11", status: "In Progress", aiAnalysis: "Pending" },
  { id: "LAB-2024-006", type: "Ultrasound", patient: "Emma Davis", doctor: "Dr. David Martinez", date: "2024-01-10", status: "Completed", aiAnalysis: "Normal" },
];

export default function Diagnostics() {
  return (
    <div className="p-6 space-y-6 animate-fade-in bg-[#131e3a] text-white">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Diagnostics & Labs</h1>
        <p className="text-[#D1D5DB]">Laboratory reports and AI-powered analysis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {diagnostics.map((lab, index) => (
          <Card 
            key={lab.id}
            className="border-[#2D2755] bg-[#051650]/10/60 backdrop-blur-sm hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 animate-slide-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <FlaskConical className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{lab.type}</h3>
                    <p className="text-sm text-[#D1D5DB]">{lab.id}</p>
                  </div>
                </div>
                <Badge className={
                  lab.status === "Completed" ? "bg-green-500/20 text-green-500" : "bg-yellow-500/20 text-yellow-500"
                }>
                  {lab.status}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#D1D5DB]">Patient</span>
                  <span className="font-medium text-white">{lab.patient}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#D1D5DB]">Doctor</span>
                  <span className="font-medium text-white">{lab.doctor}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-[#D1D5DB]" />
                  <span className="text-[#D1D5DB]">Date:</span>
                  <span className="text-white">{lab.date}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#2D2755]">
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="text-[#D1D5DB]">AI Analysis:</span>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={
                      lab.aiAnalysis === "Normal" ? "border-green-500 text-green-500" :
                      lab.aiAnalysis === "Abnormal" ? "border-red-500 text-red-500" :
                      "border-yellow-500 text-yellow-500"
                    }
                  >
                    {lab.aiAnalysis}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t border-[#2D2755]">
                <Button className="flex-1 bg-primary hover:bg-primary/90 text-white">
                  <FileText className="h-4 w-4 mr-2" />
                  View Report
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
