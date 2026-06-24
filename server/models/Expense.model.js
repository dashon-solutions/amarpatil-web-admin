const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  amount: { type: Number, required: true },
  category: { 
     type: String, 
     enum: ["Utility", "Office", "Equipment", "Travel", "Vendor", "Other"],
     default: "Other"
  },
  receiptImage: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Expense", expenseSchema);
