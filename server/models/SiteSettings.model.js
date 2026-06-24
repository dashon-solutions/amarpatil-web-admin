const mongoose = require("mongoose");

const siteSettingsSchema = new mongoose.Schema({
  businessName: { type: String, default: "Photography Studio" },
  logo: String,
  stamp: String,
  signature: String,

  contact: {
    phone: String,
    email: String,
    address: String,
  },

  socialLinks: {
    facebook: String,
    instagram: String,
    youtube: String,
    whatsapp: String,
  },

  termsAndConditions: [String], // bullet points

  meta: {
    title: String,
    description: String,
    keywords: [String],
  },
  showTeam: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model("SiteSettings", siteSettingsSchema);
