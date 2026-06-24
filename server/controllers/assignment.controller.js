const Assignment = require("../models/Assignment.model");
const Ledger = require("../models/Ledger.model");
const Booking = require("../models/Booking.model");

exports.createAssignment = async (req, res) => {
  try {
    const { bookingId, teamMemberId, shootDate, shootType, notes, amountAssigned } = req.body;

    const existing = await Assignment.findOne({ bookingId, teamMemberId });
    if (existing) {
      return res.status(400).json({ success: false, message: "Member already assigned to this booking" });
    }

    const assignment = new Assignment({
      bookingId,
      teamMemberId,
      shootDate,
      shootType,
      notes,
      amountAssigned: Number(amountAssigned) || 0
    });

    await assignment.save();

    // Auto-generate Ledger Hook
    if (amountAssigned && Number(amountAssigned) > 0) {
      const parentBooking = await Booking.findById(bookingId).select("clientName");
      await Ledger.create({
        teamMemberId,
        referenceType: "assignment",
        referenceId: assignment._id,
        description: `Shoot Allocation: ${shootType} - ${parentBooking ? parentBooking.clientName : "Booking"}`,
        totalAmount: Number(amountAssigned)
      });
    }

    // Note: To expand into an automated API like Twilio or Official Meta Cloud later,
    // you would place your axios.post('https://api.twilio.com...') hooks here.
    // Since we rely on frontend wa.me rendering for standard Whatsapp usage, we just return success.

    res.status(201).json({ success: true, message: "Assignment created", assignment });
  } catch (error) {
    console.error("Create Assignment Error: ", error);
    res.status(500).json({ success: false, message: "Failed to create assignment" });
  }
};

exports.getAssignmentsForBooking = async (req, res) => {
  try {
    const assignments = await Assignment.find({ bookingId: req.params.bookingId }).populate("teamMemberId");
    res.status(200).json({ success: true, assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch assignments" });
  }
};
