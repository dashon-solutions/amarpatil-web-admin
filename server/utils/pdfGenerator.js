const PDFDocument = require("pdfkit");
const https = require("https");
const http = require("http");

// --- UTILITIES ---

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

const COLORS = {
  primary: "#6B1F2A",
  bgLight: "#F5EBE1",
  accent: "#B8924A",
  textDark: "#333333",
  textLight: "#777777",
  border: "#E5D8CE"
};

const drawDivider = (doc, y, width = 515) => {
  const midX = 40 + width / 2;
  doc.lineWidth(0.5).strokeColor(COLORS.accent);
  doc.moveTo(40, y).lineTo(midX - 10, y).stroke();
  
  // Draw small diamond
  doc.fillColor(COLORS.accent);
  doc.moveTo(midX, y - 3)
     .lineTo(midX + 3, y)
     .lineTo(midX, y + 3)
     .lineTo(midX - 3, y)
     .fill();
     
  doc.strokeColor(COLORS.accent);
  doc.moveTo(midX + 10, y).lineTo(40 + width, y).stroke();
};

const drawSectionTitle = (doc, title, x, y) => {
  doc.fillColor(COLORS.accent);
  // small diamond
  doc.moveTo(x, y - 3).lineTo(x + 3, y).lineTo(x, y + 3).lineTo(x - 3, y).fill();
  doc.fillColor(COLORS.primary).font("Times-BoldItalic").fontSize(14).text(title, x + 10, y - 6);
  return doc.y;
};

// --- DRAWING BLOCKS ---

const drawHeader = async (doc, settings) => {
  let headerHeight = 60;
  
  // Logo
  if (settings.logo && settings.logo.startsWith("http")) {
    try {
      const logoBuffer = await fetchImage(settings.logo);
      doc.image(logoBuffer, 40, 40, { height: 40 });
    } catch (err) {
      doc.fillColor(COLORS.primary).font("Times-Bold").fontSize(24).text(settings.businessName || "STUDIO PRO", 40, 45);
    }
  } else {
    doc.fillColor(COLORS.primary).font("Times-Bold").fontSize(24).text(settings.businessName || "STUDIO PRO", 40, 45);
  }

  // Right side contact
  doc.fillColor(COLORS.textLight).font("Helvetica").fontSize(8);
  const addressText = settings.contact?.address || "Address Not Available";
  doc.text(addressText, 250, 45, { align: "right", width: 305 });
  
  doc.fillColor(COLORS.textDark).font("Helvetica-Bold").fontSize(9);
  const phone = settings.contact?.phone ? `+91 ${settings.contact.phone}` : "";
  const email = settings.contact?.email || "";
  doc.text(`${phone}  ·  ${email}`, 250, 65, { align: "right", width: 305 });

  doc.moveDown(2);
  const dividerY = doc.y;
  drawDivider(doc, dividerY);
  return dividerY + 15;
};

const drawTitleBlock = (doc, startY, docTitle, docNo, dateStr, validStr) => {
  // Left: Title
  doc.fillColor(COLORS.primary).font("Times-BoldItalic").fontSize(20).text(docTitle, 40, startY);
  doc.fillColor(COLORS.textLight).font("Helvetica").fontSize(8).text("PREPARED FOR YOUR SPECIAL DAY", 40, startY + 22, { characterSpacing: 1 });

  // Right: Meta
  doc.fontSize(8);
  
  // Number
  doc.fillColor(COLORS.textLight).font("Helvetica").text("NO. ", 350, startY, { align: "right", width: 100 });
  doc.fillColor(COLORS.textDark).font("Helvetica-Bold").text(docNo, 450, startY, { align: "right", width: 105 });
  
  // Date
  doc.fillColor(COLORS.textLight).font("Helvetica").text("DATE ", 350, startY + 12, { align: "right", width: 100 });
  doc.fillColor(COLORS.textDark).font("Helvetica-Bold").text(dateStr, 450, startY + 12, { align: "right", width: 105 });
  
  // Valid
  if (validStr) {
    doc.fillColor(COLORS.textLight).font("Helvetica").text("VALID UNTIL ", 350, startY + 24, { align: "right", width: 100 });
    doc.fillColor(COLORS.textDark).font("Helvetica-Bold").text(validStr, 450, startY + 24, { align: "right", width: 105 });
  }
  
  doc.moveDown(3);
  const dividerY = Math.max(doc.y, startY + 50);
  drawDivider(doc, dividerY);
  return dividerY + 15;
};

