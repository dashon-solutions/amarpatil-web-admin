const Payment = require("../models/Payment.model");
const Invoice = require("../models/Invoice.model");
const Booking = require("../models/Booking.model");
const SiteSettings = require("../models/SiteSettings.model");
const PDFDocument = require("pdfkit");
const cloudinary = require("../config/cloudinary");
const sendEmail = require("../utils/sendEmail");
const Lead = require("../models/Lead.model");

// Helper to generate Invoice Number
const generateInvoiceNumber = async () => {
  const count = await Invoice.countDocuments();
  const startNum = 20000;
  return `PIXEL-INV-${startNum + count + 1}`;
};

// Helper: generate PDF buffer and upload to Cloudinary
const generateAndUploadInvoicePDF = async (invoiceObj, booking, payments, siteSettings) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    let buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      const pdfBuffer = Buffer.concat(buffers);
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "photo_crm/invoices", resource_type: "image", format: "pdf" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result.secure_url);
        }
      );
      uploadStream.end(pdfBuffer);
    });

    // Content
    doc.fontSize(20).text(siteSettings?.businessName || "Photography Studio", 50, 50, { align: "right" });
    if (siteSettings?.contact?.phone) {
      doc.fontSize(10).text(`Phone: ${siteSettings.contact.phone}`, { align: "right" });
    }
    if (siteSettings?.contact?.email) {
      doc.text(`Email: ${siteSettings.contact.email}`, { align: "right" });
    }
    
    doc.fontSize(20).text("INVOICE", 50, 50);
    doc.fontSize(10).text(`Invoice No: ${invoiceObj.invoiceNumber}`, 50, 80);
    doc.text(`Date: ${new Date(invoiceObj.date).toLocaleDateString()}`);
    doc.moveDown();

    doc.fontSize(12).text("Client Details:", { underline: true });
    doc.fontSize(10).text(`Name: ${booking.clientName}`);
    doc.text(`Shoot Type: ${booking.shootType || "Event"}`);
    if (booking.eventDate) {
      doc.text(`Event Date: ${new Date(booking.eventDate).toLocaleDateString()}`);
    }
    doc.moveDown();

    doc.fontSize(12).text("Payment Details", { underline: true });
    doc.moveDown(0.5);

    doc.fontSize(10).text("Date".padEnd(20) + "Type".padEnd(20) + "Amount");
    doc.text("------------------------------------------------------------------");
    
    // For Final Invoice, list ALL payments. For others, just this payment
    let paymentsToDisplay = [payments[payments.length - 1]]; // default: just this payment
    if (invoiceObj.type === "Final") {
      paymentsToDisplay = payments; // show all
    }

    paymentsToDisplay.forEach((p) => {
      const pDate = new Date(p.date).toLocaleDateString().padEnd(20);
      const pType = String(p.type).padEnd(20);
      doc.text(`${pDate}${pType}Rs. ${p.amount}`);
    });

    doc.text("------------------------------------------------------------------");
    
    const totalPaid = payments.reduce((acc, curr) => acc + curr.amount, 0);
    doc.moveDown();
    doc.fontSize(12).text(`Total Paid: Rs. ${totalPaid}`);
    doc.text(`Remaining Balance: Rs. ${booking.remainingAmount}`);
    doc.moveDown();
    doc.fontSize(10).text(`Total Project Cost: Rs. ${booking.totalAmount}`);

    doc.moveDown(4);
    doc.fontSize(10).text("Terms & Conditions:");
    if (siteSettings?.termsAndConditions && siteSettings.termsAndConditions.length > 0) {
      siteSettings.termsAndConditions.forEach((term) => doc.text(`- ${term}`));
    } else {
      doc.text("Thank you for your business.");
    }

    doc.moveDown(4);
    if (siteSettings?.signature) {
      // If signature is an image, ideally we draw it, but Cloudinary URLs in PDFKit need to be downloaded first.
      // So we will just write text for now.
      doc.text("(Authorized Signatory)", { align: "right" });
    }

    doc.end();
  });
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

    // Generate PDF
    const siteSettings = await SiteSettings.findOne();
    const pdfUrl = await generateAndUploadInvoicePDF(newInvoiceObj, booking, allPayments, siteSettings);

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
