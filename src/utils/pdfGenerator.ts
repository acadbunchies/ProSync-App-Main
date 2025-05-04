
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

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

// Create a function that returns the document instead of saving it directly
export const generatePDFDocument = (products: Product[]): jsPDF => {
  try {
    // Validate input data
    if (!products || !Array.isArray(products) || products.length === 0) {
      throw new Error("No product data available for the report");
    }
    
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
    const productRows = sortedProducts.map(product => {
      // Find latest price (most recent date first)
      const latestPrice = product.priceHistory && product.priceHistory.length > 0 
        ? product.priceHistory.sort((a, b) => 
            new Date(b.effdate).getTime() - new Date(a.effdate).getTime()
          )[0]
        : null;
      
      return [
        product.prodcode,
        product.description,
        product.unit,
        latestPrice 
          ? `$${parseFloat(latestPrice.unitprice.toString()).toFixed(2)}`
          : "N/A"
      ];
    });
    
    // Use the imported autoTable function
    autoTable(doc, {
      head: [["Code", "Description", "Unit", "Latest Price"]],
      body: productRows,
      startY: 40,
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      margin: { top: 40 }
    });
    
    // Price history details for each product
    let yPosition = doc.lastAutoTable.finalY + 20;
    
    sortedProducts.forEach((product) => {
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
        // Sort price history by date (most recent first)
        const sortedHistory = [...product.priceHistory].sort((a, b) => 
          new Date(b.effdate).getTime() - new Date(a.effdate).getTime()
        );
        
        const historyRows = sortedHistory.map(price => [
          format(new Date(price.effdate), 'MM/dd/yyyy'),
          `$${parseFloat(price.unitprice.toString()).toFixed(2)}`
        ]);
        
        // Use the imported autoTable function
        autoTable(doc, {
          head: [["Effective Date", "Unit Price"]],
          body: historyRows,
          startY: yPosition,
          headStyles: { fillColor: [52, 152, 219], textColor: 255 },
          margin: { left: 14 },
          tableWidth: 100
        });
        
        yPosition = doc.lastAutoTable.finalY + 20;
      } else {
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("No price history available", 14, yPosition);
        yPosition += 15;
      }
    });
    
    return doc;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error(`Failed to generate PDF report: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Function to save the PDF directly
export const generatePDF = (products: Product[]): void => {
  const doc = generatePDFDocument(products);
  doc.save("Product_List_Report.pdf");
};
