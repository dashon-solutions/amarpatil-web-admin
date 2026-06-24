import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-toastify";
import { Mail } from "lucide-react";
import { motion } from "framer-motion";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/auth/forgot-password", { email });
      toast.success("OTP sent to your email!");
      navigate(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full border border-gray-100"
      >
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Forgot Password</h2>
        
        <form onSubmit={handleSendOtp} className="space-y-6">
          <p className="text-sm text-gray-500 text-center">
            Enter your email and we'll send you an OTP to reset your password.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all"
                placeholder="admin@gmail.com"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white font-medium py-2.5 rounded-lg hover:bg-gray-900 transition-colors"
          >
            Send OTP
          </button>
          <div className="text-center mt-4">
            <Link to="/login" className="text-sm text-gray-600 hover:text-black">Back to Login</Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
