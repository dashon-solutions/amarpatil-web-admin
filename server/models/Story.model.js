const mongoose = require("mongoose");

const storySchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  
  mainImage: { type: String, required: true },
  sideImage: String,
  
  shortDescription: String,
  description: String, // Can be rich text or plain text
  
  galleryImages: [String], // Array of Cloudinary URLs
  
  showOnHome: { type: Boolean, default: false },
  
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Story", storySchema);
