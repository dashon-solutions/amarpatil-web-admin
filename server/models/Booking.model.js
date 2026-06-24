const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lead",
    required: true,
  },
  clientName: {
    type: String,
    required: true,
  },
  eventDate: {
    type: Date,
  },
  time: {
    type: String,
    default: "10:00 AM",
  },
  shootType: {
    type: String,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  advanceAmount: {
    type: Number,
    required: true,
  },
  remainingAmount: {
    type: Number,
  },
  paymentMethod: {
    type: String,
    enum: ["Cash", "UPI", "Bank", "Other"],
    default: "Other",
  },
  status: {
    type: String,
    enum: ["upcoming", "completed", "cancelled"],
    default: "upcoming",
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

bookingSchema.pre('save', function () {
  this.remainingAmount = this.totalAmount - this.advanceAmount;
});

module.exports = mongoose.model("Booking", bookingSchema);
