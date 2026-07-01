const PDFDocument = require("pdfkit");
const https = require("https");
const http = require("http");

const fetchImage = (url) => {
  return new Promise((resolve, reject) => {
    if (!url) return reject(new Error("No URL provided"));
    const client = url.startsWith("https") ? https : http;
    client.get(url, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to fetch image: ${res.statusCode}`));
      }
      const data = [];
      res.on("data", (chunk) => data.push(chunk));
      res.on("end", () => resolve(Buffer.concat(data)));
    }).on("error", reject);
  });
};

const drawHeader = async (doc, settings) => {
  if (settings.logo && settings.logo.startsWith("http")) {
    try {
      const logoBuffer = await fetchImage(settings.logo);
      doc.image(logoBuffer, 50, 45, { height: 40 });
    } catch (err) {
      doc.fontSize(20).text(settings.businessName || "STUDIO PRO", 50, 50);
    }
  } else {
    doc.font("Helvetica-Bold").fontSize(20).text(settings.businessName || "STUDIO PRO", 50, 50);
  }

  doc
    .fontSize(10)
    .font("Helvetica")
    .text(settings.contact?.email || "", 200, 50, { align: "right" })
    .text(settings.contact?.phone || "", 200, 65, { align: "right" })
    .text(settings.contact?.address || "", 200, 80, { align: "right", width: 350 });

  doc.moveDown(4);
};

const drawFooterAndSignatures = async (doc, settings) => {
  doc.moveDown(4);
  const footerTop = doc.y;
  
  // Signatures
  doc.font("Helvetica-Bold").fontSize(10).text("Authorized Signatory", 400, footerTop);
  
  if (settings.signature && settings.signature.startsWith("http")) {
    try {
      const sigBuffer = await fetchImage(settings.signature);
      doc.image(sigBuffer, 400, footerTop + 15, { height: 40 });
    } catch (err) {}
  }
  
  if (settings.stamp && settings.stamp.startsWith("http")) {
    try {
      const stampBuffer = await fetchImage(settings.stamp);
      doc.image(stampBuffer, 450, footerTop + 30, { height: 60 });
    } catch (err) {}
  }
};

const generateQuotationPDF = async (quotation, settings) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      await drawHeader(doc, settings);

      // --- Quotation Metainfo ---
      doc.font("Helvetica-Bold").fontSize(16).text("QUOTATION", 50, 150);
      doc.font("Helvetica").fontSize(10).text(`No: ${quotation.quotationNumber}`, 50, 175);
      doc.text(`Date: ${new Date(quotation.createdAt).toLocaleDateString()}`, 50, 190);

      // --- Client Details ---
      doc.font("Helvetica-Bold").text("Client Details:", 300, 150);
      doc.font("Helvetica")
        .text(`Name: ${quotation.leadId?.name || "N/A"}`, 300, 175)
        .text(`Phone: ${quotation.leadId?.phone || "N/A"}`, 300, 190)
        .text(`Shoot Type: ${quotation.leadId?.shootType || "N/A"}`, 300, 205);

      doc.moveDown(3);

      // --- Items Table Header ---
      const tableTop = 250;
      doc.lineWidth(1).moveTo(50, tableTop).lineTo(550, tableTop).stroke();
      
      doc.font("Helvetica-Bold").fontSize(10);
      doc.text("Item Details", 50, tableTop + 10);
      doc.text("Amount (Rs)", 400, tableTop + 10, { width: 150, align: "right" });
      
      doc.moveTo(50, tableTop + 25).lineTo(550, tableTop + 25).stroke();

      // --- Items List ---
      doc.font("Helvetica");
      let yPosition = tableTop + 35;

      (quotation.items || []).forEach(item => {
        doc.text(item.title, 50, yPosition, { width: 340 });
        doc.text(`${Number(item.price).toFixed(2)}`, 400, yPosition, { width: 150, align: "right" });
        yPosition += 20;
      });

      doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
      yPosition += 10;

      // --- Totals ---
      doc.text("Subtotal:", 350, yPosition);
      doc.text(`${Number(quotation.subtotal).toFixed(2)}`, 450, yPosition, { width: 100, align: "right" });
      yPosition += 20;

      if (quotation.gstEnabled) {
        doc.text(`GST (${quotation.gstPercentage}%):`, 350, yPosition);
        doc.text(`${Number(quotation.gstAmount).toFixed(2)}`, 450, yPosition, { width: 100, align: "right" });
        yPosition += 20;
      }

      doc.font("Helvetica-Bold").fontSize(12);
      doc.text("Total:", 350, yPosition);
      doc.text(`${Number(quotation.total).toFixed(2)}`, 450, yPosition, { width: 100, align: "right" });

      doc.font("Helvetica").fontSize(10);

      // --- Terms ---
      doc.moveDown(4);
      doc.font("Helvetica-Bold").fontSize(10).text("Terms & Conditions:", 50, doc.y);
      doc.font("Helvetica").fontSize(8).text(quotation.terms || "Standard business terms apply.", 50, doc.y + 10, { width: 300 });

      await drawFooterAndSignatures(doc, settings);

      doc.end();
    } catch (e) {
      reject(e);
    }
  });
};

const generateInvoicePDF = async (invoice, booking, payments, settings) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      await drawHeader(doc, settings);

      doc.font("Helvetica-Bold").fontSize(16).text("INVOICE", 50, 150);
      doc.font("Helvetica").fontSize(10).text(`Invoice No: ${invoice.invoiceNumber}`, 50, 175);
      doc.text(`Date: ${new Date(invoice.date).toLocaleDateString()}`, 50, 190);

      doc.font("Helvetica-Bold").text("Client Details:", 300, 150);
      doc.font("Helvetica")
        .text(`Name: ${booking.clientName}`, 300, 175)
        .text(`Shoot Type: ${booking.shootType || "Event"}`, 300, 190);
      if (booking.eventDate) {
        doc.text(`Event Date: ${new Date(booking.eventDate).toLocaleDateString()}`, 300, 205);
      }

      doc.moveDown(3);

      doc.font("Helvetica-Bold").fontSize(12).text("Payment Details");
      doc.moveDown(0.5);

      const tableTop = doc.y;
      doc.lineWidth(1).moveTo(50, tableTop).lineTo(550, tableTop).stroke();
      
      doc.font("Helvetica-Bold").fontSize(10);
      doc.text("Date", 50, tableTop + 10);
      doc.text("Type", 200, tableTop + 10);
      doc.text("Amount (Rs)", 400, tableTop + 10, { width: 150, align: "right" });
      
      doc.moveTo(50, tableTop + 25).lineTo(550, tableTop + 25).stroke();

      doc.font("Helvetica");
      let yPosition = tableTop + 35;
      
      let paymentsToDisplay = [payments[payments.length - 1]]; 
      if (invoice.type === "Final") {
        paymentsToDisplay = payments; 
      }

      paymentsToDisplay.forEach((p) => {
        if (!p) return;
        const pDate = new Date(p.date || new Date()).toLocaleDateString();
        doc.text(pDate, 50, yPosition);
        doc.text(p.type || "Partial", 200, yPosition);
        doc.text(`${Number(p.amount || 0).toFixed(2)}`, 400, yPosition, { width: 150, align: "right" });
        yPosition += 20;
      });

      doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
      yPosition += 15;
      
      const totalPaid = payments.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
      const remainingBalance = (booking.totalAmount || 0) - totalPaid;

      doc.font("Helvetica-Bold").fontSize(10);
      doc.text(`Total Paid: Rs. ${totalPaid.toFixed(2)}`, 50, yPosition);
      yPosition += 15;
      doc.text(`Remaining Balance: Rs. ${remainingBalance.toFixed(2)}`, 50, yPosition);
      yPosition += 15;
      doc.text(`Total Project Cost: Rs. ${Number(booking.totalAmount || 0).toFixed(2)}`, 50, yPosition);

      doc.font("Helvetica").fontSize(10);

      doc.moveDown(4);
      doc.font("Helvetica-Bold").fontSize(10).text("Terms & Conditions:", 50, doc.y);
      let termsText = "Thank you for your business.";
      if (settings?.termsAndConditions && settings.termsAndConditions.length > 0) {
        termsText = settings.termsAndConditions.join("\n");
      }
      doc.font("Helvetica").fontSize(8).text(termsText, 50, doc.y + 10, { width: 300 });

      await drawFooterAndSignatures(doc, settings);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generateQuotationPDF,
  generateInvoicePDF
};
