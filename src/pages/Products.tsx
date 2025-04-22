import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Plus, Search, SlidersHorizontal, X, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import ProductsTable from "@/components/ProductsTable";
import { supabase } from "@/integrations/supabase/client";

const Products = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  
  // Fetch unique categories from the products
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['productCategories'],
    queryFn: async () => {
      const { data: products, error } = await supabase
        .from('product')
        .select('unit');
      if (error) throw error;
      const uniqueCategories = ["all", ...new Set(products.map(p => p.unit).filter(Boolean))];
      return uniqueCategories;
    },
  });
  
  return (
    <DashboardLayout>
      <div className="space-y-6 border border-black rounded-lg p-8 bg-white">
        <div className="flex flex-row items-center justify-between mb-6">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            Products
          </h1>
          <Link to="/add-product" className="text-right">
            <span
              className="text-base font-normal text-black hover:underline"
              style={{ textDecoration: "underline", color: "#2563eb" }}
            >
              Add Product
            </span>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
          <div>
            <span className="font-normal">Search product</span>
            <input
              className="ml-2 px-2 h-8 border rounded outline-none text-base"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ minWidth: "200px" }}
            />
          </div>
        </div>

        {/* Remove all image placeholders/grid view products, only render ProductsTable */}
        <ProductsTable searchQuery={searchQuery} categoryFilter={categoryFilter} />
      </div>
    </DashboardLayout>
  );
};

export default Products;