const drawInfoBoxes = (doc, startY, clientObj, shootObj) => {
  const boxWidth = 250;
  const boxHeight = 70;
  
  const drawBox = (x, y, title, data) => {
    // Background
    doc.rect(x, y, boxWidth, boxHeight).fill(COLORS.bgLight);
    // Top border
    doc.rect(x, y, boxWidth, 4).fill(COLORS.primary);
    
    // Title
    doc.fillColor(COLORS.primary).font("Helvetica-Bold").fontSize(9).text(title, x + 15, y + 15, { characterSpacing: 1 });
    
    // Content
    let textY = y + 35;
    data.forEach(row => {
      doc.fillColor(COLORS.textLight).font("Helvetica").fontSize(9).text(row.label, x + 15, textY);
      doc.fillColor(COLORS.textDark).font("Helvetica-Bold").text(row.value, x + 90, textY, { width: boxWidth - 105, align: "right" });
      textY += 15;
    });
  };

  drawBox(40, startY, "CLIENT DETAILS", [
    { label: "Name", value: clientObj.name || "N/A" },
    { label: "Phone", value: clientObj.phone || "N/A" },
    { label: "Email", value: clientObj.email || "N/A" }
  ]);

  drawBox(305, startY, "SHOOT DETAILS", [
    { label: "Shoot Type", value: shootObj.type || "Event" },
    { label: "Event Date", value: shootObj.date || "N/A" },
    { label: "Venue", value: shootObj.venue || "—" }
  ]);

  return startY + boxHeight + 20;
};

const drawScopeBox = (doc, startY, shootType, scopeList, deliverablesList) => {
  let y = drawSectionTitle(doc, "Scope of Services & Deliverables", 43, startY);
  y += 10;
  
  // Header
  doc.rect(40, y, 515, 20).fill(COLORS.primary);
  doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(10).text(`${shootType || "Event"} Coverage Specifications`, 50, y + 5);
  
  y += 20;
  const boxStartY = y;
  
  // We need to calculate height based on content. For now we will just assume fixed width and draw text.
  let scopeY = y + 10;
  let delivY = y + 10;

  doc.fillColor(COLORS.primary).font("Helvetica-Bold").fontSize(9).text("SCOPE OF SERVICES", 50, scopeY, { characterSpacing: 1 });
  doc.text("DELIVERABLES", 305, delivY, { characterSpacing: 1 });
  
  scopeY += 15;
  delivY += 15;
  
  doc.fillColor(COLORS.textDark).font("Helvetica").fontSize(8);
  
  scopeList.forEach(item => {
    doc.fillColor(COLORS.accent).text("•", 50, scopeY);
    doc.fillColor(COLORS.textDark).text(item, 60, scopeY, { width: 220 });
    scopeY = doc.y + 5;
  });
  
  deliverablesList.forEach(item => {
    doc.fillColor(COLORS.accent).text("•", 305, delivY);
    doc.fillColor(COLORS.textDark).text(item, 315, delivY, { width: 220 });
    delivY = doc.y + 5;
  });
  
  const boxHeight = Math.max(scopeY, delivY) - boxStartY + 10;
  
  // Draw background (need to do this behind the text technically, but pdfkit doesn't have z-index.
  // We should have calculated height first. To fix this, we draw a rect, but we can't overdraw.
  // Let's just draw the border around it instead.
  doc.lineWidth(1).strokeColor(COLORS.bgLight);
  doc.rect(40, boxStartY, 515, boxHeight).fillAndStroke(COLORS.bgLight, COLORS.bgLight);
  
  // Redraw text over background
  scopeY = boxStartY + 10;
  delivY = boxStartY + 10;
  doc.fillColor(COLORS.primary).font("Helvetica-Bold").fontSize(9).text("SCOPE OF SERVICES", 50, scopeY, { characterSpacing: 1 });
  doc.text("DELIVERABLES", 305, delivY, { characterSpacing: 1 });
  
  scopeY += 15;
  delivY += 15;
  
  doc.font("Helvetica").fontSize(8);
  scopeList.forEach(item => {
    doc.fillColor(COLORS.accent).text("•", 50, scopeY);
    doc.fillColor(COLORS.textDark).text(item, 60, scopeY, { width: 220 });
    scopeY = doc.y + 5;
  });
  
  deliverablesList.forEach(item => {
    doc.fillColor(COLORS.accent).text("•", 305, delivY);
    doc.fillColor(COLORS.textDark).text(item, 315, delivY, { width: 220 });
    delivY = doc.y + 5;
  });
  
  return boxStartY + boxHeight + 20;
};

