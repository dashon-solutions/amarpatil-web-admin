const Quotation = require("../models/Quotation.model");
const Lead = require("../models/Lead.model");
const SiteSettings = require("../models/SiteSettings.model");
const { compileHtmlToPdf } = require("../utils/pdfCompiler");

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

const formatQuotationData = (quotation, settings) => {
  const dateFormatted = new Date(quotation.createdAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });

  const validUntilDate = new Date(new Date(quotation.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000);
  const validUntilFormatted = validUntilDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });

  const itemsFormatted = quotation.items.map((item, index) => ({
    index: index + 1,
    title: item.title,
    price: item.price.toFixed(2)
  }));

  const subtotalFormatted = quotation.subtotal.toFixed(2);
  const gstAmountFormatted = quotation.gstAmount.toFixed(2);
  const totalFormatted = quotation.total.toFixed(2);

  const logoLetters = settings.businessName
    ? settings.businessName.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase()
    : "SP";

  const termsList = (quotation.termsList && quotation.termsList.length > 0)
    ? quotation.termsList
    : (quotation.terms ? quotation.terms.split("\n").map(t => t.trim()).filter(t => t.length > 0) : []);

  return {
    logoUrl: settings.logo || "",
    logoLetters,
    businessName: settings.businessName || "STUDIO PRO",
    businessNameUppercase: (settings.businessName || "STUDIO PRO").toUpperCase(),
    businessNameEncoded: encodeURIComponent(settings.businessName || "STUDIO PRO"),
    contactAddress: settings.contact?.address || "",
    contactPhone: settings.contact?.phone || "",
    contactEmail: settings.contact?.email || "",
    docTitle: quotation.leadId?.shootType ? `${quotation.leadId.shootType} Photography Quotation` : "Photography Quotation",
    docSub: "Prepared for your special day",
    quotationNumber: quotation.quotationNumber,
    date: dateFormatted,
    validUntil: validUntilFormatted,
    clientName: quotation.leadId?.name || "N/A",
    clientPhone: quotation.leadId?.phone || "N/A",
    clientEmail: quotation.leadId?.email || "—",
    shootType: quotation.leadId?.shootType || "—",
    eventDate: quotation.leadId?.eventDate ? new Date(quotation.leadId.eventDate).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—",
    venue: quotation.leadId?.venue || "—",
    items: itemsFormatted,
    subtotal: subtotalFormatted,
    gstEnabled: quotation.gstEnabled,
    gstPercentage: quotation.gstPercentage || 18,
    gstAmount: gstAmountFormatted,
    total: totalFormatted,
    termsList,
    scopeOfServices: quotation.scopeOfServices || [],
    deliverables: quotation.deliverables || [],
    timeline: quotation.timeline || [],
    hasScopeOrDeliverables: (quotation.scopeOfServices && quotation.scopeOfServices.length > 0) || 
                            (quotation.deliverables && quotation.deliverables.length > 0) || 
                            (quotation.timeline && quotation.timeline.length > 0),
    bankDetails: {
      accountName: settings.bankDetails?.accountName || "—",
      bankName: settings.bankDetails?.bankName || "—",
      accountNumber: settings.bankDetails?.accountNumber || "—",
      ifscCode: settings.bankDetails?.ifscCode || "—",
      upiId: settings.bankDetails?.upiId || ""
    },
    colors: {
      primary: settings.colors?.primary || "#6B1F2A",
      secondary: settings.colors?.secondary || "#4A1620",
      accent: settings.colors?.accent || "#B8924A"
    },
    stampUrl: settings.stamp || "",
    signatureUrl: settings.signature || "",
    qrCodeUrl: settings.qrCode || ""
  };
};

const buildPDFBuffer = async (quotation, settings, tenantId) => {
  const data = formatQuotationData(quotation, settings);
  return await compileHtmlToPdf(tenantId, "quotation", data);
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
    const quotation = await Quotation.findById(id).populate("leadId");
    if (!quotation) return res.status(404).json({ success: false, message: "Quotation not found" });

    const settings = await SiteSettings.findOne() || {};

    const pdfBuffer = await buildPDFBuffer(quotation, settings, req.tenant);

    const filename = `Quotation-${quotation.quotationNumber}.pdf`;

    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
    res.setHeader("Content-Type", "application/pdf");
    res.end(pdfBuffer);
  } catch (error) {
    console.error("Generate PDF Error: ", error);
    if (!res.headersSent) res.status(500).json({ success: false, message: "PDF Generation Failed" });
  }
};

exports.sendQuotationEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;
    
    const quotation = await Quotation.findById(id).populate("leadId");
    if (!quotation) return res.status(404).json({ success: false, message: "Quotation not found" });

    const settings = await SiteSettings.findOne() || {};

    const pdfBuffer = await buildPDFBuffer(quotation, settings, req.tenant);

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
