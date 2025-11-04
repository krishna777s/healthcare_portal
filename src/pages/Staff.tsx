import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, User } from "lucide-react";

const staffMembers = [
  { name: "Dr. Sarah Johnson", role: "Senior Oncologist", department: "Oncology", experience: "15 years", status: "Active" },
  { name: "Dr. Michael Chen", role: "Head Radiologist", department: "Radiology", experience: "12 years", status: "Active" },
  { name: "Dr. Emily Rodriguez", role: "Chief Pathologist", department: "Pathology", experience: "18 years", status: "Active" },
  { name: "Dr. James Wilson", role: "Cardiologist", department: "Cardiology", experience: "10 years", status: "Active" },
  { name: "Dr. Lisa Anderson", role: "Neurologist", department: "Neurology", experience: "8 years", status: "Active" },
  { name: "Dr. David Martinez", role: "Pediatrician", department: "Pediatrics", experience: "14 years", status: "Active" },
];

export default function Staff() {
  return (
    <div className="p-6 space-y-6 animate-fade-in bg-[#131e3a] text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Doctors & Staff</h1>
          <p className="text-[#D1D5DB]">Manage healthcare professionals directory</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" />
          Add Staff
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#D1D5DB]" />
        <Input placeholder="Search staff by name or department..." className="pl-10 bg-background/50 border-border" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staffMembers.map((staff, index) => (
          <Card 
            key={staff.name}
            className="border-[#2D2755] bg-[#051650]/10/60 backdrop-blur-sm hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 hover:scale-105 animate-slide-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white">{staff.name}</h3>
                  <p className="text-sm text-[#D1D5DB]">{staff.role}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#D1D5DB]">Department</span>
                  <Badge variant="outline" className="border-primary text-primary">{staff.department}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#D1D5DB]">Experience</span>
                  <span className="text-sm font-medium text-white">{staff.experience}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#D1D5DB]">Status</span>
                  <Badge className="bg-green-500/20 text-green-500">{staff.status}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
