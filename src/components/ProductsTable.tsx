
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
import { CalendarIcon, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

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

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products-table'],
    queryFn: fetchProducts,
  });

  const deleteMutation = useMutation({
    mutationFn: async (prodcode: string) => {
      await supabase.from('product').delete().eq('prodcode', prodcode);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products-table'] });
      toast.success("Product deleted successfully");
    },
    onError: (error) => {
      toast.error(`Error deleting product: ${(error as Error).message}`);
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
      <div className="flex justify-center items-center p-8">
        Loading products...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md">
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

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product Code</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead className="text-right">Current Price</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredProducts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4">
                No products matching your search criteria
              </TableCell>
            </TableRow>
          ) : (
            filteredProducts.map((product) => (
              <TableRow key={product.prodcode}>
                <TableCell>{product.prodcode}</TableCell>
                <TableCell>{product.description}</TableCell>
                <TableCell>{product.unit}</TableCell>
                <TableCell className="text-right">
                  {product.current_price !== undefined
                    ? `$${Number(product.current_price).toFixed(2)}`
                    : "N/A"}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center gap-2">
                    <Button
                      onClick={() => handleEditClick(product.prodcode)}
                      size="sm"
                      className="bg-[#333333] hover:bg-[#222222] text-white px-4 py-2 h-9 transition-colors"
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      className="bg-[#444444] hover:bg-[#333333] text-white px-4 py-2 h-9 transition-colors"
                      onClick={() => handleAddPriceClick(product)}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Price
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="bg-[#666666] hover:bg-[#444444] text-white px-4 py-2 h-9 transition-colors"
                      onClick={() => {
                        if (
                          window.confirm(
                            `Are you sure you want to delete ${product.description || product.prodcode}?`
                          )
                        ) {
                          deleteMutation.mutate(product.prodcode);
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Add Price Dialog */}
      <Dialog open={isAddPriceOpen} onOpenChange={(open) => {
        setIsAddPriceOpen(open);
        if (!open) resetAddPriceForm();
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Price for {selectedProduct?.description || selectedProduct?.prodcode}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="effdate" className="text-right">
                Effectivity Date
              </Label>
              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "yyyy-MM-dd") : <span>Select date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-50" align="start">
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
              <Label htmlFor="unitprice" className="text-right">
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
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              onClick={handleAddPrice}
              className="bg-[#333333] hover:bg-[#222222] text-white transition-colors"
              disabled={!selectedDate || !newPrice.unitprice}
            >
              Save Price
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductsTable;
