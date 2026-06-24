const mongoose = require("mongoose");

const gallerySchema = new mongoose.Schema({
  title: String,
  image: { type: String, required: true },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true
  },
  isFeatured: { type: Boolean, default: false }, // If true, shows up on Homepage featured section
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Gallery", gallerySchema);
