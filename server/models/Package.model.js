const mongoose = require("mongoose");

const packageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  category: { type: String, required: true, default: "General" },

  variants: [
    {
      name: { type: String, required: true }, // e.g., Basic / Premium
      price: { type: Number, required: true },
      sellingPrice: { type: Number, required: true },
      features: [String], // bullet points
      image: String, // optional variant image
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("Package", packageSchema);
