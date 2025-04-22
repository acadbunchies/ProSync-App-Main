import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

  const [editingPriceIdx, setEditingPriceIdx] = useState<number | null>(null);
  const [editPriceForm, setEditPriceForm] = useState<{ effdate: string; unitprice: string }>({ effdate: "", unitprice: "" });

  const [isLoading, setIsLoading] = useState(false);
  const [isPriceLoading, setIsPriceLoading] = useState(false);

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

  useEffect(() => {
    if (!form.prodcode) return;
    fetchPriceHistory(form.prodcode);
  }, [form.prodcode]);

  const fetchPriceHistory = async (prodcode: string) => {
    setIsPriceLoading(true);
    const { data } = await supabase
      .from("pricehist")
      .select("effdate, unitprice, prodcode")
      .eq("prodcode", prodcode)
      .order("effdate", { ascending: false });
    setPriceHist(data || []);
    if (data && data.length > 0) setCurrentPrice(data[0].unitprice);
    else setCurrentPrice(null);
    setIsPriceLoading(false);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "prodcode" && value.trim() !== "") {
      setPriceHist([]);
      setCurrentPrice(null);
      fetchPriceHistory(value);
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

  const handleInlineEditClick = (idx: number) => {
    setEditingPriceIdx(idx);
    setEditPriceForm({
      effdate: priceHist[idx].effdate,
      unitprice: priceHist[idx].unitprice?.toFixed(2) ?? "",
    });
  };

  const handleInlineEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditPriceForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleInlineEditSave = async (idx: number) => {
    const price = priceHist[idx];
    const { effdate, unitprice } = editPriceForm;
    if (
      effdate === price.effdate &&
      parseFloat(unitprice) === price.unitprice
    ) {
      setEditingPriceIdx(null);
      return;
    }
    const { error } = await supabase
      .from("pricehist")
      .update({
        effdate,
        unitprice: parseFloat(unitprice),
      })
      .eq("prodcode", price.prodcode)
      .eq("effdate", price.effdate);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Price updated.");
      fetchPriceHistory(price.prodcode);
      setEditingPriceIdx(null);
    }
  };

  const handleInlineEditCancel = () => {
    setEditingPriceIdx(null);
  };

  const handlePriceDelete = async (ph: PriceHist) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this price history record?"
      )
    )
      return;
    const { error } = await supabase
      .from("pricehist")
      .delete()
      .eq("prodcode", ph.prodcode)
      .eq("effdate", ph.effdate);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Price deleted.");
      fetchPriceHistory(ph.prodcode);
    }
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
    const newEntry: PriceHist = {
      prodcode: form.prodcode,
      effdate: newPrice.effdate,
      unitprice: parseFloat(newPrice.unitprice),
    };
    const { error } = await supabase
      .from("pricehist")
      .insert([newEntry]);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Price added.");
      setPriceHist((curr) => {
        const updated = [newEntry, ...curr].sort(
          (a, b) => new Date(b.effdate).getTime() - new Date(a.effdate).getTime()
        );
        return updated;
      });
      setCurrentPrice(newEntry.unitprice);
      setNewPrice({ effdate: "", unitprice: "" });
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto border border-black mt-8 p-8 bg-white min-h-[60vh]">
        <h1 className="text-2xl font-bold mb-4">{editCode ? "Edit Product" : "Add New Product"}</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {editCode ? (
            <div className="mb-10">
              <div className="mb-2">
                <span className="font-normal">Product Code </span>
                <span className="ml-1 font-mono">{form.prodcode}</span>
              </div>
              <div className="mb-2">
                <span className="font-normal">Description </span>
                <span className="ml-1">{form.description}</span>
              </div>
              <div>
                <span className="font-normal">Unit </span>
                <span className="ml-1">{form.unit}</span>
              </div>
            </div>
          ) : (
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
          )}

          <div className="grid grid-cols-2 gap-12 mt-4">
            <div>
              <div className="font-bold mb-2">Manage Price History</div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/3">Effectivity Date</TableHead>
                    <TableHead className="w-1/3">Unit Price</TableHead>
                    <TableHead className="w-1/6" />
                    <TableHead className="w-1/6" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isPriceLoading ? (
                    <TableRow>
                      <TableCell colSpan={4}>Loading...</TableCell>
                    </TableRow>
                  ) : priceHist.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="italic text-muted-foreground text-center"
                      >
                        No price data.
                      </TableCell>
                    </TableRow>
                  ) : (
                    priceHist.map((ph, idx) => (
                      <TableRow key={ph.effdate}>
                        {editingPriceIdx === idx ? (
                          <>
                            <TableCell>
                              <Input
                                type="date"
                                name="effdate"
                                value={editPriceForm.effdate}
                                onChange={handleInlineEditChange}
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="text"
                                inputMode="decimal"
                                name="unitprice"
                                value={editPriceForm.unitprice}
                                onChange={handleInlineEditChange}
                              />
                            </TableCell>
                            <TableCell>
                              <button
                                type="button"
                                style={{
                                  color: "#2563eb",
                                  textDecoration: "underline",
                                  background: "none",
                                  border: "none",
                                  padding: 0,
                                  cursor: "pointer",
                                }}
                                onClick={() => handleInlineEditSave(idx)}
                              >
                                Save
                              </button>
                            </TableCell>
                            <TableCell>
                              <button
                                type="button"
                                style={{
                                  color: "#2563eb",
                                  textDecoration: "underline",
                                  background: "none",
                                  border: "none",
                                  padding: 0,
                                  cursor: "pointer",
                                }}
                                onClick={handleInlineEditCancel}
                              >
                                Cancel
                              </button>
                            </TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell>{ph.effdate}</TableCell>
                            <TableCell>
                              {ph.unitprice !== null
                                ? `$${ph.unitprice.toFixed(2)}`
                                : "N/A"}
                            </TableCell>
                            <TableCell>
                              <button
                                type="button"
                                style={{
                                  color: "#2563eb",
                                  textDecoration: "underline",
                                  background: "none",
                                  border: "none",
                                  padding: 0,
                                  cursor: "pointer",
                                }}
                                onClick={() => handleInlineEditClick(idx)}
                              >
                                Edit
                              </button>
                            </TableCell>
                            <TableCell>
                              <button
                                type="button"
                                style={{
                                  color: "#2563eb",
                                  textDecoration: "underline",
                                  background: "none",
                                  border: "none",
                                  padding: 0,
                                  cursor: "pointer",
                                }}
                                onClick={() => handlePriceDelete(ph)}
                              >
                                Delete
                              </button>
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <div>
              <div className="font-bold mb-2">Add Price</div>
              <div>
                <form
                  onSubmit={handleAddPrice}
                  className="flex flex-col gap-2 max-w-xs"
                >
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
                    type="text"
                    inputMode="decimal"
                    required
                  />
                  <Button type="submit" className="mt-3">
                    Add Price
                  </Button>
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
              {isLoading ? "Saving..." : (editCode ? "Save" : "Add Product")}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default AddProduct;
