
import { supabase } from "@/integrations/supabase/client";
import { DbProduct, DbPriceHistory, ProductWithDetails } from "./types";

export const fetchProducts = async (): Promise<DbProduct[]> => {
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

export const fetchProductDetails = async (prodcode: string): Promise<ProductWithDetails | null> => {
  // Fetch product details
  const { data: product, error: productError } = await supabase
    .from('product')
    .select('*')
    .eq('prodcode', prodcode)
    .single();
  
  if (productError) {
    throw new Error(productError.message);
  }

  if (!product) return null;

  // Fetch price history
  const { data: priceHistory, error: priceError } = await supabase
    .from('pricehist')
    .select('*')
    .eq('prodcode', prodcode)
    .order('effdate', { ascending: false });

  if (priceError) {
    throw new Error(priceError.message);
  }

  return {
    ...product,
    current_price: priceHistory && priceHistory.length > 0 ? priceHistory[0].unitprice : undefined,
    priceHistory: priceHistory as DbPriceHistory[]
  };
};

export const fetchProductCategories = async (): Promise<string[]> => {
  const { data: products, error } = await supabase
    .from('product')
    .select('unit');

  if (error) {
    throw new Error(error.message);
  }

  // Extract unique categories (units)
  const categories = ["all", ...new Set(products.map(p => p.unit).filter(Boolean))];
  return categories;
};
