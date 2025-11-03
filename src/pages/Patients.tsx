import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, UserCircle, Calendar, FileText } from "lucide-react";

const patients = [
  { name: "John Doe", id: "P-2024-001", doctor: "Dr. Sarah Johnson", department: "Oncology", lastVisit: "2024-01-15", status: "Under Treatment" },
  { name: "Jane Smith", id: "P-2024-002", doctor: "Dr. Michael Chen", department: "Radiology", lastVisit: "2024-01-14", status: "Follow-up" },
  { name: "Robert Williams", id: "P-2024-003", doctor: "Dr. Emily Rodriguez", department: "Pathology", lastVisit: "2024-01-13", status: "Under Treatment" },
  { name: "Maria Garcia", id: "P-2024-004", doctor: "Dr. James Wilson", department: "Cardiology", lastVisit: "2024-01-12", status: "Recovery" },
  { name: "William Brown", id: "P-2024-005", doctor: "Dr. Lisa Anderson", department: "Neurology", lastVisit: "2024-01-11", status: "Under Treatment" },
  { name: "Emma Davis", id: "P-2024-006", doctor: "Dr. David Martinez", department: "Pediatrics", lastVisit: "2024-01-10", status: "Follow-up" },
];

export default function Patients() {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Patients</h1>
        <p className="text-muted-foreground">Manage patient records and information</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search patients by name or ID..." className="pl-10 bg-background/50 border-border" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {patients.map((patient, index) => (
          <Card 
            key={patient.id}
            className="border-border bg-card/60 backdrop-blur-sm hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 animate-slide-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <UserCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{patient.name}</h3>
                    <p className="text-sm text-muted-foreground">{patient.id}</p>
                  </div>
                </div>
                <Badge className="bg-blue-500/20 text-blue-500">{patient.status}</Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Attending Doctor</span>
                  <span className="font-medium text-foreground">{patient.doctor}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Department</span>
                  <Badge variant="outline" className="border-primary text-primary">{patient.department}</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Last Visit:</span>
                  <span className="text-foreground">{patient.lastVisit}</span>
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium transition-colors">
                  <FileText className="h-4 w-4" />
                  View Records
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
