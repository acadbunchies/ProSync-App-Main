import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ProductsTable from "@/components/ProductsTable";
import { supabase } from "@/integrations/supabase/client";

const Products = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  
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
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-[#F6F6F7] hover:bg-[#ECECEC] text-[#333333] px-4 py-2 h-9 transition-colors"
            onClick={() => window.location.href = '/add-product'}
          >
            Add Product
          </Button>
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

        <ProductsTable searchQuery={searchQuery} categoryFilter={categoryFilter} />
      </div>
    </DashboardLayout>
  );
};

export default Products;
