
"use client"

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
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
      <DialogContent className="sm:max-w-[500px] bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="prodcode" className="text-right">
              Product Code*
            </Label>
            <div className="col-span-3">
              <Input
                id="prodcode"
                name="prodcode"
                value={formData.prodcode}
                onChange={handleChange}
                placeholder="Enter unique product code"
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description*
            </Label>
            <div className="col-span-3">
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Product description"
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="unit" className="text-right">
              Unit
            </Label>
            <div className="col-span-3">
              <Input
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                placeholder="Product unit (e.g., pieces, kg, box)"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleClose}
            className="button-pop"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary/90 text-primary-foreground button-pop"
          >
            {isSubmitting ? "Adding..." : "Add Product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductDialog;
