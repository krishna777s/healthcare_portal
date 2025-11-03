import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, FileText, MapPin, Phone, Mail, Building2 } from "lucide-react";

const entities = [
  {
    id: 1,
    name: "City General Hospital",
    registrationId: "REG-2024-001",
    address: "123 Healthcare Ave, Medical District",
    contact: "+91 98765 43210",
    email: "contact@citygeneral.com",
    departments: 12,
    staff: 245,
    status: "Active",
  },
  {
    id: 2,
    name: "Advanced Medical Center",
    registrationId: "REG-2024-002",
    address: "456 Wellness Road, Health Zone",
    contact: "+91 98765 43211",
    email: "info@advancedmedical.com",
    departments: 8,
    staff: 156,
    status: "Active",
  },
  {
    id: 3,
    name: "Central Diagnostic Lab",
    registrationId: "REG-2024-003",
    address: "789 Lab Street, Research Park",
    contact: "+91 98765 43212",
    email: "lab@centraldiag.com",
    departments: 5,
    staff: 89,
    status: "Active",
  },
];

export default function Entities() {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Entity Management</h1>
          <p className="text-muted-foreground">Manage hospital entities and their information</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4 mr-2" />
          Add Entity
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search entities by name or registration ID..."
          className="pl-10 bg-background/50 border-border"
        />
      </div>

      {/* Entities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {entities.map((entity, index) => (
          <Card 
            key={entity.id} 
            className="border-border bg-card/60 backdrop-blur-sm hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 animate-slide-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-foreground mb-1">{entity.name}</CardTitle>
                    <Badge variant="outline" className="border-primary text-primary">
                      {entity.registrationId}
                    </Badge>
                  </div>
                </div>
                <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30">
                  {entity.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{entity.address}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{entity.contact}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{entity.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-border">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{entity.departments}</div>
                  <div className="text-xs text-muted-foreground">Departments</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{entity.staff}</div>
                  <div className="text-xs text-muted-foreground">Staff</div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1 border-border hover:bg-accent">
                  <FileText className="h-4 w-4 mr-2" />
                  View Details
                </Button>
                <Button variant="outline" size="sm" className="border-border hover:bg-accent">
                  Documents
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
