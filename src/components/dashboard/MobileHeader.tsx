
import React from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import UserDropdown from "./UserDropdown";
import { useAuth } from "@/context/AuthContext";

interface MobileHeaderProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const { user } = useAuth();
  
  return (
    <header className="md:hidden flex items-center justify-between px-4 py-2 border-b border-border/70 bg-background shadow-soft">
      <div className="flex items-center gap-2">
        <Link to="/" className="flex items-center gap-2">
          <div className="rounded-md bg-primary p-1 shadow-colored" style={{ "--shadow-color": "rgba(142, 120, 255, 0.15)" } as React.CSSProperties}>
            <div className="h-5 w-5 text-primary-foreground font-bold flex items-center justify-center">P</div>
          </div>
          <span className="font-bold text-xl text-gradient">ProSync</span>
        </Link>
      </div>
      
      <div className="flex items-center gap-2">
        <UserDropdown user={user} />
        <ThemeToggle />
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="shadow-soft hover:shadow-medium"
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>
    </header>
  );
};

export default MobileHeader;
