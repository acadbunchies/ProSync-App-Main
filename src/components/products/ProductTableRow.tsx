
import React from "react";
import { TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { DbProduct } from "./types";

interface ProductTableRowProps {
  product: DbProduct;
  onEdit: (prodcode: string) => void;
  onAddPrice: (product: DbProduct) => void;
  onDelete: (product: DbProduct) => void;
}

const ProductTableRow: React.FC<ProductTableRowProps> = ({ 
  product, 
  onEdit, 
  onAddPrice, 
  onDelete 
}) => {
  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.tr
      variants={rowVariants}
      className="group border-b border-border hover:bg-muted/50 transition-colors"
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
        <div className="flex justify-center gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
          <Button
            onClick={() => onEdit(product.prodcode)}
            size="sm"
            variant="edit"
            className="button-pop transition-all"
          >
            <Pencil className="h-4 w-4 mr-1" /> 
            Edit
          </Button>
          <Button
            size="sm"
            variant="price"
            className="button-pop transition-all"
            onClick={() => onAddPrice(product)}
          >
            <Plus className="h-4 w-4 mr-1" /> Price
          </Button>
          <Button
            variant="delete"
            size="sm"
            className="button-pop transition-all"
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
