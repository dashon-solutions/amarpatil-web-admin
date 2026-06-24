const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  message: { type: String, required: true },
  rating: { type: Number, default: 5, min: 1, max: 5 },
  image: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model("Testimonial", testimonialSchema);
