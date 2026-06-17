import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, Building2, Stethoscope, Users, UserCircle,
  FlaskConical, ShoppingBag, Menu, X, History
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Entities", href: "/dashboard/entities", icon: Building2 },
  { name: "Departments", href: "/dashboard/departments", icon: Stethoscope },
  { name: "Doctors & Staff", href: "/dashboard/staff", icon: Users },
  { name: "Patients", href: "/dashboard/patients", icon: UserCircle },
  { name: "Diagnostics", href: "/dashboard/diagnostics", icon: FlaskConical },
  { name: "Pharmacy", href: "/dashboard/pharmacy", icon: ShoppingBag },
  { name: "Patient History", href: "/dashboard/patient-history", icon: History },
];

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(() => window.innerWidth >= 1024);
  const [logoError, setLogoError] = useState(false);

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-xl bg-card/80 backdrop-blur-sm border border-border text-foreground"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden animate-fade-in"
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 h-screen bg-[#131e3a] border-r border-[#2D2755] transition-all duration-300 z-40",
          isOpen ? "w-64" : "w-0 lg:w-20",
          "overflow-hidden"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="h-16 flex items-center pl-16 pr-6 lg:px-6 border-b border-[#2D2755]">
            {isOpen && (
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white">Cerevyn</span>
                <span className="text-xs text-[#D1D5DB]">Admin Portal</span>
              </div>
            )}
          </div>

          <nav className="flex-1 overflow-y-auto py-6">
            <ul className="space-y-1 px-3">
              {navigation.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.href}
                    end={item.href === "/dashboard"}
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200",
                        "hover:bg-[#051650] hover:scale-105",
                        isActive
                          ? "bg-primary text-white shadow-lg shadow-primary/20"
                          : "text-white"
                      )
                    }
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {isOpen && <span className="text-sm font-medium">{item.name}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
};
