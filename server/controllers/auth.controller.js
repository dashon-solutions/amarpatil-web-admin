const User = require("../models/User.model");
const Otp = require("../models/Otp.model");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");
const generateOtp = require("../utils/generateOtp");
const sendEmail = require("../utils/sendEmail");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    res.json({ user, token: generateToken(user) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = generateOtp();
    await Otp.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 2 * 60 * 1000), // 2 min
    });

    await sendEmail({
      email,
      subject: "Login OTP",
      message: `Your OTP is ${otp}. It will expire in 2 minutes.`,
    });

    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const record = await Otp.findOne({ email, otp });

    if (!record || record.expiresAt < new Date()) {
      return res.status(400).json({ message: "OTP expired or invalid" });
    }

    const user = await User.findOne({ email });
    res.json({ user, token: generateToken(user) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = generateOtp();
    await Otp.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 2 * 60 * 1000),
    });

    await sendEmail({
      email,
      subject: "Password Reset OTP",
      message: `Your OTP to reset your password is ${otp}. It will expire in 2 minutes.`,
    });

    res.json({ message: "OTP sent for password reset" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const record = await Otp.findOne({ email, otp });

    if (!record || record.expiresAt < new Date()) {
      return res.status(400).json({ message: "OTP expired or invalid" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await User.findOneAndUpdate({ email }, { password: hashed });

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
