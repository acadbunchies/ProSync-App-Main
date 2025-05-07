
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
          ? "bg-primary text-primary-foreground shadow-colored" 
          : "hover:bg-secondary hover:text-foreground text-muted-foreground hover:shadow-soft"
      }`}
      onClick={onClick}
      style={isActive ? { "--shadow-color": "rgba(142, 120, 255, 0.15)" } as React.CSSProperties : undefined}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

export default SidebarLink;
