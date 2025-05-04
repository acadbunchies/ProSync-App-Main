
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { format } from "date-fns";

// Extend jsPDF with autotable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface Product {
  prodcode: string;
  description: string;
  unit: string;
  priceHistory?: PriceHistory[];
}

interface PriceHistory {
  prodcode: string;
  effdate: string;
  unitprice: number;
}

export const generatePDF = (products: Product[]): void => {
  // Create a new PDF document
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text("Product List with Price History", 14, 22);
  
  // Add generation date
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generated on: ${format(new Date(), 'MMM dd, yyyy')}`, 14, 30);
  
  // Make sure products are sorted by product code in the PDF too
  const sortedProducts = [...products].sort((a, b) => 
    a.prodcode.localeCompare(b.prodcode)
  );
  
  // Main product table
  const productRows = sortedProducts.map(product => [
    product.prodcode,
    product.description,
    product.unit,
    product.priceHistory && product.priceHistory.length > 0 
      ? `$${parseFloat(product.priceHistory[0].unitprice.toString()).toFixed(2)}`
      : "N/A"
  ]);
  
  doc.autoTable({
    head: [["Code", "Description", "Unit", "Latest Price"]],
    body: productRows,
    startY: 40,
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    margin: { top: 40 }
  });
  
  // Price history details for each product
  let yPosition = (doc as any).lastAutoTable.finalY + 20;
  
  sortedProducts.forEach((product, index) => {
    // Check if we need a new page
    if (yPosition > 260) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Price History for: ${product.description} (${product.prodcode})`, 14, yPosition);
    
    yPosition += 10;
    
    if (product.priceHistory && product.priceHistory.length > 0) {
      const historyRows = product.priceHistory.map(price => [
        format(new Date(price.effdate), 'MMM dd, yyyy'),
        `$${parseFloat(price.unitprice.toString()).toFixed(2)}`
      ]);
      
      doc.autoTable({
        head: [["Effective Date", "Unit Price"]],
        body: historyRows,
        startY: yPosition,
        headStyles: { fillColor: [52, 152, 219], textColor: 255 },
        margin: { left: 14 },
        tableWidth: 100
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 20;
    } else {
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text("No price history available", 14, yPosition);
      yPosition += 15;
    }
  });
  
  // Save the PDF
  doc.save("Product_List_Report.pdf");
};
