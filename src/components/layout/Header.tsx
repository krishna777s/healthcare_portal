import { Bell, User, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Format role for display
  const formatRole = (role?: string) => {
    if (!role) return "User";
    
    const roleMap: Record<string, string> = {
      'hospital_admin': 'Hospital Admin',
      'doctor': 'Doctor',
      'patient': 'Patient',
    };
    
    return roleMap[role] || role.charAt(0).toUpperCase() + role.slice(1);
  };

  const handleLogout = () => {
    logout();
    navigate("/select-role");
  };
  return (
    <header className="h-16 border-b border-[#2D2755] bg-[#131e3a]/90 backdrop-blur-xl sticky top-0 z-30">
      <div className="h-full px-6 flex items-center justify-end gap-4">
        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative hover:bg-accent">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-primary text-xs">
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-[#051650]/90 backdrop-blur-sm border-[#2D2755] text-white">
              <DropdownMenuLabel className="text-white">Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#2D2755]" />
              <DropdownMenuItem className="flex flex-col items-start py-3 hover:bg-[#051650] cursor-pointer text-white">
                <span className="font-medium text-sm text-white">New patient registered</span>
                <span className="text-xs text-[#D1D5DB]">John Doe - 5 minutes ago</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start py-3 hover:bg-[#051650] cursor-pointer text-white">
                <span className="font-medium text-sm text-white">Lab report ready</span>
                <span className="text-xs text-[#D1D5DB]">Radiology - 1 hour ago</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start py-3 hover:bg-[#051650] cursor-pointer text-white">
                <span className="font-medium text-sm text-white">New collaboration request</span>
                <span className="text-xs text-[#D1D5DB]">City Hospital - 2 hours ago</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 hover:bg-accent">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium text-white">{user?.name || user?.email || "User"}</div>
                  <div className="text-xs text-[#D1D5DB]">{formatRole(user?.role)}</div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-[#051650]/90 backdrop-blur-sm border-[#2D2755] text-white">
              <DropdownMenuLabel className="text-white">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#2D2755]" />
              <DropdownMenuItem className="hover:bg-[#051650] cursor-pointer text-white">Profile</DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-[#051650] cursor-pointer text-white">Settings</DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-[#051650] cursor-pointer text-white">Help & Support</DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#2D2755]" />
              <DropdownMenuItem
                className="text-red-400 hover:bg-[#051650] cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
