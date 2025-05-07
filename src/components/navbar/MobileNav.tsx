
import React from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Menu, X } from "lucide-react";

interface MobileNavProps {
  isMenuOpen: boolean;
  toggleMenu: () => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ isMenuOpen, toggleMenu }) => {
  return (
    <div className="flex items-center gap-4 md:hidden">
      <ThemeToggle />
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMenu}
        className="md:hidden button-pop"
      >
        {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        <span className="sr-only">Toggle menu</span>
      </Button>
    </div>
  );
};

export default MobileNav;
