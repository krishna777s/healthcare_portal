import { useNavigate } from "react-router-dom";
import { Building2, Stethoscope, UserCircle, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const roles = [
  {
    id: "hospital_admin",
    title: "Hospital Admin Login",
    description: "Manage hospital operations, staff, and departments",
    icon: Building2,
    color: "hsl(228, 100%, 56%)", // Blue
  },
  {
    id: "doctor",
    title: "Doctor Login",
    description: "Access patient records, appointments, and reports",
    icon: Stethoscope,
    color: "hsl(280, 80%, 60%)", // Purple
  },
  {
    id: "patient",
    title: "Patient Login",
    description: "View your health records, appointments, and reports",
    icon: UserCircle,
    color: "hsl(190, 100%, 50%)", // Cyan
  },
];

export default function RoleSelection() {
  const navigate = useNavigate();

  const handleRoleSelect = (roleId: string) => {
    navigate(`/auth?role=${roleId}`);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#131e3a] p-6">
      <div className="w-full max-w-2xl space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white">Welcome to Cerevyn EMP</h1>
          <p className="text-[#D1D5DB] text-lg">Select your role to continue</p>
        </div>

        {/* Role Cards */}
        <div className="space-y-4">
          {roles.map((role, index) => {
            const Icon = role.icon;
            return (
              <Card
                key={role.id}
                onClick={() => handleRoleSelect(role.id)}
                className="border-2 border-[#2D2755] bg-[#051650]/20 backdrop-blur-sm hover:bg-[#051650]/40 hover:border-[#4F83FF] transition-all duration-300 cursor-pointer group animate-slide-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div
                      className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${role.color}20` }}
                    >
                      <Icon className="w-8 h-8" style={{ color: role.color }} />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-1 group-hover:text-[#4F83FF] transition-colors">
                        {role.title}
                      </h3>
                      <p className="text-[#D1D5DB] text-sm">{role.description}</p>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="w-6 h-6 text-[#D1D5DB] group-hover:text-[#4F83FF] group-hover:translate-x-1 transition-all" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-[#D1D5DB] text-sm">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/auth?signup=true")}
              className="text-[#4F83FF] hover:text-[#6B9FFF] font-medium transition-colors underline"
            >
              Sign up here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
