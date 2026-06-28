const mongoose = require("mongoose");

const quotationSchema = new mongoose.Schema({
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lead",
    required: true,
  },
  quotationNumber: {
    type: String,
    required: true,
    unique: true,
  },
  items: [
    {
      title: { type: String, required: true },
      price: { type: Number, required: true },
    },
  ],
  subtotal: {
    type: Number,
    required: true,
  },
  gstEnabled: {
    type: Boolean,
    default: false,
  },
  gstPercentage: {
    type: Number,
    default: 18, // Fixed at 18% as requested
  },
  gstAmount: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    required: true,
  },
  terms: {
    type: String,
  },
  termsList: {
    type: [String],
    default: [],
  },
  scopeOfServices: {
    type: [String],
    default: [],
  },
  deliverables: {
    type: [String],
    default: [],
  },
  timeline: [
    {
      label: { type: String },
      value: { type: String }
    }
  ],
  status: {
    type: String,
    enum: ["draft", "sent", "accepted", "rejected"],
    default: "draft",
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

module.exports = mongoose.model("Quotation", quotationSchema);
