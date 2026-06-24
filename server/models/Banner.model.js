const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
  title: String,
  subtitle: String,
  slogan: String,
  description: String,

  mainImage: String,
  sideImage: String,

  ctaText: { type: String, default: "Book Now" },
  ctaLink: { type: String, default: "/packages" },

  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model("Banner", bannerSchema);
