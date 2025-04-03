
import React from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ProductCard, { Product } from "@/components/ProductCard";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, Package, Percent, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Fetch products from Supabase
const fetchRecentProducts = async (): Promise<Product[]> => {
  // Get all products from the product table
  const { data: products, error: productsError } = await supabase
    .from('product')
    .select('*')
    .limit(3); // Just get the most recent 3 products
  
  if (productsError) {
    throw new Error(productsError.message);
  }

  // For each product, fetch the most recent price from pricehist
  const productsWithPrices = await Promise.all(
    products.map(async (product) => {
      const { data: prices, error: pricesError } = await supabase
        .from('pricehist')
        .select('*')
        .eq('prodcode', product.prodcode)
        .order('effdate', { ascending: false })
        .limit(1);

      if (pricesError) {
        console.error(`Error fetching price for ${product.prodcode}:`, pricesError);
        return null;
      }

      // Get price history for the product
      const { data: history } = await supabase
        .from('pricehist')
        .select('*')
        .eq('prodcode', product.prodcode)
        .order('effdate', { ascending: false });

      // Transform to match the Product interface
      return {
        id: product.prodcode,
        name: product.description || "Untitled Product",
        description: `Product code: ${product.prodcode}`,
        sku: product.prodcode,
        category: product.unit || "Uncategorized",
        currentPrice: prices && prices.length > 0 ? prices[0].unitprice : 0,
        stockQuantity: 0, // Default stock value
        priceHistory: history ? history.map(item => ({
          date: item.effdate,
          price: item.unitprice
        })) : [],
        images: [{
          url: "/placeholder.svg",
          alt: product.description || "Product image",
          isPrimary: true
        }]
      } as Product;
    })
  );

  // Filter out any null values that might have occurred due to errors
  return productsWithPrices.filter(product => product !== null) as Product[];
};

// Fetch all products to calculate statistics
const fetchAllProducts = async () => {
  const { data: products, error: productsError } = await supabase
    .from('product')
    .select('*');
  
  if (productsError) {
    throw new Error(productsError.message);
  }

  return products;
};

const Dashboard = () => {
  const { user } = useAuth();
  
  // Fetch recent products for display
  const { data: recentProducts = [], isLoading: isLoadingRecent } = useQuery({
    queryKey: ['recentProducts'],
    queryFn: fetchRecentProducts,
  });
  
  // Fetch all products for statistics
  const { data: allProducts = [], isLoading: isLoadingAll } = useQuery({
    queryKey: ['allProductsStats'],
    queryFn: fetchAllProducts,
  });
  
  // Calculate some statistics
  const totalProducts = allProducts.length;
  const uniqueUnits = new Set(allProducts.map(p => p.unit)).size;
  
  // Calculate average price (if products have prices)
  const calculateAveragePrice = () => {
    if (recentProducts.length === 0) return 0;
    const total = recentProducts.reduce((sum, product) => sum + product.currentPrice, 0);
    return total / recentProducts.length;
  };
  const averagePrice = calculateAveragePrice();
  
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
              <div className="text-2xl font-bold">N/A</div>
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
                {uniqueUnits}
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
          
          {isLoadingRecent ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
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
              {recentProducts.length === 0 && (
                <div className="col-span-3 text-center py-8 text-muted-foreground">
                  No products found. Add some products to see them here.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
