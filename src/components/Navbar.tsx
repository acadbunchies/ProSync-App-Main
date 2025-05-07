
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { Menu, X, UserCircle, LogOut } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  
  const userInitial = user?.fullName?.charAt(0) || "U";

  const logoVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

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
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <motion.div 
            className="text-2xl font-bold text-gradient"
            variants={logoVariants}
            initial="hidden"
            animate="visible"
          >
            ProSync
          </motion.div>
        </Link>

        {/* Desktop Navigation */}
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center gap-2 button-pop">
                        <Avatar className="h-6 w-6 border-2 border-primary/20">
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            {userInitial}
                          </AvatarFallback>
                        </Avatar>
                        <span>Account</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/profile" className="flex cursor-pointer">
                          <UserCircle className="mr-2 h-4 w-4" /> Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                        <LogOut className="mr-2 h-4 w-4" /> Log out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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

        {/* Mobile menu button */}
        <div className="flex items-center gap-4 md:hidden">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden button-pop"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
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
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/features" 
              className="text-foreground py-2 hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </Link>
            <Link 
              to="/pricing" 
              className="text-foreground py-2 hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </Link>
            {isAuthenticated ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="text-foreground py-2 hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/profile" 
                  className="text-foreground py-2 hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <Button onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }} className="w-full flex items-center justify-center gap-2 button-pop">
                  <LogOut className="h-4 w-4" />
                  <span>Log out</span>
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="w-full">
                  <Button variant="outline" className="w-full button-pop">Log in</Button>
                </Link>
                <Link to="/signup" onClick={() => setIsMenuOpen(false)} className="w-full">
                  <Button className="w-full button-pop">Sign up</Button>
                </Link>
              </>
            )}
          </nav>
        </motion.div>
      )}
    </header>
  );
};

export default Navbar;
