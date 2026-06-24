const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  method: { type: String, default: "cash" },
  referenceImage: String, // Cloudinary URL for proof
  notes: String
});

const ledgerSchema = new mongoose.Schema({
  teamMemberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TeamMember",
    required: true,
  },
  referenceType: {
    type: String,
    enum: ["assignment", "album", "manual"],
    required: true,
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    // Can ref Assignment or Album
  },
  description: {
    type: String,
    required: true,
  },
  proofImage: {
    type: String
  },
  totalAmount: {
    type: Number,
    required: true,
    default: 0
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  payments: [paymentSchema],
  status: {
    type: String,
    enum: ["pending", "partial", "paid"],
    default: "pending"
  },
  activityLogs: [{
    message: String,
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

// Auto-calculate status before saving
ledgerSchema.pre("save", function() {
  if (this.paidAmount >= this.totalAmount && this.totalAmount > 0) {
    this.status = "paid";
  } else if (this.paidAmount > 0 && this.paidAmount < this.totalAmount) {
    this.status = "partial";
  } else {
    this.status = "pending";
  }
});

module.exports = mongoose.model("Ledger", ledgerSchema);
