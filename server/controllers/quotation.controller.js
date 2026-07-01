const Quotation = require("../models/Quotation.model");
const Lead = require("../models/Lead.model");
const SiteSettings = require("../models/SiteSettings.model");
const { generateQuotationPDF } = require("../utils/pdfGenerator");

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
  return await generateQuotationPDF(quotation, settings);
};

exports.createQuotation = async (req, res) => {
  try {
    const { leadId, items, gstEnabled, terms, termsList, scopeOfServices, deliverables, timeline } = req.body;

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
      terms: terms !== undefined ? terms : (settings.termsAndConditions?.join("\n") || "Thank you for your business."),
      termsList: termsList || [],
      scopeOfServices: scopeOfServices || [],
      deliverables: deliverables || [],
      timeline: timeline || [],
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

    const pdfBuffer = await buildPDFBuffer(quotation, settings);

    const filename = `Quotation-${quotation.quotationNumber}.pdf`;

    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
    res.setHeader("Content-Type", "application/pdf");
    res.end(pdfBuffer);
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
