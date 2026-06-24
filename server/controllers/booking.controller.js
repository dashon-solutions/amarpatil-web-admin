const Booking = require("../models/Booking.model");
const Lead = require("../models/Lead.model");

exports.createBooking = async (req, res) => {
  try {
    const { leadId, totalAmount, advanceAmount, paymentMethod } = req.body;

    const lead = await Lead.findById(leadId);
    if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });

    // Update Lead info
    lead.totalAmount = totalAmount;
    lead.advanceAmount = advanceAmount;
    lead.status = "advance_paid";
    lead.notes.push({ text: `Booking confirmed with advance ₹${advanceAmount} via ${paymentMethod}`, date: new Date() });
    
    await lead.save();

    // Create Booking
    const newBooking = new Booking({
      leadId,
      clientName: lead.name,
      eventDate: lead.eventDate,
      shootType: lead.shootType,
      totalAmount,
      advanceAmount,
      paymentMethod
    });

    const savedBooking = await newBooking.save();

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking: savedBooking,
      lead
    });
  } catch (error) {
    console.error("Create Booking Error: ", error);
    res.status(500).json({ success: false, message: "Failed to create booking", error: error.message });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate("leadId").sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    console.error("Get Bookings Error: ", error);
    res.status(500).json({ success: false, message: "Failed to fetch bookings", error: error.message });
  }
};
