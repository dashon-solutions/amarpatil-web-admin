const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  whatsapp: String,
  email: String,
  photo: String, // Cloudinary URL
  skills: [String],
  gear: [String],
  tools: [String],
  notes: String,
  showOnAbout: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("TeamMember", teamSchema);
