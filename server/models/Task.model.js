const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
  },
  assignedTo: {
    type: String,
  },
  notes: {
    type: String,
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
  },
  status: {
    type: String,
    enum: ["pending", "completed"],
    default: "pending",
  },
  color: {
    type: String,
    default: "green",
  },
}, { timestamps: true });

module.exports = mongoose.model("Task", taskSchema);
