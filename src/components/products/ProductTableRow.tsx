
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Plus, Trash2, History } from "lucide-react";
import { motion } from "framer-motion";
import { DbProduct } from "./types";

interface ProductTableRowProps {
  product: DbProduct;
  onEdit: (product: DbProduct) => void;
  onAddPrice: (product: DbProduct) => void;
  onDelete: (product: DbProduct) => void;
  onViewPriceHistory: (product: DbProduct) => void;
}

const ProductTableRow: React.FC<ProductTableRowProps> = ({ 
  product, 
  onEdit, 
  onAddPrice, 
  onDelete,
  onViewPriceHistory
}) => {
  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.tr
      variants={rowVariants}
      className="border-b border-border hover:bg-muted/50 transition-colors"
    >
      <TableCell className="font-medium">{product.prodcode}</TableCell>
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
            onClick={() => onEdit(product)}
            size="sm"
            variant="outline"
          >
            <Pencil className="h-4 w-4 mr-1" /> 
            Edit
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAddPrice(product)}
          >
            <Plus className="h-4 w-4 mr-1" /> Price
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewPriceHistory(product)}
          >
            <History className="h-4 w-4 mr-1" /> History
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(product)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </TableCell>
    </motion.tr>
  );
};

export default ProductTableRow;
