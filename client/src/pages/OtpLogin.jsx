import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { setCredentials } from "../features/auth/authSlice";
import { toast } from "react-toastify";
import { Mail, KeyRound } from "lucide-react";
import { motion } from "framer-motion";

const OtpLogin = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/auth/send-otp", { email });
      toast.success("OTP sent to your email!");
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post("/auth/verify-otp", { email, otp });
      dispatch(setCredentials(res.data));
      toast.success("Login successful");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full border border-gray-100"
      >
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Login via OTP</h2>
        
        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-6">
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
              <Link to="/login" className="text-sm text-gray-600 hover:text-black">Back to Password Login</Link>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
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
            <button
              type="submit"
              className="w-full bg-black text-white font-medium py-2.5 rounded-lg hover:bg-gray-900 transition-colors"
            >
              Verify & Login
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default OtpLogin;
