import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";

export default function LeadModal({ isOpen, onClose, prefillData }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    eventDate: "",
    shootType: prefillData?.category || "Unknown",
    message: "",
  });
  const [status, setStatus] = useState("idle");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    
    try {
      const payload = {
        ...formData,
        source: "package",
        package: prefillData ? {
          variantName: prefillData.variantName,
          // packageId can also be stored if passed in
        } : undefined
      };

      await axiosInstance.post("/leads", payload);
      setStatus("success");
      toast.success("Inquiry sent successfully!");
      
      setTimeout(() => {
        onClose();
        setStatus("idle");
      }, 2000);
    } catch (error) {
      setStatus("idle");
      toast.error("Failed to send inquiry. Please try again.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          ></motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 p-8 shadow-2xl rounded-sm text-left overflow-y-auto max-h-[90vh]"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-3xl font-black text-white uppercase tracking-wider mb-2">Book Package</h2>
            <p className="text-slate-400 mb-8 font-light">
              You are inquiring about {" "}
              <span className="text-cyan-400 font-bold">{prefillData?.title}</span> - {" "}
              <span className="text-white">{prefillData?.variantName}</span>
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Your Name</label>
                  <input required type="text" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-3 outline-none focus:border-cyan-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Phone</label>
                  <input required type="text" value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-3 outline-none focus:border-cyan-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Email</label>
                  <input required type="email" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-3 outline-none focus:border-cyan-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Event Date</label>
                  <input type="date" value={formData.eventDate} onChange={e=>setFormData({...formData, eventDate: e.target.value})} className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-3 outline-none focus:border-cyan-500 transition-colors placeholder-slate-600 [color-scheme:dark]" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Additional Details</label>
                <textarea rows="3" value={formData.message} onChange={e=>setFormData({...formData, message: e.target.value})} placeholder="Any specific requirements or questions?" className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-3 outline-none focus:border-cyan-500 transition-colors" />
              </div>
              
              <button disabled={status === "sending" || status === "success"} type="submit" className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black uppercase tracking-widest py-4 transition-colors flex items-center justify-center gap-2">
                {status === "idle" ? <><Send className="w-4 h-4"/> Confirm Request</> : status === "sending" ? "Processing..." : "Saved!"}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
