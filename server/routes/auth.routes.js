const express = require("express");
const { login, sendOtp, verifyOtp, forgotPassword, resetPassword } = require("../controllers/auth.controller");
const router = express.Router();

router.post("/login", login);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
