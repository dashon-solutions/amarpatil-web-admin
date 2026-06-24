const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  whatsapp: {
    type: String,
  },
  email: {
    type: String,
  },
  shootType: {
    type: String,
  },
  eventDate: {
    type: Date,
  },
  message: {
    type: String,
  },
  package: {
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
    },
    variantName: {
      type: String,
    },
  },
  source: {
    type: String,
    enum: ["contact_form", "package", "manual"],
    default: "manual",
  },
  status: {
    type: String,
    enum: [
      "new",
      "contacted",
      "quotation_sent",
      "advance_paid",
      "shoot_done",
      "payment_pending",
      "closed"
    ],
    default: "new",
  },
  totalAmount: {
    type: Number,
    default: 0,
  },
  advanceAmount: {
    type: Number,
    default: 0,
  },
  notes: [
    {
      text: String,
      date: { type: Date, default: Date.now },
    },
  ],
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

const Lead = mongoose.model("Lead", leadSchema);

module.exports = Lead;
