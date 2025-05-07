
export type DbProduct = {
  prodcode: string;
  description: string | null;
  unit: string | null;
  current_price?: number;
};
