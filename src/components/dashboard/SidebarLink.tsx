
import React from "react";
import { Link } from "react-router-dom";

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
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
        isActive 
          ? "bg-accent text-accent-foreground shadow-sm border-l-2 border-primary" 
          : "hover:bg-secondary hover:text-foreground text-muted-foreground"
      }`}
      onClick={onClick}
    >
      {icon}
      <span className="font-medium text-sm">{label}</span>
    </Link>
  );
};

export default SidebarLink;
