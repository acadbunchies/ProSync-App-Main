
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type ProductFormState = {
  prodcode: string;
  description: string;
  unit: string;
};

type PriceHist = {
  effdate: string;
  unitprice: number | null;
  prodcode: string;
};

const AddProduct = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editCode = searchParams.get("edit");

  const [form, setForm] = useState<ProductFormState>({
    prodcode: "",
    description: "",
    unit: "",
  });

  const [priceHist, setPriceHist] = useState<PriceHist[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [newPrice, setNewPrice] = useState<{ effdate: string; unitprice: string }>({
    effdate: "",
    unitprice: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isPriceLoading, setIsPriceLoading] = useState(false);

  // Fetch for edit
  useEffect(() => {
    if (!editCode) return;
    setIsLoading(true);
    supabase
      .from("product")
      .select("*")
      .eq("prodcode", editCode)
      .maybeSingle()
      .then(({ data, error }) => {
        if (data) {
          setForm({
            prodcode: data.prodcode,
            description: data.description ?? "",
            unit: data.unit ?? "",
          });
        }
        setIsLoading(false);
      });
  }, [editCode]);

  // Fetch price history when prodcode changes
  useEffect(() => {
    if (!form.prodcode) return;
    setIsPriceLoading(true);
    supabase
      .from("pricehist")
      .select("effdate, unitprice, prodcode")
      .eq("prodcode", form.prodcode)
      .order("effdate", { ascending: false })
      .then(({ data }) => {
        setPriceHist(data || []);
        if (data && data.length > 0) setCurrentPrice(data[0].unitprice);
        else setCurrentPrice(null);
        setIsPriceLoading(false);
      });
  }, [form.prodcode]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "prodcode" && value.trim() !== "") {
      // If prodcode changed, clear price hist and fetch for the new code
      setPriceHist([]);
      setCurrentPrice(null);
      setIsPriceLoading(true);
      supabase
        .from("pricehist")
        .select("effdate, unitprice, prodcode")
        .eq("prodcode", value)
        .order("effdate", { ascending: false })
        .then(({ data }) => {
          setPriceHist(data || []);
          if (data && data.length > 0) setCurrentPrice(data[0].unitprice);
          else setCurrentPrice(null);
          setIsPriceLoading(false);
        });
    }
  };

  const handleNewPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewPrice((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.prodcode || !form.unit) {
      toast.error("Product Code and Unit are required.");
      return;
    }

    setIsLoading(true);

    if (editCode) {
      // Update
      const { error } = await supabase
        .from("product")
        .update({
          description: form.description,
          unit: form.unit,
        })
        .eq("prodcode", editCode);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Product updated.");
        navigate("/products");
      }
    } else {
      // Insert
      const { error } = await supabase.from("product").insert([form]);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Product added.");
        navigate("/products");
      }
    }

    setIsLoading(false);
  };

  const handleAddPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.prodcode) {
      toast.error("Product Code required first.");
      return;
    }
    if (!newPrice.effdate || !newPrice.unitprice) {
      toast.error("Effectivity date and Unit Price required.");
      return;
    }
    // Insert price history
    const { error } = await supabase.from("pricehist").insert([{
      prodcode: form.prodcode,
      effdate: newPrice.effdate,
      unitprice: parseFloat(newPrice.unitprice),
    }]);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Price added.");
      // Refresh price history on success
      supabase
        .from("pricehist")
        .select("effdate, unitprice, prodcode")
        .eq("prodcode", form.prodcode)
        .order("effdate", { ascending: false })
        .then(({ data }) => {
          setPriceHist(data || []);
          if (data && data.length > 0) setCurrentPrice(data[0].unitprice);
          else setCurrentPrice(null);
        });
      setNewPrice({ effdate: "", unitprice: "" });
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto border border-black mt-8 p-8 bg-white min-h-[60vh]">
        <h1 className="text-2xl font-bold mb-4">Add New Product</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col gap-2 mb-10">
            <Label htmlFor="prodcode" className="font-normal">Product Code</Label>
            <Input
              id="prodcode"
              name="prodcode"
              value={form.prodcode}
              onChange={handleFormChange}
              required
              disabled={!!editCode}
              className="max-w-sm"
            />
            <Label htmlFor="description" className="font-normal">Description</Label>
            <Input
              id="description"
              name="description"
              value={form.description}
              onChange={handleFormChange}
              className="max-w-lg"
            />
            <Label htmlFor="unit" className="font-normal">Unit</Label>
            <Input
              id="unit"
              name="unit"
              value={form.unit}
              onChange={handleFormChange}
              required
              className="max-w-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-12 mt-4">
            {/* Left: Price History */}
            <div>
              <div className="font-bold mb-2">Manage Price History</div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-2/5">Effectivity Date</TableHead>
                    <TableHead className="w-2/5">Unit Price</TableHead>
                    <TableHead className="w-1/5">Unit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isPriceLoading ? (
                    <TableRow>
                      <TableCell colSpan={3}>Loading...</TableCell>
                    </TableRow>
                  ) : priceHist.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="italic text-muted-foreground text-center">No price data.</TableCell>
                    </TableRow>
                  ) : (
                    priceHist.map((ph) => (
                      <TableRow key={ph.effdate}>
                        <TableCell>{ph.effdate}</TableCell>
                        <TableCell>
                          {ph.unitprice !== null ? `$${ph.unitprice.toFixed(2)}` : "N/A"}
                        </TableCell>
                        <TableCell>{form.unit}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {/* Right: Add Price */}
            <div>
              <div className="font-bold mb-2">Add Price</div>
              <div>
                <div className="flex items-center mb-2 gap-2">
                  <span className="font-medium mr-3">Current Price:</span>
                  {currentPrice !== null ? (
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded">${currentPrice.toFixed(2)}</span>
                  ) : (
                    <span className="italic text-muted-foreground">N/A</span>
                  )}
                </div>
                <form onSubmit={handleAddPrice} className="flex flex-col gap-2 max-w-xs">
                  <Label htmlFor="effdate">Effectivity Date</Label>
                  <Input
                    id="effdate"
                    name="effdate"
                    value={newPrice.effdate}
                    onChange={handleNewPriceChange}
                    type="date"
                    required
                  />
                  <Label htmlFor="unitprice">Unit Price</Label>
                  <Input
                    id="unitprice"
                    name="unitprice"
                    value={newPrice.unitprice}
                    onChange={handleNewPriceChange}
                    type="number"
                    step="0.01"
                    min="0"
                    required
                  />
                  <Button type="submit" className="mt-3">Add Price</Button>
                </form>
              </div>
            </div>
          </div>
          <div className="flex gap-4 mt-8 justify-end">
            <Button 
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={() => navigate("/products")}
            >Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : (editCode ? "Save Changes" : "Add Product")}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default AddProduct;
