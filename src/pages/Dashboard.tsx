
import React from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Home, Package, BarChart3, Activity } from "lucide-react";
import { MetricCard as MetricCardType, ActivityItem } from "@/components/dashboard/types";
import MetricCard from "@/components/dashboard/MetricCard";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import ProjectSummary from "@/components/dashboard/ProjectSummary";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DbProduct } from "@/components/products/types";
import { format } from "date-fns";

const Dashboard = () => {
  // Fetch product data from Supabase
  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['dashboard-products'],
    queryFn: async () => {
      const { data: products, error: productsError } = await supabase
        .from('product')
        .select('*');
      
      if (productsError) {
        throw new Error(productsError.message);
      }

      const productsWithPrices = await Promise.all(
        products.map(async (product) => {
          const { data: prices } = await supabase
            .from('pricehist')
            .select('*')
            .eq('prodcode', product.prodcode)
            .order('effdate', { ascending: false })
            .limit(1);

          return {
            ...product,
            current_price: prices && prices.length > 0 ? prices[0].unitprice : undefined
          };
        })
      );

      return productsWithPrices as DbProduct[];
    },
  });

  // Calculate metrics based on fetched data
  const totalProducts = products.length;
  const productsWithPrices = products.filter(p => p.current_price !== undefined);
  const avgPrice = productsWithPrices.length > 0 
    ? productsWithPrices.reduce((sum, prod) => sum + (prod.current_price || 0), 0) / productsWithPrices.length 
    : 0;
    
  // Fetch recent price changes
  const { data: recentPriceChanges = [] } = useQuery({
    queryKey: ['recent-price-changes'],
    queryFn: async () => {
      const { data: priceChanges, error } = await supabase
        .from('pricehist')
        .select('*, product(description)')
        .order('effdate', { ascending: false })
        .limit(10);
      
      if (error) {
        throw new Error(error.message);
      }
      
      return priceChanges;
    },
    enabled: !isLoadingProducts,
  });

  // Create activities from price changes
  const priceActivities: ActivityItem[] = recentPriceChanges.map((price: any) => ({
    id: `${price.prodcode}-${price.effdate}`,
    title: "Price update",
    description: `${price.product?.description || price.prodcode} price set to $${price.unitprice}`,
    timestamp: format(new Date(price.effdate), 'MMM d, yyyy'),
    type: "update"
  }));

  // Fetch unique product categories
  const categories = Array.from(new Set(products.map(p => p.unit).filter(Boolean)));
  const categoryCount = categories.length;

  const metrics: MetricCardType[] = [
    {
      title: "Total Products",
      value: isLoadingProducts ? "Loading..." : totalProducts,
      change: { value: "0", isPositive: true },
      icon: <Package className="h-5 w-5 text-primary" />
    },
    {
      title: "Average Price",
      value: isLoadingProducts ? "Loading..." : `$${avgPrice.toFixed(2)}`,
      change: { value: "0%", isPositive: true },
      icon: <BarChart3 className="h-5 w-5 text-primary" />
    },
    {
      title: "Product Categories",
      value: isLoadingProducts ? "Loading..." : categoryCount,
      change: { value: "0", isPositive: true },
      icon: <Activity className="h-5 w-5 text-primary" />
    },
    {
      title: "Recent Updates",
      value: isLoadingProducts ? "Loading..." : recentPriceChanges.length,
      icon: <Home className="h-5 w-5 text-primary" />
    }
  ];

  const projects = [
    {
      id: "1",
      name: "Product Catalog Update",
      description: "Updating product descriptions and metadata",
      progress: 75,
      status: "active" as const,
      dueDate: "Jun 15, 2025"
    },
    {
      id: "2",
      name: "Pricing Strategy Review",
      description: "Analyzing competitor pricing data for Q2",
      progress: 40,
      status: "active" as const,
      dueDate: "Jul 1, 2025"
    },
    {
      id: "3",
      name: "Inventory Reconciliation",
      description: "Matching physical inventory with system records",
      progress: 100,
      status: "completed" as const,
      dueDate: "May 5, 2025"
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
              Last updated: {format(new Date(), "MMM d, yyyy, h:mm a")}
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
            <ActivityFeed activities={priceActivities.length > 0 ? priceActivities : [
              {
                id: "fallback-1",
                title: "No recent activities",
                description: "No recent price updates have been recorded",
                timestamp: "Now",
                type: "info"
              }
            ]} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
