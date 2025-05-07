
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Pencil, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";

type DbProduct = {
  prodcode: string;
  description: string | null;
  unit: string | null;
  current_price?: number;
};

const fetchProducts = async () => {
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

  return productsWithPrices.sort((a, b) => a.prodcode.localeCompare(b.prodcode)) as DbProduct[];
};

interface ProductsTableProps {
  searchQuery: string;
  categoryFilter: string;
}

const ProductsTable: React.FC<ProductsTableProps> = ({ searchQuery, categoryFilter }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isAddPriceOpen, setIsAddPriceOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedProduct, setSelectedProduct] = useState<DbProduct | null>(null);
  const [newPrice, setNewPrice] = useState<{ unitprice: string }>({ unitprice: "" });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products-table'],
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

      return productsWithPrices.sort((a, b) => a.prodcode.localeCompare(b.prodcode)) as DbProduct[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (prodcode: string) => {
      // First, check if there are related pricehist records
      const { data: priceData, error: priceError } = await supabase
        .from('pricehist')
        .select('*')
        .eq('prodcode', prodcode);
      
      if (priceError) throw new Error(priceError.message);
      
      // If price history exists, delete those records first
      if (priceData && priceData.length > 0) {
        const { error: deleteError } = await supabase
          .from('pricehist')
          .delete()
          .eq('prodcode', prodcode);
          
        if (deleteError) throw new Error(deleteError.message);
      }
      
      // Then delete the product
      const { error: productError } = await supabase
        .from('product')
        .delete()
        .eq('prodcode', prodcode);
        
      if (productError) throw new Error(productError.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products-table'] });
      toast.success("Product deleted successfully");
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    },
    onError: (error) => {
      toast.error(`Error deleting product: ${(error as Error).message}`);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  });

  const addPriceMutation = useMutation({
    mutationFn: async ({ prodcode, effdate, unitprice }: { prodcode: string; effdate: string; unitprice: number }) => {
      const { error } = await supabase
        .from('pricehist')
        .insert([{ prodcode, effdate, unitprice }]);
      
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products-table'] });
      toast.success("Price added successfully");
      setIsAddPriceOpen(false);
      resetAddPriceForm();
    },
    onError: (error) => {
      toast.error(`Error adding price: ${(error as Error).message}`);
    }
  });

  const handleEditClick = (prodcode: string) => {
    navigate(`/add-product?edit=${encodeURIComponent(prodcode)}`);
  };

  const handleAddPriceClick = (product: DbProduct) => {
    setSelectedProduct(product);
    const today = new Date();
    setSelectedDate(today);
    setNewPrice({ unitprice: "" });
    setIsAddPriceOpen(true);
  };

  const handleDeleteClick = (product: DbProduct) => {
    setProductToDelete(product.prodcode);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      deleteMutation.mutate(productToDelete);
    }
  };

  const resetAddPriceForm = () => {
    setSelectedProduct(null);
    setSelectedDate(undefined);
    setNewPrice({ unitprice: "" });
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  const handleNewPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPrice({ unitprice: e.target.value });
  };

  const handleAddPrice = () => {
    if (!selectedProduct || !selectedDate || !newPrice.unitprice) {
      toast.error("Please fill all fields");
      return;
    }

    const unitprice = parseFloat(newPrice.unitprice);
    if (isNaN(unitprice)) {
      toast.error("Please enter a valid price");
      return;
    }

    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    
    addPriceMutation.mutate({
      prodcode: selectedProduct.prodcode,
      effdate: formattedDate,
      unitprice
    });
  };

  const filteredProducts = (products ?? [])
    .filter(product => {
      const matchesSearch = 
        (product.description?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (product.prodcode.toLowerCase()).includes(searchQuery.toLowerCase()) ||
        (product.unit?.toLowerCase() || "").includes(searchQuery.toLowerCase());
      
      const matchesCategory = categoryFilter === "all" || product.unit === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => a.prodcode.localeCompare(b.prodcode));

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8 text-foreground">
        <div className="animate-pulse-subtle">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive-foreground rounded-md">
        Error loading products: {(error as Error).message}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No products found in the database.
      </div>
    );
  }

  const tableVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="overflow-x-auto">
      <motion.div
        variants={tableVariants}
        initial="hidden"
        animate="visible"
      >
        <Table className="border border-border rounded-lg overflow-hidden">
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead className="text-foreground font-semibold">Product Code</TableHead>
              <TableHead className="text-foreground font-semibold">Description</TableHead>
              <TableHead className="text-foreground font-semibold">Unit</TableHead>
              <TableHead className="text-right text-foreground font-semibold">Current Price</TableHead>
              <TableHead className="text-center text-foreground font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                  No products matching your search criteria
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <motion.tr
                  key={product.prodcode}
                  variants={rowVariants}
                  className="group border-b border-border hover:bg-muted/50 transition-colors"
                >
                  <TableCell className="font-medium">{product.prodcode}</TableCell>
                  <TableCell>{product.description}</TableCell>
                  <TableCell>{product.unit}</TableCell>
                  <TableCell className="text-right">
                    {product.current_price !== undefined
                      ? `$${Number(product.current_price).toFixed(2)}`
                      : "N/A"}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                      <Button
                        onClick={() => handleEditClick(product.prodcode)}
                        size="sm"
                        variant="outline"
                        className="border-primary/20 hover:border-primary/50 hover:bg-primary/10 button-pop transition-all"
                      >
                        <Pencil className="h-4 w-4 mr-1" /> 
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-primary/20 hover:border-primary/50 hover:bg-primary/10 button-pop transition-all"
                        onClick={() => handleAddPriceClick(product)}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Price
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-destructive/20 hover:border-destructive hover:bg-destructive/10 text-destructive button-pop transition-all"
                        onClick={() => handleDeleteClick(product)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </motion.div>

      {/* Add Price Dialog */}
      <Dialog open={isAddPriceOpen} onOpenChange={(open) => {
        setIsAddPriceOpen(open);
        if (!open) resetAddPriceForm();
      }}>
        <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle>Add Price for {selectedProduct?.description || selectedProduct?.prodcode}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="effdate" className="text-right text-foreground">
                Effectivity Date
              </Label>
              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal border-input",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "yyyy-MM-dd") : <span>Select date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-50 bg-popover text-popover-foreground" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unitprice" className="text-right text-foreground">
                Unit Price
              </Label>
              <div className="col-span-3">
                <Input
                  id="unitprice"
                  type="text"
                  inputMode="decimal"
                  pattern="^\d*\.?\d*$"
                  value={newPrice.unitprice}
                  onChange={handleNewPriceChange}
                  placeholder="Enter price (e.g. 9.99)"
                  className="bg-input text-foreground"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="button-pop">Cancel</Button>
            </DialogClose>
            <Button 
              onClick={handleAddPrice}
              className="bg-primary hover:bg-primary/90 text-primary-foreground button-pop"
              disabled={!selectedDate || !newPrice.unitprice}
            >
              Save Price
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card text-card-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this product and all its price history.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProductToDelete(null)} className="button-pop">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground button-pop"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductsTable;
