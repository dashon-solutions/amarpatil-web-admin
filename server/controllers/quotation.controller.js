const Quotation = require("../models/Quotation.model");
const Lead = require("../models/Lead.model");
const SiteSettings = require("../models/SiteSettings.model");
const PDFDocument = require("pdfkit");
const https = require("https");
const sendEmail = require("../utils/sendEmail");

// Helper to fetch image as buffer for pdfkit
const fetchImage = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => resolve(Buffer.concat(chunks)));
        response.on("error", reject);
      } else {
        reject(new Error(`Failed to fetch image, status: ${response.statusCode}`));
      }
    }).on("error", reject);
  });
};

// Auto incrementing quotation logic
const generateQuotationNumber = async (businessName) => {
  const prefix = businessName ? businessName.substring(0, 5).toUpperCase().trim().replace(/[^A-Z]/g, "") : "QUOTE";
  
  // Find highest quotation number 
  const highestQuote = await Quotation.findOne({ quotationNumber: new RegExp(`^${prefix}-`) })
    .sort({ createdAt: -1 })
    .exec();

  let nextNumber = 10000; // Base starting number

  if (highestQuote) {
    const match = highestQuote.quotationNumber.match(/-(\d+)$/);
    if (match) {
      nextNumber = parseInt(match[1]) + 1;
    }
  }

  return `${prefix}-${nextNumber}`;
};

const buildPDFBuffer = async (quotation, settings) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      // --- Header ---
      if (settings.logo && settings.logo.startsWith("http")) {
        try {
          const logoBuffer = await fetchImage(settings.logo);
          doc.image(logoBuffer, 50, 45, { width: 100 });
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
        .text(settings.contact?.address || "", 200, 80, { align: "right" });

      doc.moveDown(4);

      // --- Quotation Metainfo ---
      doc.font("Helvetica-Bold").fontSize(14).text("QUOTATION", 50, 150);
      doc.font("Helvetica").fontSize(10).text(`No: ${quotation.quotationNumber}`, 50, 170);
      doc.text(`Date: ${new Date(quotation.createdAt).toLocaleDateString()}`, 50, 185);

      // --- Client Details ---
      doc.font("Helvetica-Bold").text("Client Details:", 300, 150);
      doc.font("Helvetica")
        .text(`Name: ${quotation.leadId?.name || "N/A"}`, 300, 170)
        .text(`Phone: ${quotation.leadId?.phone || "N/A"}`, 300, 185)
        .text(`Shoot Type: ${quotation.leadId?.shootType || "N/A"}`, 300, 200);

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

      quotation.items.forEach(item => {
        doc.text(item.title, 50, yPosition);
        doc.text(`${item.price.toFixed(2)}`, 400, yPosition, { width: 150, align: "right" });
        yPosition += 20;
      });

      doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
      yPosition += 10;

      // --- Totals ---
      doc.text("Subtotal:", 350, yPosition);
      doc.text(`${quotation.subtotal.toFixed(2)}`, 450, yPosition, { width: 100, align: "right" });
      yPosition += 20;

      if (quotation.gstEnabled) {
        doc.text(`GST (${quotation.gstPercentage}%):`, 350, yPosition);
        doc.text(`${quotation.gstAmount.toFixed(2)}`, 450, yPosition, { width: 100, align: "right" });
        yPosition += 20;
      }

      doc.font("Helvetica-Bold");
      doc.text("Total:", 350, yPosition);
      doc.text(`${quotation.total.toFixed(2)}`, 450, yPosition, { width: 100, align: "right" });

      // --- Footer & Terms ---
      doc.moveDown(4);
      const footerTop = doc.y;
      doc.font("Helvetica-Bold").fontSize(10).text("Terms & Conditions:", 50, footerTop);
      doc.font("Helvetica").fontSize(8).text(quotation.terms || "Standard business terms apply.", 50, footerTop + 15, { width: 300 });

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

      doc.end();
    } catch (e) {
      reject(e);
    }
  });
};

