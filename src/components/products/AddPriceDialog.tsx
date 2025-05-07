
import React, { useState } from "react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { DbProduct } from "./types";
import { useProductMutations } from "./useProductMutations";

interface AddPriceDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedProduct: DbProduct | null;
}

const AddPriceDialog: React.FC<AddPriceDialogProps> = ({ 
  isOpen, 
  onOpenChange,
  selectedProduct
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [newPrice, setNewPrice] = useState<{ unitprice: string }>({ unitprice: "" });
  const { addPriceMutation } = useProductMutations();

  const resetForm = () => {
    setSelectedDate(new Date());
    setNewPrice({ unitprice: "" });
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  const handleNewPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPrice({ unitprice: e.target.value });
  };

  const handleAddPrice = () => {
    if (!selectedProduct || !selectedDate || !newPrice.unitprice) {
      toast.error("Please fill all fields");
      return;
    }

    const unitprice = parseFloat(newPrice.unitprice);
    if (isNaN(unitprice)) {
      toast.error("Please enter a valid price");
      return;
    }

    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    
    addPriceMutation.mutate({
      prodcode: selectedProduct.prodcode,
      effdate: formattedDate,
      unitprice
    }, {
      onSuccess: () => {
        onOpenChange(false);
        resetForm();
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) resetForm();
    }}>
      <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle>Add Price for {selectedProduct?.description || selectedProduct?.prodcode}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="effdate" className="text-right text-foreground">
              Effectivity Date
            </Label>
            <div className="col-span-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal border-input",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "yyyy-MM-dd") : <span>Select date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-50 bg-popover text-popover-foreground" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="unitprice" className="text-right text-foreground">
              Unit Price
            </Label>
            <div className="col-span-3">
              <Input
                id="unitprice"
                type="text"
                inputMode="decimal"
                pattern="^\d*\.?\d*$"
                value={newPrice.unitprice}
                onChange={handleNewPriceChange}
                placeholder="Enter price (e.g. 9.99)"
                className="bg-input text-foreground"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" className="button-pop">Cancel</Button>
          </DialogClose>
          <Button 
            onClick={handleAddPrice}
            className="bg-primary hover:bg-primary/90 text-primary-foreground button-pop"
            disabled={!selectedDate || !newPrice.unitprice}
          >
            Save Price
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddPriceDialog;
