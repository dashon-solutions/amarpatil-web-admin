require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User.model");

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const existing = await User.findOne({ email: "amarpatil@gmail.com" });

    if (existing) {
      console.log("Admin already exists");
      process.exit();
    }

    const hashedPassword = await bcrypt.hash("Dashon@2025", 10);

    await User.create({
      name: "Admin",
      email: "amarpatil@gmail.com",
      password: hashedPassword,
    });

    console.log("Admin created");
    process.exit();
  } catch (error) {
    console.error("Error seeding admin:", error);
    process.exit(1);
  }
};

seedAdmin();
