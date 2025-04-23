
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [showAddPriceForm, setShowAddPriceForm] = useState(false);
  
  // New states for the datepicker
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

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

    try {
      if (editCode) {
        const { error } = await supabase
          .from("product")
          .update({
            description: form.description,
            unit: form.unit,
          })
          .eq("prodcode", editCode);
        
        if (error) throw error;
        toast.success("Product updated successfully.");
        navigate("/products");
      } else {
        const { error } = await supabase.from("product").insert([form]);
        if (error) {
          if (error.code === '23505') {
            toast.error("Product code already exists.");
            return;
          }
          throw error;
        }
        toast.success("Product added successfully.");
        navigate("/products");
      }
    } catch (error) {
      toast.error("Error saving product: " + (error as Error).message);
    } finally {
      setIsLoading(false);
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

    try {
      const formattedDate = new Date(newPrice.effdate).toISOString().split('T')[0];
      
      const { error } = await supabase
        .from("pricehist")
        .insert([{
          prodcode: form.prodcode,
          effdate: formattedDate,
          unitprice: parseFloat(newPrice.unitprice),
        }]);

      if (error) throw error;
      
      toast.success("Price added successfully.");
      await fetchPriceHistory(form.prodcode);
      setNewPrice({ effdate: "", unitprice: "" });
      setShowAddPriceForm(false);
      setSelectedDate(undefined);
    } catch (error) {
      toast.error("Error adding price: " + (error as Error).message);
    }
  };

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    
    if (date) {
      const formattedDate = date.toISOString().split('T')[0];
      setNewPrice(prev => ({ ...prev, effdate: formattedDate }));
      setIsDatePickerOpen(false);
    }
  };

  const handleInlineEditClick = (idx: number) => {
    const price = priceHist[idx];
    setEditingPriceIdx(idx);
    setEditPriceForm({
      effdate: new Date(price.effdate).toISOString().split('T')[0],
      unitprice: price.unitprice !== null ? price.unitprice.toString() : "",
    });
  };

  const handleInlineEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditPriceForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleInlineEditSave = async (idx: number) => {
    if (!form.prodcode) {
      toast.error("Product Code required.");
      return;
    }
    
    if (!editPriceForm.effdate || !editPriceForm.unitprice) {
      toast.error("Both fields are required.");
      return;
    }

    try {
      const originalPrice = priceHist[idx];
      const formattedDate = new Date(editPriceForm.effdate).toISOString().split('T')[0];
      
      if (originalPrice.effdate !== formattedDate) {
        await supabase
          .from("pricehist")
          .delete()
          .eq("prodcode", originalPrice.prodcode)
          .eq("effdate", originalPrice.effdate);
        
        await supabase
          .from("pricehist")
          .insert([{
            prodcode: form.prodcode,
            effdate: formattedDate,
            unitprice: parseFloat(editPriceForm.unitprice),
          }]);
      } else {
        await supabase
          .from("pricehist")
          .update({ unitprice: parseFloat(editPriceForm.unitprice) })
          .eq("prodcode", originalPrice.prodcode)
          .eq("effdate", originalPrice.effdate);
      }
      
      toast.success("Price updated successfully.");
      setEditingPriceIdx(null);
      fetchPriceHistory(form.prodcode);
    } catch (error) {
      toast.error("Error updating price: " + (error as Error).message);
    }
  };

  const handleInlineEditCancel = () => {
    setEditingPriceIdx(null);
    setEditPriceForm({ effdate: "", unitprice: "" });
  };

  const handlePriceDelete = async (price: PriceHist) => {
    if (!window.confirm("Are you sure you want to delete this price?")) {
      return;
    }
    
    try {
      await supabase
        .from("pricehist")
        .delete()
        .eq("prodcode", price.prodcode)
        .eq("effdate", price.effdate);
      
      toast.success("Price deleted successfully.");
      fetchPriceHistory(form.prodcode);
    } catch (error) {
      toast.error("Error deleting price: " + (error as Error).message);
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

          <div className="grid grid-cols-1 gap-8 mt-4">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg">Manage Price History</h2>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddPriceForm(true)}
                  className="text-sm bg-[#F6F6F7] hover:bg-[#ECECEC] text-[#333333] px-4 py-2 h-9 transition-colors"
                >
                  Add Price
                </Button>
              </div>
              
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
                    <>
                      {priceHist.map((ph, idx) => (
                        <TableRow key={`${ph.prodcode}-${ph.effdate}`}>
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
                                  pattern="^\d*\.?\d*$"
                                  autoComplete="off"
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
                              <TableCell>{new Date(ph.effdate).toISOString().split('T')[0]}</TableCell>
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
                      ))}
                      {showAddPriceForm && (
                        <TableRow>
                          <TableCell>
                            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !selectedDate && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {selectedDate ? format(selectedDate, "yyyy-MM-dd") : <span>Select date</span>}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={selectedDate}
                                  onSelect={handleDateSelect}
                                  initialFocus
                                  className={cn("p-3 pointer-events-auto")}
                                />
                              </PopoverContent>
                            </Popover>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="text"
                              inputMode="decimal"
                              name="unitprice"
                              value={newPrice.unitprice}
                              onChange={handleNewPriceChange}
                              pattern="^\d*\.?\d*$"
                              required
                              autoComplete="off"
                              placeholder="Enter price"
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              onClick={handleAddPrice}
                              size="sm"
                              className="bg-[#333333] hover:bg-[#222222] text-white px-4 py-2 h-9 transition-colors"
                            >
                              Save
                            </Button>
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              onClick={() => {
                                setShowAddPriceForm(false);
                                setNewPrice({ effdate: "", unitprice: "" });
                                setSelectedDate(undefined);
                              }}
                              size="sm"
                              className="bg-[#666666] hover:bg-[#444444] text-white px-4 py-2 h-9 transition-colors"
                            >
                              Cancel
                            </Button>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          <div className="flex gap-4 mt-8 justify-end">
            <Button 
              type="button"
              className="bg-[#F6F6F7] hover:bg-[#ECECEC] text-[#333333] px-4 py-2 h-9 transition-colors"
              disabled={isLoading}
              onClick={() => navigate("/products")}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-[#333333] hover:bg-[#222222] text-white px-4 py-2 h-9 transition-colors"
            >
              {isLoading ? "Saving..." : (editCode ? "Save" : "Add Product")}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default AddProduct;
