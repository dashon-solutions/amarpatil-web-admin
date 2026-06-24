import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { setCredentials } from "../features/auth/authSlice";
import { toast } from "react-toastify";
import { Mail, Lock } from "lucide-react";
import { motion } from "framer-motion";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post("/auth/login", { email, password });
      dispatch(setCredentials({ user: res.data.user, token: res.data.token }));
      toast.success("Login successful!");
      navigate("/admin");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white">
      {/* Left Wrapper - Photography Image */}
      <div className="hidden lg:flex w-1/2 relative bg-black overflow-hidden flex-col justify-between p-12 text-white">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=2000&auto=format&fit=crop" 
            alt="Photography Camera" 
            className="w-full h-full object-cover opacity-60"
          />
        </div>
        <div className="relative z-10">
          <div className="text-2xl font-bold tracking-wider uppercase">StudioFlow</div>
        </div>
        <div className="relative z-10 max-w-md">
          <h2 className="text-4xl font-light leading-snug mb-4 text-white">
            Manage your photography business with absolute clarity.
          </h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            The complete CRM & CMS platform built exclusively for professional photographers to capture clients, track bookings, and organize workflows.
          </p>
        </div>
      </div>

      {/* Right Wrapper - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 bg-gray-50 lg:bg-white">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-white p-8 lg:p-0 rounded-2xl shadow-xl lg:shadow-none w-full max-w-md"
        >
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-2xl font-bold tracking-wider uppercase text-gray-900">StudioFlow</h1>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-gray-500 text-sm mb-8">Please enter your credentials to access the admin dashboard.</p>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:bg-white outline-none transition-all"
                  placeholder="admin@studio.com"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:bg-white outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <Link to="/otp-login" className="text-sm text-gray-600 hover:text-black font-semibold transition-colors">Use OTP Login</Link>
              <Link to="/forgot-password" className="text-sm text-gray-600 hover:text-black font-medium transition-colors">Forgot Password?</Link>
            </div>

            <button
              type="submit"
              className="w-full bg-black text-white font-medium py-3 rounded-xl hover:bg-gray-800 focus:ring-4 focus:ring-gray-200 transition-all mt-4 flex items-center justify-center gap-2"
            >
              Sign In to Dashboard
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
