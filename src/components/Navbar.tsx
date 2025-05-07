
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import NavbarLogo from "./navbar/NavbarLogo";
import DesktopNav from "./navbar/DesktopNav";
import MobileNav from "./navbar/MobileNav";
import MobileNavMenu from "./navbar/MobileNavMenu";

const Navbar: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <NavbarLogo />
        
        {/* Desktop Navigation */}
        <DesktopNav isAuthenticated={isAuthenticated} />

        {/* Mobile Navigation */}
        <MobileNav isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />
      
        {/* Mobile Navigation Menu */}
        <MobileNavMenu 
          isOpen={isMenuOpen} 
          isAuthenticated={isAuthenticated} 
          onClose={closeMenu} 
        />
      </div>
    </header>
  );
};

export default Navbar;
