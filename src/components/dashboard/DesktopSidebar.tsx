
import React from "react";
import { Link } from "react-router-dom";
import { LogOut, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import SidebarLink from "./SidebarLink";
import { NavItem } from "./types";
import { Separator } from "@/components/ui/separator";

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
    <aside className="hidden md:flex flex-col w-64 border-r border-border/40 bg-card">
      <div className="p-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="rounded-md bg-primary p-1.5 shadow-sm">
            <div className="h-4 w-4 text-primary-foreground font-medium flex items-center justify-center text-xs">P</div>
          </div>
          <span className="font-semibold text-lg text-gradient">ProSync</span>
        </Link>
      </div>

      <Separator className="opacity-60" />

      {user && (
        <div className="px-4 py-3">
          <div className="flex items-center gap-3 p-2 rounded-md">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center border border-border/50">
              <span className="text-primary font-medium text-sm">
                {userInitial}
              </span>
            </div>
            <div>
              <div className="font-medium text-sm">{user.fullName}</div>
              <div className="text-xs text-muted-foreground">{user.email}</div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 py-4 px-2">
        <div className="px-2 mb-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Main Menu
          </p>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <SidebarLink
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              isActive={activePath === item.to}
            />
          ))}
        </nav>

        <div className="px-2 my-2 pt-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Account
          </p>
        </div>
        <SidebarLink
          to="/profile"
          icon={<UserCircle className="h-5 w-5" />}
          label="Profile"
          isActive={activePath === "/profile"}
        />
      </div>

      <div className="p-3 border-t border-border/40">
        <div className="flex items-center justify-between">
          <ThemeToggle />
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
            onClick={onLogout}
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Log Out</span>
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default DesktopSidebar;
