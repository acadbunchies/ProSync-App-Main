
"use client"

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DbProduct } from "./types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface EditProductDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product: DbProduct | null;
}

const EditProductDialog: React.FC<EditProductDialogProps> = ({ 
  isOpen, 
  onOpenChange,
  product 
}) => {
  const [formData, setFormData] = useState<{
    prodcode: string;
    description: string;
    unit: string;
  }>({
    prodcode: '',
    description: '',
    unit: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [priceHistory, setPriceHistory] = useState<Array<{effdate: string, unitprice: number}>>([]);
  const [editingPrice, setEditingPrice] = useState<{index: number | null, effdate: string, unitprice: string}>({
    index: null,
    effdate: '',
    unitprice: ''
  });
  const [editDatePickerOpen, setEditDatePickerOpen] = useState(false);
  const [editSelectedDate, setEditSelectedDate] = useState<Date | undefined>(undefined);
  
  const [newPrice, setNewPrice] = useState<{effdate: string, unitprice: string}>({
    effdate: '',
    unitprice: ''
  });
  const [showNewPriceForm, setShowNewPriceForm] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  
  const queryClient = useQueryClient();

  // Load product data when dialog opens with a product
  useEffect(() => {
    if (product) {
      setFormData({
        prodcode: product.prodcode,
        description: product.description || '',
        unit: product.unit || ''
      });
      fetchPriceHistory(product.prodcode);
    }
  }, [product]);

  const fetchPriceHistory = async (prodcode: string) => {
    try {
      const { data, error } = await supabase
        .from('pricehist')
        .select('effdate, unitprice')
        .eq('prodcode', prodcode)
        .order('effdate', { ascending: false });
      
      if (error) throw error;
      setPriceHistory(data || []);
    } catch (error) {
      console.error('Error fetching price history:', error);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    
    if (date) {
      const formattedDate = date.toISOString().split('T')[0];
      setNewPrice(prev => ({ ...prev, effdate: formattedDate }));
      setIsDatePickerOpen(false);
    }
  };

  const handleEditDateSelect = (date: Date | undefined) => {
    setEditSelectedDate(date);
    
    if (date) {
      const formattedDate = date.toISOString().split('T')[0];
      setEditingPrice(prev => ({ ...prev, effdate: formattedDate }));
      setEditDatePickerOpen(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNewPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewPrice(prev => ({ ...prev, [name]: value }));
  };

  const handleAddNewPrice = async () => {
    if (!newPrice.effdate || !newPrice.unitprice) {
      toast.error("Effectivity date and unit price are required");
      return;
    }

    try {
      const { error } = await supabase
        .from('pricehist')
        .insert({
          prodcode: product?.prodcode,
          effdate: newPrice.effdate,
          unitprice: parseFloat(newPrice.unitprice)
        });
      
      if (error) throw error;
      
      toast.success("Price added successfully");
      fetchPriceHistory(product?.prodcode || '');
      setNewPrice({ effdate: '', unitprice: '' });
      setShowNewPriceForm(false);
      setSelectedDate(undefined);
    } catch (error) {
      toast.error(`Error adding price: ${(error as Error).message}`);
    }
  };

  const handleSubmit = async () => {
    if (!formData.description) {
      toast.error("Description is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('product')
        .update({
          description: formData.description,
          unit: formData.unit
        })
        .eq('prodcode', product?.prodcode);
      
      if (error) throw error;
      
      toast.success("Product updated successfully");
      queryClient.invalidateQueries({ queryKey: ['products-table'] });
      onOpenChange(false);
    } catch (error) {
      toast.error(`Error updating product: ${(error as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPrice = (index: number) => {
    const price = priceHistory[index];
    setEditingPrice({
      index,
      effdate: price.effdate,
      unitprice: price.unitprice.toString()
    });
    setEditSelectedDate(new Date(price.effdate));
  };

  const handleDeletePrice = async (effdate: string) => {
    try {
      const { error } = await supabase
        .from('pricehist')
        .delete()
        .eq('prodcode', product?.prodcode)
        .eq('effdate', effdate);
      
      if (error) throw error;
      
      toast.success("Price deleted successfully");
      fetchPriceHistory(product?.prodcode || '');
    } catch (error) {
      toast.error(`Error deleting price: ${(error as Error).message}`);
    }
  };

  const handleSaveEditedPrice = async () => {
    if (!editingPrice.unitprice) {
      toast.error("Unit price is required");
      return;
    }

    try {
      const originalEffdate = priceHistory[editingPrice.index!].effdate;
      
      // Delete the old price entry
      await supabase
        .from('pricehist')
        .delete()
        .eq('prodcode', product?.prodcode)
        .eq('effdate', originalEffdate);
      
      // Add the updated price entry
      const { error } = await supabase
        .from('pricehist')
        .insert({
          prodcode: product?.prodcode,
          effdate: editingPrice.effdate,
          unitprice: parseFloat(editingPrice.unitprice)
        });
      
      if (error) throw error;
      
      toast.success("Price updated successfully");
      fetchPriceHistory(product?.prodcode || '');
      setEditingPrice({ index: null, effdate: '', unitprice: '' });
      setEditSelectedDate(undefined);
    } catch (error) {
      toast.error(`Error updating price: ${(error as Error).message}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid gap-4">
            <div className="flex flex-col">
              <Label>Product Code</Label>
              <div className="text-sm font-medium mt-1">{formData.prodcode}</div>
            </div>
            
            <div className="flex flex-col">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter product description"
              />
            </div>
            
            <div className="flex flex-col">
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                placeholder="Enter unit (e.g., pieces, kg, box)"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-lg">Price History</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowNewPriceForm(true)}
              >
                Add Price
              </Button>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Effectivity Date</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {priceHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4">No price history available</TableCell>
                  </TableRow>
                ) : (
                  <>
                    {priceHistory.map((price, index) => (
                      <TableRow key={`${price.effdate}-${index}`}>
                        {editingPrice.index === index ? (
                          <>
                            <TableCell>
                              <Popover open={editDatePickerOpen} onOpenChange={setEditDatePickerOpen}>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full justify-start text-left font-normal",
                                      !editSelectedDate && "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {editSelectedDate ? format(editSelectedDate, "yyyy-MM-dd") : <span>Select date</span>}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={editSelectedDate}
                                    onSelect={handleEditDateSelect}
                                    initialFocus
                                    className={cn("p-3 pointer-events-auto")}
                                  />
                                </PopoverContent>
                              </Popover>
                            </TableCell>
                            <TableCell>
                              <Input 
                                type="text" 
                                name="unitprice"
                                value={editingPrice.unitprice} 
                                onChange={(e) => setEditingPrice(prev => ({...prev, unitprice: e.target.value}))}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button variant="link" size="sm" onClick={handleSaveEditedPrice} className="p-0 h-auto">
                                  Save
                                </Button>
                                <Button variant="link" size="sm" onClick={() => {
                                  setEditingPrice({ index: null, effdate: '', unitprice: '' });
                                  setEditSelectedDate(undefined);
                                }} className="p-0 h-auto">
                                  Cancel
                                </Button>
                              </div>
                            </TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell>{format(new Date(price.effdate), 'yyyy-MM-dd')}</TableCell>
                            <TableCell>${price.unitprice.toFixed(2)}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button variant="link" size="sm" onClick={() => handleEditPrice(index)} className="p-0 h-auto">
                                  Edit
                                </Button>
                                <Button variant="link" size="sm" className="text-red-500 p-0 h-auto" onClick={() => handleDeletePrice(price.effdate)}>
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    ))}
                    
                    {showNewPriceForm && (
                      <TableRow>
                        <TableCell>
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
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={handleDateSelect}
                                initialFocus
                                className={cn("p-3 pointer-events-auto")}
                              />
                            </PopoverContent>
                          </Popover>
                        </TableCell>
                        <TableCell>
                          <Input 
                            type="text" 
                            name="unitprice"
                            value={newPrice.unitprice} 
                            onChange={handleNewPriceChange}
                            placeholder="0.00"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="link" size="sm" onClick={handleAddNewPrice} className="p-0 h-auto">
                              Add
                            </Button>
                            <Button 
                              variant="link" 
                              size="sm" 
                              onClick={() => {
                                setNewPrice({ effdate: '', unitprice: '' });
                                setShowNewPriceForm(false);
                                setSelectedDate(undefined);
                              }}
                              className="p-0 h-auto"
                            >
                              Cancel
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditProductDialog;
