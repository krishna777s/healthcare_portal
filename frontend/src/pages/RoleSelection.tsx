import { useNavigate } from "react-router-dom";
import { Building2, Stethoscope, UserCircle, Pill, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const roles = [
  {
    id: "hospital_admin",
    title: "Hospital Admin Login",
    description: "Manage hospital operations, staff, departments, and pharmacy orders",
    icon: Building2,
    color: "hsl(228, 100%, 56%)",
    pill: null,
  },
  {
    id: "doctor",
    title: "Doctor Login",
    description: "Access patient records, appointments, ICU alerts, and prescriptions",
    icon: Stethoscope,
    color: "hsl(280, 80%, 60%)",
    pill: null,
  },
  {
    id: "patient",
    title: "Patient Login",
    description: "View your health records, appointments, lab reports, and prescriptions",
    icon: UserCircle,
    color: "hsl(190, 100%, 50%)",
    pill: null,
  },
  {
    id: "pharmacy",
    title: "Pharmacy Staff Login",
    description: "Manage prescription orders — mark medicines ready and dispense to patients",
    icon: Pill,
    color: "hsl(150, 70%, 45%)",
    pill: "Rx",
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
                      className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 relative"
                      style={{ backgroundColor: `${role.color}20` }}
                    >
                      <Icon className="w-8 h-8" style={{ color: role.color }} />
                      {role.pill && (
                        <span
                          className="absolute -top-1 -right-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: role.color }}
                        >
                          {role.pill}
                        </span>
                      )}
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

      </div>
    </div>
  );
}
