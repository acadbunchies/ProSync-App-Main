
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import PriceChart from "@/components/PriceChart";

// Types for the data
type Product = {
  prodcode: string;
  description: string;
  unit: string;
  current_price: number;
};

type PriceHistoryItem = {
  prodcode: string;
  effdate: string;
  unitprice: number;
  note?: string;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// Function to fetch products
const fetchProducts = async () => {
  // First get all products
  const { data: products, error: productsError } = await supabase
    .from('product')
    .select('*');
  
  if (productsError) {
    throw new Error(productsError.message);
  }

  // For each product, get the latest price
  const productsWithPrices = await Promise.all(
    products.map(async (product) => {
      const { data: prices, error: pricesError } = await supabase
        .from('pricehist')
        .select('*')
        .eq('prodcode', product.prodcode)
        .order('effdate', { ascending: false })
        .limit(1);

      if (pricesError) {
        console.error(`Error fetching price for ${product.prodcode}:`, pricesError);
        return {
          ...product,
          current_price: null
        };
      }

      return {
        ...product,
        current_price: prices && prices.length > 0 ? prices[0].unitprice : null
      };
    })
  );
  
  return productsWithPrices as Product[];
};

// Function to fetch price history for a product
const fetchPriceHistory = async (prodcode: string) => {
  const { data, error } = await supabase
    .from('pricehist')
    .select('*')
    .eq('prodcode', prodcode)
    .order('effdate', { ascending: false });
  
  if (error) {
    throw new Error(error.message);
  }

  // Map to match the expected format for PriceChart component
  return data.map(item => ({
    date: item.effdate,
    price: item.unitprice,
    note: `Price as of ${formatDate(item.effdate)}`
  }));
};

const ProductsTable: React.FC = () => {
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  
  // Fetch all products
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  // Fetch price history for expanded product
  const { data: priceHistory, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['priceHistory', expandedProduct],
    queryFn: () => expandedProduct ? fetchPriceHistory(expandedProduct) : Promise.resolve([]),
    enabled: !!expandedProduct,
  });

  const toggleExpand = (prodcode: string) => {
    setExpandedProduct(expandedProduct === prodcode ? null : prodcode);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading products...</span>
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
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product Code</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead className="text-right">Current Price</TableHead>
            <TableHead className="w-[50px]">History</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <React.Fragment key={product.prodcode}>
              <TableRow>
                <TableCell className="font-medium">{product.prodcode}</TableCell>
                <TableCell>{product.description}</TableCell>
                <TableCell>{product.unit}</TableCell>
                <TableCell className="text-right">
                  ${product.current_price?.toFixed(2) || "N/A"}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpand(product.prodcode)}
                  >
                    {expandedProduct === product.prodcode ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </TableCell>
              </TableRow>
              {expandedProduct === product.prodcode && (
                <TableRow>
                  <TableCell colSpan={5} className="p-0">
                    <div className="p-4 bg-muted/50">
                      {isLoadingHistory ? (
                        <div className="flex justify-center items-center py-8">
                          <Loader2 className="h-4 w-4 animate-spin text-primary mr-2" />
                          <span>Loading price history...</span>
                        </div>
                      ) : priceHistory && priceHistory.length > 0 ? (
                        <div className="max-w-3xl mx-auto">
                          <PriceChart priceHistory={priceHistory} />
                        </div>
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          No price history available for this product.
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductsTable;
