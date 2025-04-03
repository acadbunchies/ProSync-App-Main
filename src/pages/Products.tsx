
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/layouts/DashboardLayout";
import ProductCard, { Product } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Plus, Search, SlidersHorizontal, X, List, Grid, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import ProductsTable from "@/components/ProductsTable";
import { supabase } from "@/integrations/supabase/client";

// Fetch products with their latest prices from Supabase
const fetchProducts = async (): Promise<Product[]> => {
  // Get all products from the product table
  const { data: products, error: productsError } = await supabase
    .from('product')
    .select('*');
  
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

const Products = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  
  // Fetch products data using React Query
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });
  
  // Get unique categories from products
  const categories = products 
    ? ["all", ...new Set(products.map(p => p.category))]
    : ["all"];
  
  // Filter products based on search query and category
  const filteredProducts = products ? products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  }) : [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Package className="h-6 w-6" /> Products
            </h1>
            <p className="text-muted-foreground">
              Manage and organize your product catalog
            </p>
          </div>
          <Link to="/add-product">
            <Button className="self-start">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-7 w-7 px-0"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear search</span>
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className={viewMode === "grid" ? "bg-primary/10" : ""}
              onClick={() => setViewMode("grid")}
              title="Grid View"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className={viewMode === "table" ? "bg-primary/10" : ""}
              onClick={() => setViewMode("table")}
              title="Table View"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="sm:w-auto"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-fade-in">
            <div>
              <label 
                className="text-sm font-medium mb-1.5 block text-muted-foreground"
              >
                Category
              </label>
              <Select 
                value={categoryFilter} 
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === "all" ? "All Categories" : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
            <span>Loading products...</span>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md">
            Error loading products: {(error as Error).message}
          </div>
        ) : viewMode === "table" ? (
          <ProductsTable />
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-secondary p-3 mb-4">
              <Package className="h-6 w-6 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-medium mb-2">No products found</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              {searchQuery || categoryFilter !== "all" 
                ? "Try adjusting your search or filters to find what you're looking for." 
                : "Get started by adding your first product."}
            </p>
            <Link to="/add-product">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Products;
