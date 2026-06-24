import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, CreditCard } from "lucide-react";
import { toast } from "react-toastify";
import axiosInstance from "../../../utils/axiosInstance";

export default function BookingFinalizeModal({ isOpen, onClose, lead, onBookingConfirm }) {
  const [totalAmount, setTotalAmount] = useState(lead?.totalAmount || "");
  const [advanceAmount, setAdvanceAmount] = useState(lead?.advanceAmount || "");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [loading, setLoading] = useState(false);

  if (!lead) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!totalAmount || !advanceAmount) {
      return toast.error("Please fill in the payment details");
    }

    setLoading(true);
    try {
      const payload = {
        leadId: lead._id,
        totalAmount: Number(totalAmount),
        advanceAmount: Number(advanceAmount),
        paymentMethod
      };

      const res = await axiosInstance.post("/bookings", payload);
      toast.success("Booking confirmed successfully!");
      onBookingConfirm(res.data.lead); // Passes updated lead instance back
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to confirm booking.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex justify-center items-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          ></motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-emerald-50 dark:bg-emerald-950/20">
              <h2 className="text-lg font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" /> Confirm Booking
              </h2>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="text-center mb-4">
                <p className="text-sm font-medium text-slate-500">Advance Payment Received for</p>
                <p className="font-bold text-slate-900 dark:text-white text-lg">{lead.name}</p>
              </div>

              <form id="booking-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Total Project Amount (Rs.)</label>
                  <input
                    required
                    type="number"
                    value={totalAmount}
                    onChange={e => setTotalAmount(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-4 py-3 outline-none focus:border-emerald-500 transition-colors rounded-lg font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Advance Received (Rs.)</label>
                  <input
                    required
                    type="number"
                    value={advanceAmount}
                    onChange={e => setAdvanceAmount(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-4 py-3 outline-none focus:border-emerald-500 transition-colors rounded-lg font-bold text-emerald-600 dark:text-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-4 py-3 outline-none focus:border-emerald-500 transition-colors rounded-lg text-sm"
                  >
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank">Bank Transfer</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <button
                form="booking-form"
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-widest py-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                {loading ? "Processing..." : "Finalize Booking"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
