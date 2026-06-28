const Payment = require("../models/Payment.model");
const Invoice = require("../models/Invoice.model");
const Booking = require("../models/Booking.model");
const SiteSettings = require("../models/SiteSettings.model");
const { compileHtmlToPdf } = require("../utils/pdfCompiler");
const cloudinary = require("../config/cloudinary");
const sendEmail = require("../utils/sendEmail");
const Lead = require("../models/Lead.model");

// Helper to generate Invoice Number
const generateInvoiceNumber = async () => {
  const count = await Invoice.countDocuments();
  const startNum = 20000;
  return `PIXEL-INV-${startNum + count + 1}`;
};

const formatInvoiceData = (invoiceObj, booking, payments, siteSettings) => {
  const dateFormatted = new Date(invoiceObj.date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });

  const eventDateFormatted = booking.eventDate
    ? new Date(booking.eventDate).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" })
    : "—";

  const paymentsFormatted = payments.map((p, index) => ({
    index: index + 1,
    date: new Date(p.date).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" }),
    type: p.type,
    method: p.method || "N/A",
    amount: p.amount.toFixed(2)
  }));

  const logoLetters = siteSettings.businessName
    ? siteSettings.businessName.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase()
    : "SP";

  const termsList = siteSettings.termsAndConditions || [];

  const totalAmountPaid = payments.reduce((acc, curr) => acc + curr.amount, 0);

  return {
    logoUrl: siteSettings.logo || "",
    logoLetters,
    businessName: siteSettings.businessName || "STUDIO PRO",
    businessNameUppercase: (siteSettings.businessName || "STUDIO PRO").toUpperCase(),
    contactAddress: siteSettings.contact?.address || "",
    contactPhone: siteSettings.contact?.phone || "",
    contactEmail: siteSettings.contact?.email || "",
    docTitle: "Payment Invoice & Receipt",
    docSub: "Receipt of payment confirmation",
    invoiceNumber: invoiceObj.invoiceNumber,
    date: dateFormatted,
    paymentStatus: invoiceObj.type === "Final" ? "Fully Paid" : "Partially Paid",
    clientName: booking.clientName || "N/A",
    clientPhone: booking.leadId?.phone || "N/A",
    shootType: booking.shootType || "—",
    eventDate: eventDateFormatted,
    payments: paymentsFormatted,
    amount: invoiceObj.amount.toFixed(2),
    totalAmountPaid: totalAmountPaid.toFixed(2),
    totalProjectCost: booking.totalAmount.toFixed(2),
    remainingBalance: booking.remainingAmount.toFixed(2),
    termsList,
    colors: {
      primary: siteSettings.colors?.primary || "#6B1F2A",
      secondary: siteSettings.colors?.secondary || "#4A1620",
      accent: siteSettings.colors?.accent || "#B8924A"
    },
    stampUrl: siteSettings.stamp || "",
    signatureUrl: siteSettings.signature || "",
    qrCodeUrl: siteSettings.qrCode || ""
  };
};

// Helper: generate PDF buffer and upload to Cloudinary
const generateAndUploadInvoicePDF = async (invoiceObj, booking, payments, siteSettings, tenantId) => {
  const data = formatInvoiceData(invoiceObj, booking, payments, siteSettings);
  const pdfBuffer = await compileHtmlToPdf(tenantId, "invoice", data);
  
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "photo_crm/invoices", resource_type: "raw", format: "pdf" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    uploadStream.end(pdfBuffer);
  });
};

exports.addPayment = async (req, res) => {
  try {
    const { amount, method } = req.body;
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId).populate("leadId");
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    // Ensure numeric amount
    const paymentAmount = Number(amount);

    // Fetch existing payments
    const existingPayments = await Payment.find({ bookingId }).sort({ date: 1 });
    
    // Determine Type
    let type = "Partial";
    if (existingPayments.length === 0) {
      type = "Advance";
    } else if (booking.remainingAmount - paymentAmount <= 0) {
      type = "Final";
    }

    const newPayment = new Payment({
      bookingId,
      amount: paymentAmount,
      method,
      type
    });

    const savedPayment = await newPayment.save();
    
    // Update booking remaining amount and advance amounts
    // Note: If type is advance, advanceAmount was already recorded in create booking theoretically,
    // but building this system incrementally, let's just subtract from remaining.
    booking.advanceAmount += paymentAmount;
    await booking.save(); // pre-save hook will update remainingAmount

    // Re-fetch all payments for Invoice
    const allPayments = await Payment.find({ bookingId }).sort({ date: 1 });

    // Create Invoice
    const invoiceNumber = await generateInvoiceNumber();
    const newInvoiceObj = {
      bookingId,
      paymentId: savedPayment._id,
      invoiceNumber,
      amount: paymentAmount,
      type,
      date: new Date()
    };

    // Generate PDF
    const siteSettings = await SiteSettings.findOne();
    const pdfUrl = await generateAndUploadInvoicePDF(newInvoiceObj, booking, allPayments, siteSettings, req.tenant);

    const newInvoice = new Invoice({
      ...newInvoiceObj,
      pdfUrl
    });

    const savedInvoice = await newInvoice.save();
    
    savedPayment.invoiceId = savedInvoice._id;
    await savedPayment.save();

    res.status(201).json({ success: true, payment: savedPayment, invoice: savedInvoice, booking });
  } catch (error) {
    console.error("Add Payment Error:", error);
    res.status(500).json({ success: false, message: "Failed to add payment", error: error.message });
  }
};

exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ bookingId: req.params.bookingId }).populate("invoiceId").sort({ date: 1 });
    res.status(200).json({ success: true, count: payments.length, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to get payments", error: error.message });
  }
};

exports.getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ bookingId: req.params.bookingId }).sort({ date: -1 });
    res.status(200).json({ success: true, count: invoices.length, invoices });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to get invoices", error: error.message });
  }
};

exports.sendInvoiceEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: "Invoice not found" });
    
    await sendEmail({
      email,
      subject: `Invoice ${invoice.invoiceNumber} from our Studio`,
      message: `Please find your invoice (${invoice.type}) here: ${invoice.pdfUrl}`,
      html: `<p>Hello!</p>
             <p>Your payment invoice is ready.</p>
             <p>Amount: Rs. ${invoice.amount}</p>
             <p>Type: ${invoice.type}</p>
             <p>Download here: <a href="${invoice.pdfUrl}">Download Invoice</a></p>`
    });

    res.status(200).json({ success: true, message: "Invoice sent via email" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to send email", error: error.message });
  }
};
