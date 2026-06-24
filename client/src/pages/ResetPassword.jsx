import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-toastify";
import { Lock, KeyRound } from "lucide-react";
import { motion } from "framer-motion";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const email = searchParams.get("email");
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/auth/reset-password", { email, otp, newPassword });
      toast.success("Password reset successful! Please login.");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full border border-gray-100"
      >
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Reset Password</h2>
        
        <form onSubmit={handleResetPassword} className="space-y-6">
          <p className="text-sm text-gray-500 text-center">
            Resetting password for: <span className="font-medium text-black">{email}</span>
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
            <div className="relative">
              <KeyRound className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all"
                placeholder="123456"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white font-medium py-2.5 rounded-lg hover:bg-gray-900 transition-colors"
          >
            Reset Password
          </button>
          <div className="text-center mt-4">
            <Link to="/login" className="text-sm text-gray-600 hover:text-black">Back to Login</Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
