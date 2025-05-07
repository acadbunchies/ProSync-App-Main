
import React from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Home, Package, BarChart3, Activity } from "lucide-react";
import { MetricCard as MetricCardType, ActivityItem } from "@/components/dashboard/types";
import MetricCard from "@/components/dashboard/MetricCard";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import ProjectSummary from "@/components/dashboard/ProjectSummary";

const Dashboard = () => {
  const metrics: MetricCardType[] = [
    {
      title: "Total Products",
      value: "128",
      change: { value: "12%", isPositive: true },
      icon: <Package className="h-5 w-5 text-primary" />
    },
    {
      title: "Monthly Revenue",
      value: "$24,213",
      change: { value: "8.4%", isPositive: true },
      icon: <BarChart3 className="h-5 w-5 text-primary" />
    },
    {
      title: "Active Projects",
      value: "34",
      change: { value: "2", isPositive: false },
      icon: <Activity className="h-5 w-5 text-primary" />
    },
    {
      title: "Pending Tasks",
      value: "23",
      icon: <Home className="h-5 w-5 text-primary" />
    }
  ];

  const activities: ActivityItem[] = [
    {
      id: "1",
      title: "New product added",
      description: "Wireless Headphones XZ-400 has been added to inventory",
      timestamp: "1h ago",
      type: "create",
      user: { name: "Alex Johnson" }
    },
    {
      id: "2",
      title: "Price update",
      description: "Smart Watch S22 price updated from $199 to $179",
      timestamp: "3h ago",
      type: "update",
      user: { name: "Maria Garcia" }
    },
    {
      id: "3",
      title: "Product removed",
      description: "Bluetooth Speaker M100 has been removed",
      timestamp: "5h ago",
      type: "delete",
      user: { name: "John Smith" }
    },
    {
      id: "4",
      title: "Inventory alert",
      description: "Laptop Pro X13 is low in stock (3 remaining)",
      timestamp: "1d ago",
      type: "info"
    }
  ];

  const projects = [
    {
      id: "1",
      name: "Q4 Product Launch",
      description: "Preparing for the holiday season product lineup",
      progress: 75,
      status: "active" as const,
      dueDate: "Nov 15, 2025"
    },
    {
      id: "2",
      name: "Website Redesign",
      description: "Modernizing the e-commerce user experience",
      progress: 40,
      status: "active" as const,
      dueDate: "Dec 1, 2025"
    },
    {
      id: "3",
      name: "Inventory System Update",
      description: "Migration to the new cloud-based inventory system",
      progress: 100,
      status: "completed" as const,
      dueDate: "Oct 5, 2025"
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">
                  <Home className="h-3 w-3 mr-1" />
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Overview</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          
          <div className="flex items-center justify-between mt-2">
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <Badge variant="outline" className="bg-secondary text-foreground">
              Last updated: Today, 10:30 AM
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, index) => (
            <MetricCard key={index} data={metric} />
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ProjectSummary projects={projects} />
          </div>
          <div>
            <ActivityFeed activities={activities} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
