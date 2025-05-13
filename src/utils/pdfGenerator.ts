
import { jsPDF } from "jspdf";
import { format } from "date-fns";

// Create a function that returns the document instead of saving it directly
export const generatePDFDocument = (products) => {
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

    // Make sure products are sorted by product code in the PDF
    const sortedProducts = [...products].sort((a, b) => a.prodcode.localeCompare(b.prodcode));
    
    // Set initial Y position for the table
    let yPos = 40;

    // Add header row
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.text("Code", 14, yPos);
    doc.text("Description", 45, yPos);
    doc.text("Unit", 130, yPos);
    doc.text("Latest Price", 160, yPos);
    
    yPos += 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    // Add product rows
    sortedProducts.forEach((product) => {
      // Find latest price
      const latestPrice = product.priceHistory && product.priceHistory.length > 0
        ? product.priceHistory.sort((a, b) => new Date(b.effdate).getTime() - new Date(a.effdate).getTime())[0]
        : null;

      // Check if we need a new page
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }

      doc.text(product.prodcode, 14, yPos);
      doc.text(product.description.substring(0, 50), 45, yPos); // Limit description length
      doc.text(product.unit, 130, yPos);
      doc.text(latestPrice ? `$${parseFloat(latestPrice.unitprice.toString()).toFixed(2)}` : "N/A", 160, yPos);
      
      yPos += 7;
    });

    // Add a gap before price history section
    yPos += 10;

    // Price history details for each product
    sortedProducts.forEach((product) => {
      // Check if we need a new page
      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.setFont("helvetica", "bold");
      doc.text(`Price History for: ${product.description} (${product.prodcode})`, 14, yPos);
      
      yPos += 8;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      if (product.priceHistory && product.priceHistory.length > 0) {
        // Sort price history by date (most recent first)
        const sortedHistory = [...product.priceHistory]
          .sort((a, b) => new Date(b.effdate).getTime() - new Date(a.effdate).getTime());
        
        // Add header for price history
        doc.text("Effective Date", 20, yPos);
        doc.text("Unit Price", 70, yPos);
        yPos += 6;
        
        // Add price history rows
        sortedHistory.forEach((price) => {
          // Check if we need a new page
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          
          doc.text(format(new Date(price.effdate), 'MM/dd/yyyy'), 20, yPos);
          doc.text(`$${parseFloat(price.unitprice.toString()).toFixed(2)}`, 70, yPos);
          
          yPos += 6;
        });
        
        yPos += 10; // Add space after each product's price history
      } else {
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("No price history available", 20, yPos);
        yPos += 10;
      }
    });

    return doc;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error(`Failed to generate PDF report: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Function to save the PDF directly
export const generatePDF = (products) => {
  const doc = generatePDFDocument(products);
  doc.save("Product_List_Report.pdf");
};
