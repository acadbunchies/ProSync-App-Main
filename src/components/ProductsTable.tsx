
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
  const [selectedProduct, setSelectedProduct] = useState<DbProduct | null>(null);
  const [isAddPriceOpen, setIsAddPriceOpen] = useState(false);
  const [newPrice, setNewPrice] = useState<{ effdate: string; unitprice: string }>({
    effdate: "",
    unitprice: ""
  });
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

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
    }
  });

  const addPriceMutation = useMutation({
    mutationFn: async ({ prodcode, effdate, unitprice }: { prodcode: string; effdate: string; unitprice: number }) => {
      return await supabase
        .from('pricehist')
        .insert([{ prodcode, effdate, unitprice }]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products-table'] });
      setIsAddPriceOpen(false);
      toast.success("Price added successfully");
    },
    onError: (error) => {
      toast.error(`Error adding price: ${error.message}`);
    }
  });

  const handleEditClick = (prodcode: string) => {
    navigate(`/add-product?edit=${encodeURIComponent(prodcode)}`);
  };

  const handleAddPriceClick = (product: DbProduct) => {
    setSelectedProduct(product);
    setIsAddPriceOpen(true);
    // Set default date to today
    const today = new Date();
    setSelectedDate(today);
    setNewPrice({
      effdate: today.toISOString().split('T')[0],
      unitprice: ""
    });
  };

  const handleAddPrice = async () => {
    if (!selectedProduct || !newPrice.effdate || !newPrice.unitprice) {
      toast.error("Please fill all fields");
      return;
    }
    
    addPriceMutation.mutate({
      prodcode: selectedProduct.prodcode,
      effdate: newPrice.effdate,
      unitprice: parseFloat(newPrice.unitprice)
    });
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      const formattedDate = date.toISOString().split('T')[0];
      setNewPrice(prev => ({ ...prev, effdate: formattedDate }));
      setIsDatePickerOpen(false);
    }
  };

  const handleNewPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewPrice(prev => ({ ...prev, [name]: value }));
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
                      onClick={() => handleAddPriceClick(product)}
                      size="sm"
                      className="bg-[#4a5568] hover:bg-[#2d3748] text-white px-4 py-2 h-9 transition-colors"
                    >
                      Add Price
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
      <Dialog open={isAddPriceOpen} onOpenChange={setIsAddPriceOpen}>
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
                <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
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
                    />
                  </PopoverContent>
                </Popover>
                <input
                  type="hidden"
                  name="effdate"
                  value={newPrice.effdate}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unitprice" className="text-right">
                Unit Price
              </Label>
              <div className="col-span-3">
                <Input
                  id="unitprice"
                  name="unitprice"
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
              disabled={!newPrice.effdate || !newPrice.unitprice}
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
