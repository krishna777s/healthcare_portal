import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Phone, Mail, Building2, Calendar, Users, Stethoscope, Pencil } from "lucide-react";
import { useAdminStats } from "@/hooks/useAdminData";
import { Skeleton } from "@/components/ui/skeleton";

// Static hospital info (editable locally; would be a separate API endpoint in production)
const DEFAULT_INFO = {
  name: "Cerevyn Medical Center",
  registrationId: "REG-2024-001",
  establishedDate: "January 2020",
  address: "123 Healthcare Avenue, Medical District, City - 560001",
  contact: "+91 98765 43210",
  email: "contact@cerevyn.com",
  status: "Active",
  accreditation: "NABH Certified",
};

export default function Entities() {
  const { data: stats, isLoading } = useAdminStats();

  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({ ...DEFAULT_INFO });
  const [saved, setSaved] = useState({ ...DEFAULT_INFO });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved({ ...form });
    setEditOpen(false);
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in bg-[#131e3a] text-white">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Hospital Information</h1>
        <p className="text-[#D1D5DB]">Basic details and information about your hospital</p>
      </div>

      {/* Hospital Details Card */}
      <Card className="border-[#2D2755] bg-[#051650]/10 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl text-white mb-2">{saved.name}</CardTitle>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="border-primary text-primary">
                    {saved.registrationId}
                  </Badge>
                  <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30">
                    {saved.status}
                  </Badge>
                  <Badge variant="outline" className="border-accent text-accent">
                    {saved.accreditation}
                  </Badge>
                </div>
              </div>
            </div>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => { setForm({ ...saved }); setEditOpen(true); }}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit Entities
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-[#D1D5DB] mt-0.5" />
                <div>
                  <div className="text-sm text-[#D1D5DB]">Address</div>
                  <div className="text-white">{saved.address}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-[#D1D5DB] mt-0.5" />
                <div>
                  <div className="text-sm text-[#D1D5DB]">Phone</div>
                  <div className="text-white">{saved.contact}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-[#D1D5DB] mt-0.5" />
                <div>
                  <div className="text-sm text-[#D1D5DB]">Email</div>
                  <div className="text-white">{saved.email}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-[#D1D5DB] mt-0.5" />
                <div>
                  <div className="text-sm text-[#D1D5DB]">Established</div>
                  <div className="text-white">{saved.establishedDate}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics — LIVE from DB */}
          <div className="pt-6 border-t border-border">
            <h3 className="text-lg font-semibold text-white mb-3">
              Hospital Statistics
              <span className="ml-2 text-xs font-normal text-green-400">● Live</span>
            </h3>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 rounded-xl bg-[#1e2d4d]" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Stethoscope className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{stats?.total_departments ?? "—"}</div>
                    <div className="text-sm text-[#D1D5DB]">Departments</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {stats ? stats.total_doctors + stats.total_staff : "—"}
                    </div>
                    <div className="text-sm text-[#D1D5DB]">Doctors & Staff</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{stats?.total_patients ?? "—"}</div>
                    <div className="text-sm text-[#D1D5DB]">Active Patients</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Entities Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[520px] bg-[#0d1b35] border-[#2D2755] text-white">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">Edit Hospital Information</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label className="text-[#D1D5DB]">Hospital Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="bg-[#051650]/30 border-[#2D2755] text-white"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[#D1D5DB]">Address</Label>
              <Input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="bg-[#051650]/30 border-[#2D2755] text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[#D1D5DB]">Phone</Label>
                <Input
                  value={form.contact}
                  onChange={(e) => setForm({ ...form, contact: e.target.value })}
                  className="bg-[#051650]/30 border-[#2D2755] text-white"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[#D1D5DB]">Email</Label>
                <Input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="bg-[#051650]/30 border-[#2D2755] text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[#D1D5DB]">Accreditation</Label>
                <Input
                  value={form.accreditation}
                  onChange={(e) => setForm({ ...form, accreditation: e.target.value })}
                  className="bg-[#051650]/30 border-[#2D2755] text-white"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[#D1D5DB]">Established Date</Label>
                <Input
                  value={form.establishedDate}
                  onChange={(e) => setForm({ ...form, establishedDate: e.target.value })}
                  className="bg-[#051650]/30 border-[#2D2755] text-white"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-white">
                Save Changes
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-[#2D2755] text-[#D1D5DB] hover:bg-[#051650]/30"
                onClick={() => setEditOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
