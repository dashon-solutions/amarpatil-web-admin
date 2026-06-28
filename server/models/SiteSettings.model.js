const mongoose = require("mongoose");

const siteSettingsSchema = new mongoose.Schema({
  businessName: { type: String, default: "Photography Studio" },
  logo: String,
  stamp: String,
  signature: String,
  qrCode: String,

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

  bankDetails: {
    accountName: { type: String, default: "" },
    bankName: { type: String, default: "" },
    accountNumber: { type: String, default: "" },
    ifscCode: { type: String, default: "" },
    upiId: { type: String, default: "" },
  },

  colors: {
    primary: { type: String, default: "#6B1F2A" },
    secondary: { type: String, default: "#4A1620" },
    accent: { type: String, default: "#B8924A" }
  },

  termsAndConditions: [String], // bullet points

  defaultScopeOfServices: [String],
  defaultDeliverables: [String],
  defaultTimelines: [
    {
      label: { type: String },
      value: { type: String }
    }
  ],

  meta: {
    title: String,
    description: String,
    keywords: [String],
  },
  showTeam: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model("SiteSettings", siteSettingsSchema);
