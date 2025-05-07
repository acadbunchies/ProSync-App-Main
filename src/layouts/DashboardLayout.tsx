
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { 
  BarChart3, 
  Home, 
  Package, 
  Settings, 
  LogOut, 
  UserCircle,
  FileText
} from "lucide-react";
import { NavItem } from "@/components/dashboard/types";
import MobileHeader from "@/components/dashboard/MobileHeader";
import MobileMenu from "@/components/dashboard/MobileMenu";
import DesktopSidebar from "@/components/dashboard/DesktopSidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { logout } = useAuth();
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

  const navItems: NavItem[] = [
    { to: "/dashboard", icon: <Home className="h-5 w-5" />, label: "Dashboard" },
    { to: "/products", icon: <Package className="h-5 w-5" />, label: "Products" },
    { to: "/analytics", icon: <BarChart3 className="h-5 w-5" />, label: "Analytics" },
    { to: "/reports", icon: <FileText className="h-5 w-5" />, label: "Reports" },
    { to: "/settings", icon: <Settings className="h-5 w-5" />, label: "Settings" },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Mobile Header */}
      <MobileHeader 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Mobile Sidebar (Modal) */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        navItems={navItems}
        activePath={location.pathname}
        onClose={closeMobileMenu}
        onLogout={handleLogout}
      />

      {/* Desktop Sidebar */}
      <DesktopSidebar
        navItems={navItems}
        activePath={location.pathname}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background">
        <div className="container py-6 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
