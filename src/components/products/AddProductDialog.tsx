
"use client"

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface AddProductDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddProductDialog: React.FC<AddProductDialogProps> = ({ 
  isOpen, 
  onOpenChange
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

  const [priceHistory, setPriceHistory] = useState<Array<{effdate: string, unitprice: number}>>([]);
  const [newPrice, setNewPrice] = useState<{effdate: string, unitprice: string}>({
    effdate: '',
    unitprice: ''
  });
  const [showNewPriceForm, setShowNewPriceForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const queryClient = useQueryClient();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      prodcode: '',
      description: '',
      unit: ''
    });
    setPriceHistory([]);
    setNewPrice({ effdate: '', unitprice: '' });
    setShowNewPriceForm(false);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleNewPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewPrice(prev => ({ ...prev, [name]: value }));
  };

  const handleAddPrice = () => {
    if (!newPrice.effdate || !newPrice.unitprice) {
      toast.error("Effectivity date and unit price are required");
      return;
    }

    const unitPrice = parseFloat(newPrice.unitprice);
    if (isNaN(unitPrice)) {
      toast.error("Unit price must be a valid number");
      return;
    }

    setPriceHistory([
      { effdate: newPrice.effdate, unitprice: unitPrice },
      ...priceHistory
    ]);
    setNewPrice({ effdate: '', unitprice: '' });
    setShowNewPriceForm(false);
  };

  const handleRemovePrice = (index: number) => {
    setPriceHistory(priceHistory.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!formData.prodcode || !formData.description) {
      toast.error("Product code and description are required");
      return;
    }

    setIsSubmitting(true);
    try {
      // Check if product with this code already exists
      const { data: existingProduct } = await supabase
        .from('product')
        .select('prodcode')
        .eq('prodcode', formData.prodcode)
        .single();
      
      if (existingProduct) {
        toast.error("A product with this code already exists");
        setIsSubmitting(false);
        return;
      }

      // Add the new product
      const { error } = await supabase
        .from('product')
        .insert([{
          prodcode: formData.prodcode,
          description: formData.description,
          unit: formData.unit || null
        }]);
      
      if (error) throw error;
      
      // Add price history if any
      if (priceHistory.length > 0) {
        const priceInserts = priceHistory.map(price => ({
          prodcode: formData.prodcode,
          effdate: price.effdate,
          unitprice: price.unitprice
        }));

        const { error: priceError } = await supabase
          .from('pricehist')
          .insert(priceInserts);
        
        if (priceError) throw priceError;
      }
      
      toast.success("Product added successfully");
      queryClient.invalidateQueries({ queryKey: ['products-table'] });
      resetForm();
      onOpenChange(false);
    } catch (error) {
      toast.error(`Error adding product: ${(error as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid gap-4">
            <div className="flex flex-col">
              <Label htmlFor="prodcode">Product Code</Label>
              <Input
                id="prodcode"
                name="prodcode"
                value={formData.prodcode}
                onChange={handleChange}
                placeholder="Enter product code"
              />
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
              <h3 className="font-bold text-lg">Manage Price History</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowNewPriceForm(true)}
              >
                Add Price
              </Button>
            </div>
            
            <Table className="border">
              <TableHeader>
                <TableRow>
                  <TableHead>Effectivity Date</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Current Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {priceHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">No price history available</TableCell>
                  </TableRow>
                ) : (
                  priceHistory.map((price, index) => (
                    <TableRow key={`${price.effdate}-${index}`}>
                      <TableCell>{price.effdate}</TableCell>
                      <TableCell>${price.unitprice.toFixed(2)}</TableCell>
                      <TableCell>{formData.unit}</TableCell>
                      <TableCell>
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="text-red-500" 
                          onClick={() => handleRemovePrice(index)}
                        >
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
                
                {showNewPriceForm && (
                  <TableRow>
                    <TableCell>
                      <Input 
                        type="date" 
                        name="effdate"
                        value={newPrice.effdate} 
                        onChange={handleNewPriceChange}
                        placeholder="YYYY-MM-DD"
                      />
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
                    <TableCell colSpan={2} className="text-right">
                      <Button variant="link" size="sm" onClick={handleAddPrice} className="mr-2">
                        Add
                      </Button>
                      <Button 
                        variant="link" 
                        size="sm" 
                        onClick={() => {
                          setNewPrice({ effdate: '', unitprice: '' });
                          setShowNewPriceForm(false);
                        }}
                      >
                        Cancel
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Adding..." : "Add Product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductDialog;