exports.createQuotation = async (req, res) => {
  try {
    const { leadId, items, gstEnabled } = req.body;

    const lead = await Lead.findById(leadId);
    if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });

    const settings = await SiteSettings.findOne() || {};

    const subtotal = items.reduce((acc, item) => acc + Number(item.price), 0);
    const gstPercentage = 18;
    const gstAmount = gstEnabled ? (subtotal * gstPercentage) / 100 : 0;
    const total = subtotal + gstAmount;

    const quotationNumber = await generateQuotationNumber(settings.businessName);

    const newQuotation = new Quotation({
      leadId,
      quotationNumber,
      items,
      subtotal,
      gstEnabled,
      gstPercentage,
      gstAmount,
      total,
      terms: settings.termsAndConditions?.join("\n") || "Thank you for your business.",
    });

    const saved = await newQuotation.save();

    res.status(201).json({
      success: true,
      message: "Quotation generated successfully",
      quotation: saved,
    });
  } catch (error) {
    console.error("Create Quotation Error: ", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

exports.getQuotationsByLead = async (req, res) => {
  try {
    const { leadId } = req.params;
    const quotations = await Quotation.find({ leadId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: quotations.length, quotations });
  } catch (error) {
    console.error("Get Quotations Error: ", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.generatePDF = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Touch Lead model to ensure it is registered on the tenant connection before populate
    Lead.schema; 
    
    const quotation = await Quotation.findById(id).populate("leadId");
    if (!quotation) return res.status(404).json({ success: false, message: "Quotation not found" });

    const settings = await SiteSettings.findOne() || {};

    const doc = new PDFDocument({ margin: 50 });
    const filename = `Quotation-${quotation.quotationNumber}.pdf`;

    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    // --- Header ---
    if (settings.logo && settings.logo.startsWith("http")) {
      try {
        const logoBuffer = await fetchImage(settings.logo);
        doc.image(logoBuffer, 50, 45, { width: 100 });
      } catch (err) {
        console.warn("Could not load logo for PDF");
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
      .text(settings.contact?.address || "", 200, 80, { align: "right" });

    doc.moveDown(4);

    // --- Quotation Metainfo ---
    doc.font("Helvetica-Bold").fontSize(14).text("QUOTATION", 50, 150);
    doc.font("Helvetica").fontSize(10).text(`No: ${quotation.quotationNumber}`, 50, 170);
    doc.text(`Date: ${new Date(quotation.createdAt).toLocaleDateString()}`, 50, 185);

    // --- Client Details ---
    doc.font("Helvetica-Bold").text("Client Details:", 300, 150);
    doc.font("Helvetica")
      .text(`Name: ${quotation.leadId?.name || "N/A"}`, 300, 170)
      .text(`Phone: ${quotation.leadId?.phone || "N/A"}`, 300, 185)
      .text(`Shoot Type: ${quotation.leadId?.shootType || "N/A"}`, 300, 200);

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

    quotation.items.forEach(item => {
      doc.text(item.title, 50, yPosition);
      doc.text(`${item.price.toFixed(2)}`, 400, yPosition, { width: 150, align: "right" });
      yPosition += 20;
    });

    doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
    yPosition += 10;

    // --- Totals ---
    doc.text("Subtotal:", 350, yPosition);
    doc.text(`${quotation.subtotal.toFixed(2)}`, 450, yPosition, { width: 100, align: "right" });
    yPosition += 20;

    if (quotation.gstEnabled) {
      doc.text(`GST (${quotation.gstPercentage}%):`, 350, yPosition);
      doc.text(`${quotation.gstAmount.toFixed(2)}`, 450, yPosition, { width: 100, align: "right" });
      yPosition += 20;
    }

    doc.font("Helvetica-Bold");
    doc.text("Total:", 350, yPosition);
    doc.text(`${quotation.total.toFixed(2)}`, 450, yPosition, { width: 100, align: "right" });

    // --- Footer & Terms ---
    doc.moveDown(4);
    const footerTop = doc.y;
    doc.font("Helvetica-Bold").fontSize(10).text("Terms & Conditions:", 50, footerTop);
    doc.font("Helvetica").fontSize(8).text(quotation.terms || "Standard business terms apply.", 50, footerTop + 15, { width: 300 });

    // Signatures
    doc.font("Helvetica-Bold").fontSize(10).text("Authorized Signatory", 400, footerTop);
    
    // Attempt load stamp/signature if exist
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

    doc.end();

  } catch (error) {
    console.error("Generate PDF Error: ", error.stack || error);
    if (!res.headersSent) res.status(500).json({ success: false, message: "PDF Generation Failed", details: error.message });
  }
};

exports.sendQuotationEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;
    
    // Touch Lead model to ensure it is registered on the tenant connection before populate
    Lead.schema;

    const quotation = await Quotation.findById(id).populate("leadId");
    if (!quotation) return res.status(404).json({ success: false, message: "Quotation not found" });

    const settings = await SiteSettings.findOne() || {};

    const pdfBuffer = await buildPDFBuffer(quotation, settings);

    await sendEmail({
      email: email,
      subject: `Quotation ${quotation.quotationNumber} from ${settings.businessName}`,
      message: `Dear ${quotation.leadId.name},\n\nPlease find attached the quotation ${quotation.quotationNumber}.\n\nTotal: Rs. ${quotation.total}\n\nThank you,\n${settings.businessName}`,
      attachments: [
        {
          filename: `Quotation-${quotation.quotationNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    });

    quotation.status = "sent";
    await quotation.save();

    await Lead.findByIdAndUpdate(quotation.leadId._id, { status: "quotation_sent" });

    res.status(200).json({ success: true, message: "Quotation sent successfully via email", quotation });
  } catch (error) {
    console.error("Send Email Error: ", error);
    res.status(500).json({ success: false, message: "Failed to send email" });
  }
};