const drawTable = (doc, startY, items, subtotal, totalAmount) => {
  let y = startY;
  
  // Header
  doc.rect(40, y, 515, 20).fill(COLORS.primary);
  doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(9);
  doc.text("#", 50, y + 6);
  doc.text("ITEM / SERVICE", 80, y + 6);
  doc.text("AMOUNT (Rs.)", 450, y + 6, { width: 95, align: "right" });
  
  y += 20;
  
  // Rows
  doc.font("Helvetica").fontSize(9);
  items.forEach((item, index) => {
    // Alternating background
    if (index % 2 === 0) {
      doc.rect(40, y, 515, 25).fill("#FAFAFA");
    } else {
      doc.rect(40, y, 515, 25).fill("#FFFFFF");
    }
    
    doc.fillColor(COLORS.textLight).text((index + 1).toString(), 50, y + 8);
    doc.fillColor(COLORS.textDark).text(item.title, 80, y + 8, { width: 350 });
    doc.fillColor(COLORS.textDark).font("Helvetica-Bold").text(`${Number(item.price).toFixed(2)}`, 450, y + 8, { width: 95, align: "right" });
    doc.font("Helvetica");
    
    y += 25;
    
    // Bottom border
    doc.lineWidth(0.5).strokeColor("#EEEEEE").moveTo(40, y).lineTo(555, y).stroke();
  });
  
  y += 15;
  
  // Subtotal
  doc.fillColor(COLORS.textLight).font("Helvetica").fontSize(9).text("Subtotal", 350, y, { width: 100, align: "right" });
  doc.fillColor(COLORS.textDark).text(`Rs. ${Number(subtotal).toFixed(2)}`, 450, y, { width: 95, align: "right" });
  
  y += 20;
  
  // Total Block
  doc.rect(380, y, 175, 25).fill(COLORS.primary);
  doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(11).text("Total Amount", 390, y + 7);
  doc.text(`Rs. ${Number(totalAmount).toFixed(2)}`, 450, y + 7, { width: 95, align: "right" });
  
  return y + 45;
};

