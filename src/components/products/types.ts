
export type DbProduct = {
  prodcode: string;
  description: string | null;
  unit: string | null;
  current_price?: number;
};

export type DbPriceHistory = {
  prodcode: string;
  effdate: string;
  unitprice: number;
};

export type ProductWithDetails = DbProduct & {
  priceHistory?: DbPriceHistory[];
};
