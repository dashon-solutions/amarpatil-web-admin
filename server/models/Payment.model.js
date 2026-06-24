const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  method: {
    type: String,
    enum: ["Cash", "UPI", "Bank", "Other"],
    required: true,
  },
  type: {
    type: String,
    enum: ["Advance", "Partial", "Final"],
  },
  date: {
    type: Date,
    default: Date.now,
  },
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Invoice",
  },
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);
