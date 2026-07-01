const Payment = require("../models/Payment.model");
const Invoice = require("../models/Invoice.model");
const Booking = require("../models/Booking.model");
const SiteSettings = require("../models/SiteSettings.model");
const { generateInvoicePDF } = require("../utils/pdfGenerator");

const sendEmail = require("../utils/sendEmail");
const Lead = require("../models/Lead.model");

// Helper to generate Invoice Number
const generateInvoiceNumber = async () => {
  const count = await Invoice.countDocuments();
  const startNum = 20000;
  return `PIXEL-INV-${startNum + count + 1}`;
};

exports.downloadInvoicePDF = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: "Invoice not found" });

    Lead.schema;
    const booking = await Booking.findById(invoice.bookingId).populate("leadId");
    const allPayments = await Payment.find({ bookingId: invoice.bookingId }).sort({ date: 1 });
    const siteSettings = await SiteSettings.findOne() || {};

    const pdfBuffer = await generateInvoicePDF(invoice, booking, allPayments, siteSettings);

    const filename = `Invoice-${invoice.invoiceNumber}.pdf`;

    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
    res.setHeader("Content-Type", "application/pdf");
    res.end(pdfBuffer);
  } catch (error) {
    console.error("Download Invoice PDF Error:", error);
    if (!res.headersSent) res.status(500).json({ success: false, message: "Failed to generate PDF", error: error.message });
  }
};

exports.addPayment = async (req, res) => {
  try {
    const { amount, method } = req.body;
    const { bookingId } = req.params;

    // Touch Lead model to ensure it is registered on the tenant connection before populate
    Lead.schema;

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

    // PDF is now generated dynamically when requested. We leave pdfUrl empty or set it to the dynamic API route
    const pdfUrl = `/api/payments/invoices/pdf/temp`; 

    const newInvoice = new Invoice({
      ...newInvoiceObj,
      pdfUrl // This will be updated after saving with the real ID
    });

    const savedInvoice = await newInvoice.save();

    // Update pdfUrl with correct ID
    savedInvoice.pdfUrl = `/api/payments/invoices/pdf/${savedInvoice._id}`;
    await savedInvoice.save();

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
    Invoice.schema; // Touch Invoice model for tenant connection
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

    Lead.schema;
    const booking = await Booking.findById(invoice.bookingId).populate("leadId");
    const allPayments = await Payment.find({ bookingId: invoice.bookingId }).sort({ date: 1 });
    const siteSettings = await SiteSettings.findOne() || {};

    const pdfBuffer = await generateInvoicePDF(invoice, booking, allPayments, siteSettings);

    await sendEmail({
      email,
      subject: `Invoice ${invoice.invoiceNumber} from ${siteSettings.businessName || "our Studio"}`,
      message: `Dear Client,\n\nPlease find attached your payment invoice (${invoice.type}).\n\nAmount: Rs. ${invoice.amount}\n\nThank you for your business.`,
      attachments: [
        {
          filename: `Invoice-${invoice.invoiceNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    });

    res.status(200).json({ success: true, message: "Invoice sent via email" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to send email", error: error.message });
  }
};
