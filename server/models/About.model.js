const mongoose = require("mongoose");

const aboutSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: String,
}, { timestamps: true });

module.exports = mongoose.model("About", aboutSchema);
