const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  title: String,
  description: String,
  mapLink: String,
}, { timestamps: true });

module.exports = mongoose.model("Contact", contactSchema);
