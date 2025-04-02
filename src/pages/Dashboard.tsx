
import React from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import { mockProducts } from "@/lib/mockData";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, Package, Percent, TrendingUp } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const recentProducts = mockProducts.slice(0, 3);

  // Calculate some statistics
  const totalProducts = mockProducts.length;
  const totalStock = mockProducts.reduce((sum, product) => sum + product.stockQuantity, 0);
  const averagePrice = mockProducts.reduce((sum, product) => sum + product.currentPrice, 0) / totalProducts;
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight animate-fade-in">Welcome back, {user?.fullName.split(' ')[0]}</h1>
          <p className="text-muted-foreground animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Here's an overview of your product management system
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
              <p className="text-xs text-muted-foreground">Products in catalog</p>
            </CardContent>
          </Card>
          <Card className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Price</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${averagePrice.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Per item</p>
            </CardContent>
          </Card>
          <Card className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStock}</div>
              <p className="text-xs text-muted-foreground">Units available</p>
            </CardContent>
          </Card>
          <Card className="animate-fade-in" style={{ animationDelay: "0.5s" }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(mockProducts.map(p => p.category)).size}
              </div>
              <p className="text-xs text-muted-foreground">Product categories</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight">Recent Products</h2>
            <Link to="/products">
              <Button variant="ghost" size="sm" className="text-primary gap-2">
                View all <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recentProducts.map((product, i) => (
              <div 
                key={product.id} 
                className="animate-fade-in" 
                style={{ animationDelay: `${0.6 + (i * 0.15)}s` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
