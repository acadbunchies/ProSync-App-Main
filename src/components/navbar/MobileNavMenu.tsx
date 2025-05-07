
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface MobileNavMenuProps {
  isOpen: boolean;
  isAuthenticated: boolean;
  onClose: () => void;
}

const MobileNavMenu: React.FC<MobileNavMenuProps> = ({ isOpen, isAuthenticated, onClose }) => {
  const { logout } = useAuth();
  
  if (!isOpen) return null;
  
  const handleLogout = () => {
    logout();
    onClose();
  };
  
  return (
    <motion.div 
      className="md:hidden absolute top-16 left-0 right-0 border-b border-border bg-background p-4 shadow-lg z-50"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <nav className="flex flex-col space-y-4">
        <Link 
          to="/" 
          className="text-foreground py-2 hover:text-primary transition-colors"
          onClick={onClose}
        >
          Home
        </Link>
        <Link 
          to="/features" 
          className="text-foreground py-2 hover:text-primary transition-colors"
          onClick={onClose}
        >
          Features
        </Link>
        <Link 
          to="/pricing" 
          className="text-foreground py-2 hover:text-primary transition-colors"
          onClick={onClose}
        >
          Pricing
        </Link>
        {isAuthenticated ? (
          <>
            <Link 
              to="/dashboard" 
              className="text-foreground py-2 hover:text-primary transition-colors"
              onClick={onClose}
            >
              Dashboard
            </Link>
            <Link 
              to="/profile" 
              className="text-foreground py-2 hover:text-primary transition-colors"
              onClick={onClose}
            >
              Profile
            </Link>
            <Button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 button-pop">
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </Button>
          </>
        ) : (
          <>
            <Link to="/login" onClick={onClose} className="w-full">
              <Button variant="outline" className="w-full button-pop">Log in</Button>
            </Link>
            <Link to="/signup" onClick={onClose} className="w-full">
              <Button className="w-full button-pop">Sign up</Button>
            </Link>
          </>
        )}
      </nav>
    </motion.div>
  );
};

export default MobileNavMenu;
