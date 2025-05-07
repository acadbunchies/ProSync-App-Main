
import React from "react";
import { X, LogOut, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import SidebarLink from "./SidebarLink";
import { NavItem } from "./types";

interface MobileMenuProps {
  isOpen: boolean;
  navItems: NavItem[];
  activePath: string;
  onClose: () => void;
  onLogout: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ 
  isOpen, 
  navItems, 
  activePath,
  onClose, 
  onLogout 
}) => {
  const { user } = useAuth();
  const userInitial = user?.fullName?.charAt(0) || "U";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 md:hidden">
      <div className="fixed top-0 right-0 h-full w-3/4 max-w-xs bg-card p-6 shadow-hard border-l border-border/70">
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-primary p-1 shadow-colored" style={{ "--shadow-color": "rgba(142, 120, 255, 0.15)" } as React.CSSProperties}>
                <div className="h-5 w-5 text-primary-foreground font-bold flex items-center justify-center">P</div>
              </div>
              <span className="font-bold text-lg text-gradient">ProSync</span>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="shadow-soft hover:shadow-medium">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {user && (
            <div className="mb-6 py-4 border-y border-border/50">
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

          <nav className="space-y-2 flex-1">
            {navItems.map((item) => (
              <SidebarLink
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                isActive={activePath === item.to}
                onClick={onClose}
              />
            ))}
            <SidebarLink
              to="/profile"
              icon={<UserCircle className="h-5 w-5" />}
              label="Profile"
              isActive={activePath === "/profile"}
              onClick={onClose}
            />
          </nav>

          <div className="pt-6 border-t border-border/50">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-muted-foreground hover:text-foreground shadow-soft hover:shadow-medium"
              onClick={onLogout}
            >
              <LogOut className="mr-2 h-5 w-5" />
              Log Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
