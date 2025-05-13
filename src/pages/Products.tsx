
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Filter } from "lucide-react";
import ProductsTable from "@/components/products/ProductsTable";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { fetchProductCategories, fetchProducts } from "@/components/products/productUtils";
import { generatePDF } from "@/utils/pdfGenerator";
import AddProductDialog from "@/components/products/AddProductDialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";

const Products = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['productCategories'],
    queryFn: fetchProductCategories,
  });

  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products-table'],
    queryFn: fetchProducts,
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

  const handleGenerateReport = async () => {
    try {
      // Fetch all products with their price histories
      const { data: productsData, error } = await supabase
        .from('product')
        .select('*');
        
      if (error) throw error;
      
      const productsWithPrices = await Promise.all(
        productsData.map(async (product) => {
          const { data: priceHistory } = await supabase
            .from('pricehist')
            .select('*')
            .eq('prodcode', product.prodcode)
            .order('effdate', { ascending: false });
            
          return {
            ...product,
            priceHistory
          };
        })
      );
      
      // Generate and download PDF
      generatePDF(productsWithPrices);
      toast.success("PDF report generated successfully");
    } catch (error) {
      toast.error(`Error generating report: ${(error as Error).message}`);
    }
  };
  
  return (
    <DashboardLayout>
      <motion.div 
        className="space-y-6 border border-primary/20 rounded-lg p-8 bg-card text-card-foreground shadow-medium hover:shadow-colored transition-all duration-300"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ "--shadow-color": "rgba(142, 120, 255, 0.15)" } as React.CSSProperties}
      >
        <motion.div 
          className="flex flex-row items-center justify-between mb-6"
          variants={itemVariants}
        >
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2 text-foreground">
            <span className="text-gradient">Products</span>
          </h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="button-pop transition-all border-primary/30 hover:border-primary/60"
              onClick={handleGenerateReport}
            >
              <FileText className="mr-1 h-4 w-4" />
              Generate Report
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              className="button-pop transition-all bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => setIsAddProductOpen(true)}
            >
              <Plus className="mr-1 h-4 w-4" />
              Add Product
            </Button>
          </div>
        </motion.div>

        <motion.div 
          className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4"
          variants={itemVariants}
        >
          <div className="relative">
            <span className="font-normal text-foreground">Search product</span>
            <input
              className="ml-2 px-3 py-2 h-9 bg-background border border-input/50 rounded-md outline-none text-base text-foreground focus:ring-2 focus:ring-primary/30 transition-all shadow-inner-glow focus:shadow-colored"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ minWidth: "220px", "--shadow-color": "rgba(142, 120, 255, 0.1)" } as React.CSSProperties}
            />
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              className={`button-pop transition-all ${showFilters ? 'border-primary/60' : 'border-input/50'}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-1 h-4 w-4" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
            
            {showFilters && (
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px] h-9 border-input/50 focus:ring-primary/30">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <ProductsTable searchQuery={searchQuery} categoryFilter={categoryFilter} />
        </motion.div>

        <AddProductDialog isOpen={isAddProductOpen} onOpenChange={setIsAddProductOpen} />
      </motion.div>
    </DashboardLayout>
  );
};

export default Products;
