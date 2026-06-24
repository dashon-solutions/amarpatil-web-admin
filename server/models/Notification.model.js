const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["lead", "reminder", "general"],
    default: "general",
  },
  redirectUrl: {
    type: String,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    expires: 604800 // 7 days in seconds
  }
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);
