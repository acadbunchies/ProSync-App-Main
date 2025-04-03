
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, TrendingDown, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

interface PriceHistoryItem {
  date: string;
  price: number;
}

interface ProductImage {
  url: string;
  alt: string;
  isPrimary: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  category: string;
  currentPrice: number;
  stockQuantity: number;
  priceHistory: PriceHistoryItem[];
  images: ProductImage[];
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const priceHistory = product.priceHistory;
  const hasPriceHistory = priceHistory.length > 1;
  const previousPrice = hasPriceHistory 
    ? priceHistory[1].price 
    : product.currentPrice;
  const priceTrend = product.currentPrice < previousPrice 
    ? "down" 
    : product.currentPrice > previousPrice 
      ? "up" 
      : "same";
  
  const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-square overflow-hidden bg-secondary/30">
        <img 
          src={primaryImage.url}
          alt={primaryImage.alt}
          className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
        />
      </div>
      <CardHeader className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium truncate">{product.name}</h3>
            <p className="text-sm text-muted-foreground truncate">SKU: {product.sku}</p>
          </div>
          <Badge variant="outline">{product.category}</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-1">
            <span className="font-medium text-lg">${product.currentPrice.toFixed(2)}</span>
            {priceTrend === "down" && (
              <span className="text-green-500 flex items-center text-xs">
                <TrendingDown className="h-3 w-3 mr-1" />
                <span>Reduced</span>
              </span>
            )}
            {priceTrend === "up" && (
              <span className="text-red-500 flex items-center text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span>Increased</span>
              </span>
            )}
          </div>
          <span className="text-sm text-muted-foreground">
            Stock: {product.stockQuantity}
          </span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Link to={`/product/${product.id}`} className="w-full">
          <Button variant="outline" className="w-full justify-between">
            <span>View Details</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
