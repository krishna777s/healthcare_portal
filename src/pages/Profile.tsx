import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Phone, Calendar, MapPin, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Profile() {
  const { user } = useAuth();
  
  // Mock profile data based on role
  const profileData = {
    name: user?.name || "User Name",
    email: user?.email || "user@example.com",
    phone: "+1 (555) 123-4567",
    dateOfBirth: "1978-05-15",
    address: "123 Main Street, City, State 12345",
    bloodGroup: "O+",
    emergencyContact: "+1 (555) 987-6543",
    role: user?.role || "user",
  };

  const isDoctorOrAdmin = user?.role === 'doctor' || user?.role === 'hospital_admin';

  return (
    <div className="p-6 space-y-6 animate-fade-in bg-[#131e3a] text-white">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
        <p className="text-[#D1D5DB]">Manage your personal information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="border-[#2D2755] bg-[#051650]/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Picture
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="h-16 w-16 text-primary" />
            </div>
            <button className="px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-colors text-sm font-medium">
              Change Photo
            </button>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="lg:col-span-2 border-[#2D2755] bg-[#051650]/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-[#D1D5DB]">Full Name</label>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-[#051650]/30 border border-[#2D2755]">
                  <User className="h-4 w-4 text-[#D1D5DB]" />
                  <span className="text-white">{profileData.name}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm text-[#D1D5DB]">Email</label>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-[#051650]/30 border border-[#2D2755]">
                  <Mail className="h-4 w-4 text-[#D1D5DB]" />
                  <span className="text-white">{profileData.email}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm text-[#D1D5DB]">Phone</label>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-[#051650]/30 border border-[#2D2755]">
                  <Phone className="h-4 w-4 text-[#D1D5DB]" />
                  <span className="text-white">{profileData.phone}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm text-[#D1D5DB]">Date of Birth</label>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-[#051650]/30 border border-[#2D2755]">
                  <Calendar className="h-4 w-4 text-[#D1D5DB]" />
                  <span className="text-white">{profileData.dateOfBirth}</span>
                </div>
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm text-[#D1D5DB]">Address</label>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-[#051650]/30 border border-[#2D2755]">
                  <MapPin className="h-4 w-4 text-[#D1D5DB]" />
                  <span className="text-white">{profileData.address}</span>
                </div>
              </div>

              {!isDoctorOrAdmin && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm text-[#D1D5DB]">Blood Group</label>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-[#051650]/30 border border-[#2D2755]">
                      <Shield className="h-4 w-4 text-[#D1D5DB]" />
                      <span className="text-white">{profileData.bloodGroup}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm text-[#D1D5DB]">Emergency Contact</label>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-[#051650]/30 border border-[#2D2755]">
                      <Phone className="h-4 w-4 text-[#D1D5DB]" />
                      <span className="text-white">{profileData.emergencyContact}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="flex gap-3 pt-4">
              <button className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors font-medium">
                Edit Profile
              </button>
              <button className="px-4 py-2 bg-[#051650]/30 hover:bg-[#051650]/50 text-white rounded-lg transition-colors border border-[#2D2755] font-medium">
                Change Password
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