const drawTermsAndBank = async (doc, startY, terms, bankObj, qrCodeUrl) => {
  let y = startY;
  
  // Draw titles
  drawSectionTitle(doc, "Terms & Conditions", 43, y);
  drawSectionTitle(doc, "Payment Details", 308, y);
  
  y += 15;
  const contentY = y;
  
  // Terms
  doc.fillColor(COLORS.textLight).font("Helvetica").fontSize(8);
  let termY = contentY;
  terms.forEach(term => {
    doc.text("—", 40, termY);
    doc.text(term, 55, termY, { width: 235 });
    termY = doc.y + 4;
  });
  
  // Bank Details Box
  const boxX = 305;
  const boxWidth = 250;
  const boxHeight = 110;
  
  doc.rect(boxX, contentY, boxWidth, boxHeight).fill(COLORS.bgLight);
  
  let bY = contentY + 10;
  const bankRows = [
    { label: "Account Name", value: bankObj.accountName || "—" },
    { label: "Bank", value: bankObj.bankName || "—" },
    { label: "Account No.", value: bankObj.accountNumber || "—" },
    { label: "IFSC Code", value: bankObj.ifscCode || "—" },
    { label: "UPI ID", value: bankObj.upiId || "—" }
  ];
  
  bankRows.forEach(row => {
    doc.fillColor(COLORS.textLight).font("Helvetica").fontSize(8).text(row.label, boxX + 10, bY);
    doc.fillColor(COLORS.textDark).font("Helvetica-Bold").text(row.value, boxX + 80, bY, { width: boxWidth - 90, align: "right" });
    bY += 12;
  });
  
  // QR Code Area
  doc.lineWidth(0.5).strokeColor(COLORS.border).moveTo(boxX + 10, bY + 5).lineTo(boxX + boxWidth - 10, bY + 5).stroke();
  bY += 15;
  
  doc.fillColor(COLORS.textDark).font("Helvetica-Bold").fontSize(7).text("Scan to Pay", boxX + 60, bY);
  doc.fillColor(COLORS.textLight).font("Helvetica").text("Scan this QR code using any UPI app.", boxX + 60, bY + 10, { width: 180 });
  
  if (qrCodeUrl && qrCodeUrl.startsWith("http")) {
    try {
      const qrBuffer = await fetchImage(qrCodeUrl);
      doc.image(qrBuffer, boxX + 10, bY, { width: 40, height: 40 });
    } catch(err) {
      // fallback
    }
  }

  return Math.max(termY, contentY + boxHeight) + 40;
};

const drawGlobalFooter = async (doc, y, settings) => {
  // Line
  doc.lineWidth(0.5).strokeColor(COLORS.border).moveTo(40, y).lineTo(555, y).stroke();
  
  y += 10;
  
  // Left text
  doc.fillColor(COLORS.primary).font("Times-BoldItalic").fontSize(10)
     .text("With gratitude, for capturing your forever.", 40, y + 20);
     
  // Right Signature
  if (settings.signature && settings.signature.startsWith("http")) {
    try {
      const sigBuffer = await fetchImage(settings.signature);
      doc.image(sigBuffer, 420, y - 15, { height: 40 });
    } catch(err){}
  }
  
  if (settings.stamp && settings.stamp.startsWith("http")) {
    try {
      const stampBuffer = await fetchImage(settings.stamp);
      doc.image(stampBuffer, 480, y - 25, { height: 50 });
    } catch(err){}
  }
  
  doc.lineWidth(1).strokeColor(COLORS.textDark).moveTo(420, y + 30).lineTo(555, y + 30).stroke();
  doc.fillColor(COLORS.textLight).font("Helvetica").fontSize(8).text("Authorized Signatory", 420, y + 35, { width: 135, align: "center" });
  
  // Absolute bottom text
  doc.fillColor(COLORS.textLight).font("Helvetica-Bold").fontSize(6)
     .text(`${(settings.businessName || "STUDIO PRO").toUpperCase()} - THIS IS A COMPUTER GENERATED DOCUMENT`, 40, 800, { align: "center", width: 515, characterSpacing: 1 });
};

// --- MAIN EXPORTS ---

