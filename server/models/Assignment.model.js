const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true,
  },
  teamMemberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TeamMember",
    required: true,
  },
  shootDate: Date,
  shootType: String,
  amountAssigned: { type: Number, default: 0 },
  notes: String,
  status: {
    type: String,
    enum: ["assigned", "completed", "cancelled"],
    default: "assigned",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Assignment", assignmentSchema);
