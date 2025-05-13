
"use client"

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { motion } from "framer-motion";
import { DbProduct, ProductWithDetails } from "./types";
import { fetchProductDetails, fetchProducts } from "./productUtils";
import ProductTableRow from "./ProductTableRow";
import AddPriceDialog from "./AddPriceDialog";
import DeleteProductDialog from "./DeleteProductDialog";
import EditProductDialog from "./EditProductDialog";
import PriceHistoryModal from "./PriceHistoryModal";

interface ProductsTableProps {
  searchQuery: string;
  categoryFilter: string;
}

const ProductsTable: React.FC<ProductsTableProps> = ({ searchQuery, categoryFilter }) => {
  const navigate = useNavigate();
  const [isAddPriceOpen, setIsAddPriceOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [isPriceHistoryOpen, setIsPriceHistoryOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<DbProduct | null>(null);
  const [detailedProduct, setDetailedProduct] = useState<ProductWithDetails | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['products-table'],
    queryFn: fetchProducts,
  });

  const handleEditClick = (product: DbProduct) => {
    setSelectedProduct(product);
    setIsEditProductOpen(true);
  };

  const handleAddPriceClick = (product: DbProduct) => {
    setSelectedProduct(product);
    setIsAddPriceOpen(true);
  };

  const handleViewPriceHistory = async (product: DbProduct) => {
    try {
      // Fetch full product details including price history
      const details = await fetchProductDetails(product.prodcode);
      if (details) {
        setDetailedProduct(details);
        setIsPriceHistoryOpen(true);
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
    }
  };

  const handleDeleteClick = (product: DbProduct) => {
    setProductToDelete(product.prodcode);
    setDeleteDialogOpen(true);
  };

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
      <div className="flex justify-center items-center p-8 text-foreground">
        <div className="animate-pulse-subtle">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive-foreground rounded-md">
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

  const tableVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  return (
    <div className="overflow-x-auto">
      <motion.div
        variants={tableVariants}
        initial="hidden"
        animate="visible"
      >
        <Table className="border border-border rounded-lg overflow-hidden">
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead className="text-foreground font-semibold">Product Code</TableHead>
              <TableHead className="text-foreground font-semibold">Description</TableHead>
              <TableHead className="text-foreground font-semibold">Unit</TableHead>
              <TableHead className="text-right text-foreground font-semibold">Current Price</TableHead>
              <TableHead className="text-center text-foreground font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                  No products matching your search criteria
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <ProductTableRow
                  key={product.prodcode}
                  product={product}
                  onEdit={handleEditClick}
                  onAddPrice={handleAddPriceClick}
                  onDelete={handleDeleteClick}
                  onViewPriceHistory={handleViewPriceHistory}
                />
              ))
            )}
          </TableBody>
        </Table>
      </motion.div>

      {/* Dialogs */}
      <AddPriceDialog
        isOpen={isAddPriceOpen}
        onOpenChange={setIsAddPriceOpen}
        selectedProduct={selectedProduct}
      />

      <EditProductDialog
        isOpen={isEditProductOpen}
        onOpenChange={setIsEditProductOpen}
        product={selectedProduct}
      />

      <PriceHistoryModal
        isOpen={isPriceHistoryOpen}
        onOpenChange={setIsPriceHistoryOpen}
        product={detailedProduct}
      />

      <DeleteProductDialog
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        productCode={productToDelete}
      />
    </div>
  );
};

export default ProductsTable;
