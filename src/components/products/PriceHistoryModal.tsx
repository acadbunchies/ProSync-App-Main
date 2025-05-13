
"use client"

import React from "react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DbPriceHistory, ProductWithDetails } from "./types";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface PriceHistoryModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductWithDetails | null;
}

const PriceHistoryModal: React.FC<PriceHistoryModalProps> = ({ 
  isOpen, 
  onOpenChange,
  product 
}) => {
  if (!product) return null;
  
  const sortedPrices = product.priceHistory ? 
    [...product.priceHistory].sort((a, b) => 
      new Date(b.effdate).getTime() - new Date(a.effdate).getTime()
    ) : [];

  const chartData = product.priceHistory ? 
    [...product.priceHistory]
      .sort((a, b) => new Date(a.effdate).getTime() - new Date(b.effdate).getTime())
      .map(price => ({
        date: format(new Date(price.effdate), 'MM/dd/yyyy'),
        price: Number(price.unitprice)
      })) : [];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle>Price History for {product.description} ({product.prodcode})</DialogTitle>
        </DialogHeader>
        
        {chartData.length > 1 && (
          <div className="h-64 my-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => value.split('/')[0] + '/' + value.split('/')[1]}
                />
                <YAxis 
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  formatter={(value: any) => [`$${value}`, 'Price']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Line 
                  type="monotone"
                  dataKey="price"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        
        <div className="max-h-96 overflow-y-auto">
          <Table className="border border-border rounded-lg overflow-hidden">
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead className="text-foreground font-semibold">Effective Date</TableHead>
                <TableHead className="text-foreground font-semibold">Unit Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPrices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-4 text-muted-foreground">
                    No price history available
                  </TableCell>
                </TableRow>
              ) : (
                sortedPrices.map((price, index) => (
                  <TableRow key={`${price.prodcode}-${price.effdate}-${index}`}>
                    <TableCell>
                      {format(new Date(price.effdate), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell className="font-medium">
                      ${parseFloat(price.unitprice.toString()).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PriceHistoryModal;
