const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional, can be tied explicitly or stored universally 
  },
  endpoint: {
    type: String,
    required: true,
    unique: true
  },
  keys: {
    p256dh: { type: String, required: true },
    auth: { type: String, required: true }
  }
}, { timestamps: true });

module.exports = mongoose.model("Subscription", subscriptionSchema);
