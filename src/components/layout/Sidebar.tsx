import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Building2, 
  Stethoscope, 
  Users, 
  UserCircle,
  FlaskConical,
  Handshake,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Entities", href: "/entities", icon: Building2 },
  { name: "Departments", href: "/departments", icon: Stethoscope },
  { name: "Doctors & Staff", href: "/staff", icon: Users },
  { name: "Patients", href: "/patients", icon: UserCircle },
  { name: "Diagnostics", href: "/diagnostics", icon: FlaskConical },
  { name: "Collaborations", href: "/collaborations", icon: Handshake },
];

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-xl bg-card/80 backdrop-blur-sm border border-border text-foreground"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 z-40",
          isOpen ? "w-64" : "w-0 lg:w-20",
          "overflow-hidden"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">
                C
              </div>
              {isOpen && (
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-sidebar-foreground">Cerevyn</span>
                  <span className="text-xs text-muted-foreground">EMP Portal</span>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-6">
            <ul className="space-y-2 px-3">
              {navigation.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.href}
                    end={item.href === "/"}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200",
                        "hover:bg-sidebar-accent hover:scale-105",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                          : "text-sidebar-foreground"
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
