
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useProductMutations = () => {
  const queryClient = useQueryClient();
  
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
    },
    onError: (error) => {
      toast.error(`Error adding price: ${(error as Error).message}`);
    }
  });
  
  return { deleteMutation, addPriceMutation };
};
