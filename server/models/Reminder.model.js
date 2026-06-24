const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  due: {
    type: Date,
    required: true,
  },
  type: {
    type: String,
    default: "follow_up",
  },
  isProcessed: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model("Reminder", reminderSchema);
