import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Handshake, Building2, FileText, Users, Plus } from "lucide-react";

const collaborations = [
  { 
    name: "Research Institute Alpha", 
    type: "Research Partnership", 
    projects: 3, 
    members: 12, 
    status: "Active",
    description: "Joint oncology research and clinical trials"
  },
  { 
    name: "Medical University Beta", 
    type: "Academic Collaboration", 
    projects: 5, 
    members: 24, 
    status: "Active",
    description: "Medical education and training programs"
  },
  { 
    name: "City Hospital Network", 
    type: "Hospital Alliance", 
    projects: 2, 
    members: 8, 
    status: "Active",
    description: "Resource sharing and patient referrals"
  },
  { 
    name: "Biotech Labs Gamma", 
    type: "Technology Partner", 
    projects: 4, 
    members: 15, 
    status: "Active",
    description: "AI diagnostics and lab automation"
  },
];

export default function Collaborations() {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Collaborations & Partners</h1>
          <p className="text-muted-foreground">Manage partnerships and collaborative projects</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" />
          New Partnership
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {collaborations.map((collab, index) => (
          <Card 
            key={collab.name}
            className="border-border bg-card/60 backdrop-blur-sm hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 animate-slide-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Handshake className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{collab.name}</h3>
                    <p className="text-sm text-muted-foreground">{collab.type}</p>
                  </div>
                </div>
                <Badge className="bg-green-500/20 text-green-500">{collab.status}</Badge>
              </div>

              <p className="text-sm text-muted-foreground mb-4">{collab.description}</p>

              <div className="flex items-center gap-6 mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{collab.projects}</span> Projects
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{collab.members}</span> Members
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-border">
                <Button variant="outline" size="sm" className="flex-1 border-border hover:bg-accent">
                  <Building2 className="h-4 w-4 mr-2" />
                  View Details
                </Button>
                <Button variant="outline" size="sm" className="border-border hover:bg-accent">
                  Projects
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
