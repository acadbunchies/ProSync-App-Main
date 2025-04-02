
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import { getProductById } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import PriceChart from "@/components/PriceChart";
import { toast } from "sonner";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const product = getProductById(id || "");

  if (!product) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <h2 className="text-2xl font-bold mb-4">Product not found</h2>
          <p className="text-muted-foreground mb-8">The product you're looking for doesn't exist or was removed.</p>
          <Button onClick={() => navigate("/products")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const handleDelete = () => {
    toast.success(`Product "${product.name}" has been deleted`);
    navigate("/products");
  };

  const handleEdit = () => {
    toast.info("Edit functionality would be implemented here");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div>
            <Button variant="ghost" size="sm" className="mb-2" onClick={() => navigate("/products")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
          </div>
          <div className="flex gap-2 self-start">
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-[2fr,3fr] gap-6">
          <div className="space-y-6">
            <Card>
              <CardContent className="p-0">
                <div className="aspect-square overflow-hidden">
                  <img 
                    src={product.images[0].url} 
                    alt={product.images[0].alt}
                    className="w-full h-full object-cover"
                  />
                </div>
                {product.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2 p-4">
                    {product.images.map((image) => (
                      <div 
                        key={image.id} 
                        className="aspect-square rounded-md overflow-hidden border border-border cursor-pointer"
                      >
                        <img 
                          src={image.url} 
                          alt={image.alt}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">SKU</h3>
                    <p>{product.sku}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Category</h3>
                    <Badge variant="secondary">{product.category}</Badge>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag) => (
                        <Badge key={tag} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Current Price</h3>
                    <div className="text-3xl font-bold">${product.currentPrice.toFixed(2)}</div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Stock</h3>
                    <div className="text-xl font-medium">{product.stockQuantity} units</div>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                    <p className="text-sm">{product.description}</p>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <div>
                      <h3 className="font-medium text-muted-foreground mb-1">Created</h3>
                      <p>{new Date(product.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-muted-foreground mb-1">Last Updated</h3>
                      <p>{new Date(product.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <PriceChart priceHistory={product.priceHistory} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProductDetail;
