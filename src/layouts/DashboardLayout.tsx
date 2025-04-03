
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { 
  BarChart3, 
  Home, 
  Package, 
  Plus, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  UserCircle
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon, label, isActive, onClick }) => {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
        isActive 
          ? "bg-primary text-primary-foreground" 
          : "hover:bg-secondary hover:text-foreground text-muted-foreground"
      }`}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { to: "/dashboard", icon: <Home className="h-5 w-5" />, label: "Dashboard" },
    { to: "/products", icon: <Package className="h-5 w-5" />, label: "Products" },
    { to: "/analytics", icon: <BarChart3 className="h-5 w-5" />, label: "Analytics" },
    { to: "/settings", icon: <Settings className="h-5 w-5" />, label: "Settings" },
  ];

  const userInitial = user?.fullName?.charAt(0) || "U";

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-2 border-b border-border bg-background">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <div className="rounded-md bg-primary p-1">
              <div className="h-5 w-5 text-primary-foreground font-bold flex items-center justify-center">P</div>
            </div>
            <span className="font-bold text-xl">ProSync</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <UserCircle className="mr-2 h-4 w-4" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ThemeToggle />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </header>

      {/* Mobile Sidebar (Modal) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 md:hidden">
          <div className="fixed top-0 right-0 h-full w-3/4 max-w-xs bg-background p-6 shadow-lg">
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <div className="rounded-md bg-primary p-1">
                    <div className="h-5 w-5 text-primary-foreground font-bold flex items-center justify-center">P</div>
                  </div>
                  <span className="font-bold text-lg">ProSync</span>
                </div>
                <Button variant="ghost" size="icon" onClick={closeMobileMenu}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {user && (
                <div className="mb-6 py-4 border-y border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
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

              <nav className="space-y-1 flex-1">
                {navItems.map((item) => (
                  <SidebarLink
                    key={item.to}
                    to={item.to}
                    icon={item.icon}
                    label={item.label}
                    isActive={location.pathname === item.to}
                    onClick={closeMobileMenu}
                  />
                ))}
                <SidebarLink
                  to="/profile"
                  icon={<UserCircle className="h-5 w-5" />}
                  label="Profile"
                  isActive={location.pathname === "/profile"}
                  onClick={closeMobileMenu}
                />
                <Link to="/add-product" onClick={closeMobileMenu}>
                  <Button className="w-full mt-4 gap-2">
                    <Plus className="h-4 w-4" /> Add Product
                  </Button>
                </Link>
              </nav>

              <div className="pt-6 border-t border-border">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-muted-foreground hover:text-foreground"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  Log Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-background">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="rounded-md bg-primary p-1">
              <div className="h-5 w-5 text-primary-foreground font-bold flex items-center justify-center">P</div>
            </div>
            <span className="font-bold text-xl">ProSync</span>
          </Link>
        </div>

        {user && (
          <div className="px-6 py-4 border-y border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
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
          <nav className="space-y-1">
            {navItems.map((item) => (
              <SidebarLink
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                isActive={location.pathname === item.to}
              />
            ))}
            <SidebarLink
              to="/profile"
              icon={<UserCircle className="h-5 w-5" />}
              label="Profile"
              isActive={location.pathname === "/profile"}
            />
            <Link to="/add-product">
              <Button className="w-full mt-6 gap-2">
                <Plus className="h-4 w-4" /> Add Product
              </Button>
            </Link>
          </nav>
        </div>

        <div className="p-6 border-t border-border flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <ThemeToggle />
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground hover:text-foreground"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container py-6 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
