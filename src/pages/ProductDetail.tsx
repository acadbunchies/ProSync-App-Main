
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import { getProductById } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Trash2, Plus } from "lucide-react";
import PriceChart from "@/components/PriceChart";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const product = getProductById(id || "");

  // State for the add price dialog
  const [isAddPriceOpen, setIsAddPriceOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [newPrice, setNewPrice] = useState<{ effdate: string; unitprice: string }>({
    effdate: "",
    unitprice: ""
  });

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

  const handleAddPrice = async () => {
    if (!id || !newPrice.effdate || !newPrice.unitprice) {
      toast.error("Please fill all fields");
      return;
    }
    
    try {
      await supabase
        .from('pricehist')
        .insert([{ 
          prodcode: id, 
          effdate: newPrice.effdate, 
          unitprice: parseFloat(newPrice.unitprice) 
        }]);
      
      toast.success("Price added successfully");
      queryClient.invalidateQueries({ queryKey: ['products-table'] });
      setIsAddPriceOpen(false);
      
      // Reset the form
      setSelectedDate(undefined);
      setNewPrice({ effdate: "", unitprice: "" });
    } catch (error) {
      toast.error(`Error adding price: ${(error as Error).message}`);
    }
  };

  const handleAddPriceClick = () => {
    // Set default date to today
    const today = new Date();
    setSelectedDate(today);
    setNewPrice({
      effdate: today.toISOString().split('T')[0],
      unitprice: ""
    });
    setIsAddPriceOpen(true);
  };

  if (!product) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <h2 className="text-2xl font-bold mb-4">Product not found</h2>
          <p className="text-muted-foreground mb-8">The product you're looking for doesn't exist or was removed.</p>
          <Button onClick={() => navigate("/products")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const handleDelete = () => {
    toast.success(`Product "${product.name}" has been deleted`);
    navigate("/products");
  };

  const handleEdit = () => {
    toast.info("Edit functionality would be implemented here");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div>
            <Button variant="ghost" size="sm" className="mb-2" onClick={() => navigate("/products")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
          </div>
          <div className="flex gap-2 self-start">
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-[2fr,3fr] gap-6">
          <div className="space-y-6">
            <Card>
              <CardContent className="p-0">
                <div className="aspect-square overflow-hidden">
                  <img 
                    src={product.images[0].url} 
                    alt={product.images[0].alt}
                    className="w-full h-full object-cover"
                  />
                </div>
                {product.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2 p-4">
                    {product.images.map((image) => (
                      <div 
                        key={image.id} 
                        className="aspect-square rounded-md overflow-hidden border border-border cursor-pointer"
                      >
                        <img 
                          src={image.url} 
                          alt={image.alt}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">SKU</h3>
                    <p>{product.sku}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Category</h3>
                    <Badge variant="secondary">{product.category}</Badge>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag) => (
                        <Badge key={tag} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Current Price</h3>
                    <div className="text-3xl font-bold">${product.currentPrice.toFixed(2)}</div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Stock</h3>
                    <div className="text-xl font-medium">{product.stockQuantity} units</div>
                  </div>
                </div>

                <Button 
                  onClick={handleAddPriceClick} 
                  size="sm"
                  className="mb-4 bg-[#333333] hover:bg-[#222222] text-white px-4 py-2 h-9 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Price
                </Button>

                <Separator className="my-4" />

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                    <p className="text-sm">{product.description}</p>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <div>
                      <h3 className="font-medium text-muted-foreground mb-1">Created</h3>
                      <p>{new Date(product.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-muted-foreground mb-1">Last Updated</h3>
                      <p>{new Date(product.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <PriceChart priceHistory={product.priceHistory} />
          </div>
        </div>
      </div>

      {/* Add Price Dialog */}
      <Dialog open={isAddPriceOpen} onOpenChange={setIsAddPriceOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Price for {product.name}</DialogTitle>
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
                      className={cn("p-3 pointer-events-auto")}
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
    </DashboardLayout>
  );
};

export default ProductDetail;
