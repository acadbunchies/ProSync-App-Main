
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
  const [newPrice, setNewPrice] = useState<{effdate: string, unitprice: string}>({
    effdate: '',
    unitprice: ''
  });
  const [showNewPriceForm, setShowNewPriceForm] = useState(false);
  
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
    } catch (error) {
      toast.error(`Error updating price: ${(error as Error).message}`);
    }
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
    } catch (error) {
      toast.error(`Error adding price: ${(error as Error).message}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="font-semibold">Product Code</span>
              <span>{formData.prodcode}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="font-semibold">Description</span>
              <span>{formData.description}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="font-semibold">Unit</span>
              <span>{formData.unit}</span>
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
                  <TableHead className="w-24"></TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {priceHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">No price history available</TableCell>
                  </TableRow>
                ) : (
                  <>
                    {priceHistory.map((price, index) => (
                      <TableRow key={`${price.effdate}-${index}`}>
                        {editingPrice.index === index ? (
                          <>
                            <TableCell>
                              <Input 
                                type="date" 
                                name="effdate"
                                value={editingPrice.effdate} 
                                onChange={(e) => setEditingPrice(prev => ({...prev, effdate: e.target.value}))}
                              />
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
                              <Button variant="link" size="sm" onClick={handleSaveEditedPrice}>
                                Save
                              </Button>
                            </TableCell>
                            <TableCell>
                              <Button variant="link" size="sm" onClick={() => setEditingPrice({ index: null, effdate: '', unitprice: '' })}>
                                Cancel
                              </Button>
                            </TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell>{format(new Date(price.effdate), 'dd-MMM-yyyy')}</TableCell>
                            <TableCell>${price.unitprice.toFixed(2)}</TableCell>
                            <TableCell>
                              <Button variant="link" size="sm" onClick={() => handleEditPrice(index)}>
                                Edit
                              </Button>
                            </TableCell>
                            <TableCell>
                              <Button variant="link" size="sm" className="text-red-500" onClick={() => handleDeletePrice(price.effdate)}>
                                Delete
                              </Button>
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    ))}
                    
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
                        <TableCell>
                          <Button variant="link" size="sm" onClick={handleAddNewPrice}>
                            Save
                          </Button>
                        </TableCell>
                        <TableCell>
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
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditProductDialog;
