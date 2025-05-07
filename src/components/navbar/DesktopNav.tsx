
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import UserMenu from "./UserMenu";

interface DesktopNavProps {
  isAuthenticated: boolean;
}

const DesktopNav: React.FC<DesktopNavProps> = ({ isAuthenticated }) => {
  const { logout } = useAuth();
  
  const navItemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: (i: number) => ({ 
      opacity: 1, 
      y: 0, 
      transition: { 
        delay: 0.1 * i,
        duration: 0.4
      } 
    })
  };

  return (
    <nav className="hidden md:flex items-center gap-4">
      <motion.div 
        custom={1}
        variants={navItemVariants}
        initial="hidden"
        animate="visible"
      >
        <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors animated-link">
          Home
        </Link>
      </motion.div>
      <motion.div 
        custom={2}
        variants={navItemVariants}
        initial="hidden"
        animate="visible"
      >
        <Link to="/features" className="text-muted-foreground hover:text-foreground transition-colors animated-link">
          Features
        </Link>
      </motion.div>
      <motion.div 
        custom={3}
        variants={navItemVariants}
        initial="hidden"
        animate="visible"
      >
        <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors animated-link">
          Pricing
        </Link>
      </motion.div>
      {isAuthenticated ? (
        <>
          <motion.div 
            custom={4}
            variants={navItemVariants}
            initial="hidden"
            animate="visible"
          >
            <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors animated-link">
              Dashboard
            </Link>
          </motion.div>
          <div className="flex items-center gap-3 ml-4">
            <motion.div
              custom={5}
              variants={navItemVariants}
              initial="hidden"
              animate="visible"
            >
              <ThemeToggle />
            </motion.div>
            <motion.div
              custom={6}
              variants={navItemVariants}
              initial="hidden"
              animate="visible"
            >
              <UserMenu />
            </motion.div>
          </div>
        </>
      ) : (
        <div className="flex items-center gap-3">
          <motion.div
            custom={5}
            variants={navItemVariants}
            initial="hidden"
            animate="visible"
          >
            <ThemeToggle />
          </motion.div>
          <motion.div
            custom={6}
            variants={navItemVariants}
            initial="hidden"
            animate="visible"
          >
            <Link to="/login">
              <Button variant="ghost" className="button-pop">Log in</Button>
            </Link>
          </motion.div>
          <motion.div
            custom={7}
            variants={navItemVariants}
            initial="hidden"
            animate="visible"
          >
            <Link to="/signup">
              <Button className="button-pop">Sign up</Button>
            </Link>
          </motion.div>
        </div>
      )}
    </nav>
  );
};

export default DesktopNav;