const generateQuotationPDF = async (quotation, settings) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: "A4" });
      const buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      // Override colors if present
      if (settings.colors) {
        if (settings.colors.primary) COLORS.primary = settings.colors.primary;
        if (settings.colors.secondary) COLORS.secondary = settings.colors.secondary;
      }

      let y = await drawHeader(doc, settings);
      
      const docTitle = quotation.leadId?.shootType ? `${quotation.leadId.shootType} Photography Quotation` : "Photography Quotation";
      const validUntil = new Date(new Date(quotation.createdAt).getTime() + 30*24*60*60*1000).toLocaleDateString("en-IN", {day: "2-digit", month: "2-digit", year: "numeric"});
      
      y = drawTitleBlock(doc, y, docTitle, quotation.quotationNumber, new Date(quotation.createdAt).toLocaleDateString("en-IN"), validUntil);
      
      y = drawInfoBoxes(doc, y, 
        { name: quotation.leadId?.name, phone: quotation.leadId?.phone, email: quotation.leadId?.email },
        { type: quotation.leadId?.shootType, date: quotation.leadId?.eventDate ? new Date(quotation.leadId.eventDate).toLocaleDateString() : "", venue: quotation.leadId?.venue }
      );

      const termsList = (quotation.termsList && quotation.termsList.length > 0)
        ? quotation.termsList
        : (quotation.terms ? quotation.terms.split("\n").map(t => t.trim()).filter(t => t.length > 0) : []);

      if (quotation.scopeOfServices?.length > 0 || quotation.deliverables?.length > 0) {
        y = drawScopeBox(doc, y, quotation.leadId?.shootType, quotation.scopeOfServices || [], quotation.deliverables || []);
      }

      const items = quotation.items.map(i => ({ title: i.title, price: i.price }));
      y = drawTable(doc, y, items, quotation.subtotal, quotation.total);

      // Page break logic if needed
      if (y > 600) {
        doc.addPage();
        y = 40;
      }

      y = await drawTermsAndBank(doc, y, termsList, settings.bankDetails || {}, settings.qrCode);
      
      if (y > 720) {
        doc.addPage();
        y = 40;
      }
      
      await drawGlobalFooter(doc, 750, settings);

      doc.end();
    } catch (e) {
      reject(e);
    }
  });
};

const generateInvoicePDF = async (invoice, booking, payments, settings) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: "A4" });
      const buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      if (settings.colors) {
        if (settings.colors.primary) COLORS.primary = settings.colors.primary;
        if (settings.colors.secondary) COLORS.secondary = settings.colors.secondary;
      }

      let y = await drawHeader(doc, settings);
      
      const docTitle = "Payment Invoice & Receipt";
      y = drawTitleBlock(doc, y, docTitle, invoice.invoiceNumber, new Date(invoice.date).toLocaleDateString("en-IN"), null);
      
      y = drawInfoBoxes(doc, y, 
        { name: booking.clientName, phone: booking.leadId?.phone, email: booking.leadId?.email },
        { type: booking.shootType, date: booking.eventDate ? new Date(booking.eventDate).toLocaleDateString() : "", venue: booking.leadId?.venue }
      );

      // Format payments as items for the table
      let paymentsToDisplay = [payments[payments.length - 1]]; 
      if (invoice.type === "Final") {
        paymentsToDisplay = payments; 
      }

      const items = paymentsToDisplay.map(p => ({
        title: `Payment: ${p.type} (${new Date(p.date || new Date()).toLocaleDateString()}) - Method: ${p.method || 'N/A'}`,
        price: p.amount
      }));
      
      const totalPaid = paymentsToDisplay.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

      y = drawTable(doc, y, items, totalPaid, totalPaid);
      
      // Add Remaining balance text under table
      doc.fillColor(COLORS.textDark).font("Helvetica-Bold").fontSize(10);
      doc.text(`Total Project Cost: Rs. ${Number(booking.totalAmount || 0).toFixed(2)}`, 380, y, { width: 175, align: "right" });
      const remainingBalance = (booking.totalAmount || 0) - payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      doc.fillColor(COLORS.primary).text(`Remaining Balance: Rs. ${remainingBalance.toFixed(2)}`, 380, y + 15, { width: 175, align: "right" });
      
      y += 40;

      if (y > 600) {
        doc.addPage();
        y = 40;
      }

      const termsList = settings.termsAndConditions || ["Thank you for your business."];
      y = await drawTermsAndBank(doc, y, termsList, settings.bankDetails || {}, settings.qrCode);
      
      if (y > 720) {
        doc.addPage();
        y = 40;
      }
      
      await drawGlobalFooter(doc, 750, settings);

      doc.end();
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  generateQuotationPDF,
  generateInvoicePDF
};
