import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stethoscope, Users, Activity } from "lucide-react";

const departments = [
  { name: "Oncology", staff: 45, patients: 1250, specialty: "Cancer Treatment", color: "hsl(228, 100%, 56%)" },
  { name: "Radiology", staff: 32, patients: 890, specialty: "Imaging & Diagnostics", color: "hsl(190, 100%, 50%)" },
  { name: "Pathology", staff: 28, patients: 670, specialty: "Laboratory Medicine", color: "hsl(280, 80%, 60%)" },
  { name: "Cardiology", staff: 38, patients: 920, specialty: "Heart Care", color: "hsl(40, 100%, 60%)" },
  { name: "Neurology", staff: 30, patients: 580, specialty: "Brain & Nervous System", color: "hsl(160, 70%, 50%)" },
  { name: "Pediatrics", staff: 42, patients: 1100, specialty: "Child Healthcare", color: "hsl(320, 80%, 60%)" },
];

export default function Departments() {
  return (
    <div className="p-6 space-y-6 animate-fade-in bg-[#131e3a] text-white">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Departments</h1>
        <p className="text-[#D1D5DB]">Manage hospital departments and specializations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept, index) => (
          <Card 
            key={dept.name}
            className="border-[#2D2755] bg-[#051650]/10 backdrop-blur-sm hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 hover:scale-105 animate-slide-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${dept.color}20` }}>
                  <Stethoscope className="h-6 w-6" style={{ color: dept.color }} />
                </div>
                <Badge variant="outline" className="border-primary text-primary">Active</Badge>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-1">{dept.name}</h3>
              <p className="text-sm text-[#D1D5DB] mb-4">{dept.specialty}</p>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#D1D5DB]" />
                    <span className="text-[#D1D5DB]">Staff</span>
                  </div>
                  <span className="font-semibold text-white">{dept.staff}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-[#D1D5DB]" />
                    <span className="text-[#D1D5DB]">Patients</span>
                  </div>
                  <span className="font-semibold text-white">{dept.patients}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
