import { Search, Bell, User } from "lucide-react";
import { Input } from "@/components/ui/input";
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

export const Header = () => {
  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-30">
      <div className="h-full px-6 flex items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patients, doctors, entities..."
            className="pl-10 bg-background/50 border-border focus-visible:ring-primary"
          />
        </div>

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
            <DropdownMenuContent align="end" className="w-80 bg-popover border-border">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex flex-col items-start py-3 hover:bg-accent cursor-pointer">
                <span className="font-medium text-sm">New patient registered</span>
                <span className="text-xs text-muted-foreground">John Doe - 5 minutes ago</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start py-3 hover:bg-accent cursor-pointer">
                <span className="font-medium text-sm">Lab report ready</span>
                <span className="text-xs text-muted-foreground">Radiology - 1 hour ago</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start py-3 hover:bg-accent cursor-pointer">
                <span className="font-medium text-sm">New collaboration request</span>
                <span className="text-xs text-muted-foreground">City Hospital - 2 hours ago</span>
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
                  <div className="text-sm font-medium">Admin User</div>
                  <div className="text-xs text-muted-foreground">System Admin</div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-popover border-border">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="hover:bg-accent cursor-pointer">Profile</DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-accent cursor-pointer">Settings</DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-accent cursor-pointer">Help & Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive hover:bg-accent cursor-pointer">
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
