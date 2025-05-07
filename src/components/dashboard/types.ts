
import React from "react";

export interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
}

export interface MetricCard {
  title: string;
  value: string | number;
  change?: {
    value: string | number;
    isPositive: boolean;
  };
  icon: React.ReactNode;
}

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: "update" | "create" | "delete" | "info";
  user?: {
    name: string;
    avatar?: string;
  };
}
