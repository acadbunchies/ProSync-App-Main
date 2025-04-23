import React from "react";
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
import { Edit, Trash2 } from "lucide-react";

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
                      onClick={() => window.location.href = `/add-product?edit=${encodeURIComponent(product.prodcode)}`}
                      size="sm"
                      className="bg-[#6c2bd9] hover:bg-[#5924b5] text-white"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="bg-[#ff4d4f] hover:bg-[#cc3c3d] text-white"
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
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductsTable;
