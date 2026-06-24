import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send } from "lucide-react";
import { useDispatch } from "react-redux";
import { createLead } from "../../../features/leads/leadSlice";
import { toast } from "react-toastify";

export default function AddLeadModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    whatsapp: "",
    email: "",
    shootType: "",
    eventDate: "",
    message: "",
  });
  const [status, setStatus] = useState("idle");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    
    try {
      await dispatch(createLead({ ...formData, source: "manual" })).unwrap();
      setStatus("success");
      toast.success("Lead added successfully!");
      setFormData({ name: "", phone: "", whatsapp: "", email: "", shootType: "", eventDate: "", message: "" });
      
      setTimeout(() => {
        onClose();
        setStatus("idle");
      }, 1500);
    } catch (error) {
      setStatus("idle");
      toast.error(error || "Failed to add lead.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          ></motion.div>

          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md h-full bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
              <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Add Manual Lead
              </h2>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Full Name *</label>
                  <input required type="text" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-4 py-3 outline-none focus:border-cyan-500 transition-colors rounded-lg text-sm" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Phone *</label>
                    <input required type="text" value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-4 py-3 outline-none focus:border-cyan-500 transition-colors rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">WhatsApp</label>
                    <input type="text" value={formData.whatsapp} onChange={e=>setFormData({...formData, whatsapp: e.target.value})} className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-4 py-3 outline-none focus:border-cyan-500 transition-colors rounded-lg text-sm" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Email</label>
                  <input type="email" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-4 py-3 outline-none focus:border-cyan-500 transition-colors rounded-lg text-sm" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Shoot Type</label>
                    <select value={formData.shootType} onChange={e=>setFormData({...formData, shootType: e.target.value})} className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-4 py-3 outline-none focus:border-cyan-500 transition-colors rounded-lg text-sm">
                      <option value="">Select...</option>
                      <option value="Wedding">Wedding</option>
                      <option value="Pre-Wedding">Pre-Wedding</option>
                      <option value="Maternity">Maternity</option>
                      <option value="Baby Shoot">Baby Shoot</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Event Date</label>
                    <input type="date" value={formData.eventDate} onChange={e=>setFormData({...formData, eventDate: e.target.value})} className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-4 py-3 outline-none focus:border-cyan-500 transition-colors rounded-lg text-sm [color-scheme:light] dark:[color-scheme:dark]" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Initial Notes/Message</label>
                  <textarea rows="3" value={formData.message} onChange={e=>setFormData({...formData, message: e.target.value})} className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-4 py-3 outline-none focus:border-cyan-500 transition-colors rounded-lg text-sm"></textarea>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button type="submit" disabled={status === "sending" || status === "success"} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold uppercase tracking-widest py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                    {status === "idle" ? <><Send className="w-4 h-4"/> Create Lead</> : status === "sending" ? "Creating..." : "Created!"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
