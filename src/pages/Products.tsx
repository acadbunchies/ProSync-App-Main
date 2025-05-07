
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ProductsTable from "@/components/products/ProductsTable";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

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
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };
  
  return (
    <DashboardLayout>
      <motion.div 
        className="space-y-6 border border-border rounded-lg p-8 bg-card text-card-foreground shadow-sm"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          className="flex flex-row items-center justify-between mb-6"
          variants={itemVariants}
        >
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2 text-foreground">
            Products
          </h1>
          <Button 
            variant="default" 
            size="sm" 
            className="button-pop transition-all"
            onClick={() => window.location.href = '/add-product'}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Product
          </Button>
        </motion.div>

        <motion.div 
          className="flex flex-col sm:flex-row sm:items-center justify-between mb-4"
          variants={itemVariants}
        >
          <div className="relative">
            <span className="font-normal text-foreground">Search product</span>
            <input
              className="ml-2 px-3 py-2 h-9 bg-background border border-input rounded-md outline-none text-base text-foreground focus:ring-2 focus:ring-primary/30 transition-all"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ minWidth: "220px" }}
            />
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <ProductsTable searchQuery={searchQuery} categoryFilter={categoryFilter} />
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Products;
