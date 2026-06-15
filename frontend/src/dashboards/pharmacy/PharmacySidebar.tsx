import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, ShoppingBag, Clock, CheckCircle,
  Package, User, Menu, X, Bell,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

const navigation = [
  { name: "Overview",       href: "/dashboard",                icon: LayoutDashboard },
  { name: "All Orders",     href: "/dashboard/pharm-orders",   icon: ShoppingBag, badge: "pending" },
  { name: "Pending",        href: "/dashboard/pharm-pending",  icon: Clock },
  { name: "Ready",          href: "/dashboard/pharm-ready",    icon: CheckCircle },
  { name: "Dispensed",      href: "/dashboard/pharm-dispensed",icon: Package },
  { name: "My Profile",     href: "/dashboard/profile",        icon: User },
];

export const PharmacySidebar = () => {
  const [isOpen, setIsOpen] = useState(() => window.innerWidth >= 1024);
  const [logoError, setLogoError] = useState(false);

  const { data: orders = [] } = useQuery({
    queryKey: ["pharmacy-orders-sidebar"],
    queryFn: async () => (await api.get("/pharmacy/orders")).data,
    staleTime: 15_000,
    refetchInterval: 20_000,
  });

  const pendingCount = orders.filter((o: any) => o.status === "pending").length;

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
          {/* Logo */}
          <div className="h-16 flex items-center pl-16 pr-6 lg:px-6 border-b border-[#2D2755]">
            {isOpen && (
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white">Cerevyn</span>
                <span className="text-xs text-emerald-400">Pharmacy Portal</span>
              </div>
            )}
          </div>

          {/* Pending orders alert banner */}
          {isOpen && pendingCount > 0 && (
            <div className="mx-3 mt-3 flex items-center gap-2 px-3 py-2 bg-amber-500/20 border border-amber-500/30 rounded-xl">
              <Bell className="h-4 w-4 text-amber-400 animate-pulse flex-shrink-0" />
              <span className="text-amber-300 text-xs font-medium">{pendingCount} new order{pendingCount > 1 ? "s" : ""} waiting</span>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-3">
              {navigation.map((item) => {
                const badge = item.badge === "pending" ? pendingCount : 0;
                return (
                  <li key={item.name}>
                    <NavLink
                      to={item.href}
                      end={item.href === "/dashboard"}
                      onClick={handleLinkClick}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200",
                          "hover:bg-emerald-900/40 hover:scale-105",
                          isActive
                            ? "bg-emerald-700/60 text-white shadow-lg shadow-emerald-900/30 border border-emerald-600/40"
                            : "text-white"
                        )
                      }
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {isOpen && (
                        <div className="flex items-center justify-between flex-1">
                          <span className="text-sm font-medium">{item.name}</span>
                          {badge > 0 && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white text-xs font-bold">
                              {badge}
                            </span>
                          )}
                        </div>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Bottom info */}
          {isOpen && (
            <div className="p-4 border-t border-[#2D2755]">
              <p className="text-[#9CA3AF] text-xs text-center">Auto-refreshes every 20s</p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
