
import React from "react";
import { Link } from "react-router-dom";
import { LogOut, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import SidebarLink from "./SidebarLink";
import { NavItem } from "./types";

interface DesktopSidebarProps {
  navItems: NavItem[];
  activePath: string;
  onLogout: () => void;
}

const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ 
  navItems, 
  activePath, 
  onLogout 
}) => {
  const { user } = useAuth();
  const userInitial = user?.fullName?.charAt(0) || "U";

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-border/70 bg-sidebar shadow-medium">
      <div className="p-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="rounded-md bg-primary p-1 shadow-colored" style={{ "--shadow-color": "rgba(142, 120, 255, 0.15)" } as React.CSSProperties}>
            <div className="h-5 w-5 text-primary-foreground font-bold flex items-center justify-center">P</div>
          </div>
          <span className="font-bold text-xl text-gradient">ProSync</span>
        </Link>
      </div>

      {user && (
        <div className="px-6 py-4 border-y border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/30">
              <span className="text-primary font-medium">
                {userInitial}
              </span>
            </div>
            <div>
              <div className="font-medium">{user.fullName}</div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 py-6 px-4">
        <nav className="space-y-2">
          {navItems.map((item) => (
            <SidebarLink
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              isActive={activePath === item.to}
            />
          ))}
          <SidebarLink
            to="/profile"
            icon={<UserCircle className="h-5 w-5" />}
            label="Profile"
            isActive={activePath === "/profile"}
          />
        </nav>
      </div>

      <div className="p-4 border-t border-border/50">
        <div className="flex items-center justify-between">
          <ThemeToggle />
          <Button 
            variant="outline" 
            className="flex items-center gap-2 shadow-soft hover:shadow-colored"
            onClick={onLogout}
          >
            <LogOut className="h-4 w-4" />
            <span>Log Out</span>
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default DesktopSidebar;
