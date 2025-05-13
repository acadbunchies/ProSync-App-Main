
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
  const queryClient = useQueryClient();

  // Load product data when dialog opens with a product
  useEffect(() => {
    if (product) {
      setFormData({
        prodcode: product.prodcode,
        description: product.description || '',
        unit: product.unit || ''
      });
    }
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.prodcode || !formData.description) {
      toast.error("Product code and description are required");
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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="prodcode" className="text-right">
              Product Code
            </Label>
            <div className="col-span-3">
              <Input
                id="prodcode"
                name="prodcode"
                value={formData.prodcode}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">Product code cannot be changed</p>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
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
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditProductDialog;
