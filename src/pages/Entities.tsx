import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, MapPin, Phone, Mail, Building2, Calendar, Users, Stethoscope } from "lucide-react";

const hospitalData = {
  name: "Cerevyn Medical Center",
  registrationId: "REG-2024-001",
  establishedDate: "January 2020",
  address: "123 Healthcare Avenue, Medical District, City - 560001",
  contact: "+91 98765 43210",
  email: "contact@cerevyn.com",
  website: "www.cerevyn.com",
  departments: 12,
  staff: 248,
  activePatients: 1456,
  status: "Active",
  accreditation: "NABH Certified",
};

export default function Entities() {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Hospital Information</h1>
        <p className="text-muted-foreground">Basic details and information about your hospital</p>
      </div>

      {/* Hospital Details Card */}
      <Card className="border-border bg-card/60 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl text-foreground mb-2">{hospitalData.name}</CardTitle>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="border-primary text-primary">
                    {hospitalData.registrationId}
                  </Badge>
                  <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30">
                    {hospitalData.status}
                  </Badge>
                  <Badge variant="outline" className="border-accent text-accent">
                    {hospitalData.accreditation}
                  </Badge>
                </div>
              </div>
            </div>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <FileText className="h-4 w-4 mr-2" />
              Edit Details
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm text-muted-foreground">Address</div>
                  <div className="text-foreground">{hospitalData.address}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm text-muted-foreground">Phone</div>
                  <div className="text-foreground">{hospitalData.contact}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm text-muted-foreground">Email</div>
                  <div className="text-foreground">{hospitalData.email}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm text-muted-foreground">Established</div>
                  <div className="text-foreground">{hospitalData.establishedDate}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="pt-6 border-t border-border">
            <h3 className="text-lg font-semibold text-foreground mb-3">Hospital Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Stethoscope className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{hospitalData.departments}</div>
                  <div className="text-sm text-muted-foreground">Departments</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{hospitalData.staff}</div>
                  <div className="text-sm text-muted-foreground">Doctors & Staff</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{hospitalData.activePatients}</div>
                  <div className="text-sm text-muted-foreground">Active Patients</div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="border-border hover:bg-accent">
              <FileText className="h-4 w-4 mr-2" />
              View Documents
            </Button>
            <Button variant="outline" className="border-border hover:bg-accent">
              Upload Certificate
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
