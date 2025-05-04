
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Printer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { generatePDF } from "@/utils/pdfGenerator";

interface Product {
  prodcode: string;
  description: string;
  unit: string;
  priceHistory?: PriceHistory[];
}

interface PriceHistory {
  prodcode: string;
  effdate: string; 
  unitprice: number;
}

const Reports = () => {
  const { toast } = useToast();

  // Fetch products with price history
  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['productsWithPriceHistory'],
    queryFn: async () => {
      // Step 1: Get all products
      const { data: productsData, error: productsError } = await supabase
        .from('product')
        .select('*');

      if (productsError) {
        throw productsError;
      }

      // Step 2: For each product, get its price history
      const productsWithHistory = await Promise.all(
        productsData.map(async (product) => {
          const { data: priceHistory, error: priceError } = await supabase
            .from('pricehist')
            .select('*')
            .eq('prodcode', product.prodcode)
            .order('effdate', { ascending: false });

          if (priceError) {
            console.error(`Error fetching price history for ${product.prodcode}:`, priceError);
            return { ...product, priceHistory: [] };
          }

          return { ...product, priceHistory: priceHistory || [] };
        })
      );

      // Sort products alphabetically by product code
      return productsWithHistory.sort((a, b) => a.prodcode.localeCompare(b.prodcode)) as Product[];
    },
  });

  const handlePrintProductList = () => {
    // Generate and download PDF using the utility
    if (products && products.length > 0) {
      generatePDF(products);
      toast({
        title: "PDF Generation",
        description: "Your PDF is being generated and will download shortly.",
      });
    } else {
      toast({
        title: "No Data",
        description: "There is no product data to generate a PDF.",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <Button 
            onClick={handlePrintProductList} 
            className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Printer className="h-4 w-4" />
            <span>Print Product List</span>
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Product List with Price History</CardTitle>
            <CardDescription>
              View all products and their historical pricing information
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingProducts ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex flex-col space-y-2">
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {products.map((product) => (
                  <div key={product.prodcode} className="border rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <h3 className="font-semibold text-lg">{product.description}</h3>
                      <span className="text-muted-foreground">{product.prodcode}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Unit: {product.unit}</p>
                    
                    <div className="mt-2">
                      <h4 className="text-sm font-medium mb-1">Price History:</h4>
                      {product.priceHistory && product.priceHistory.length > 0 ? (
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2">Effective Date</th>
                              <th className="text-right py-2">Unit Price</th>
                            </tr>
                          </thead>
                          <tbody>
                            {product.priceHistory.map((price, index) => (
                              <tr key={index} className="border-b border-border/30">
                                <td className="py-2">
                                  {new Date(price.effdate).toLocaleDateString()}
                                </td>
                                <td className="text-right py-2">
                                  ${parseFloat(price.unitprice.toString()).toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">No price history available</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
