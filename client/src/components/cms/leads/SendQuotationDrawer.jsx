import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, MessageCircle } from "lucide-react";
import axiosInstance from "../../../utils/axiosInstance";
import { toast } from "react-toastify";

export default function SendQuotationDrawer({ isOpen, onClose, lead, quotations, onStatusUpdate }) {
  const [selectedQuoteId, setSelectedQuoteId] = useState("");
  const [status, setStatus] = useState("idle");

  if (!lead || !quotations) return null;

  const handleSendEmail = async () => {
    if (!selectedQuoteId) return toast.warning("Please select a quotation first.");
    if (!lead.email) return toast.warning("Lead has no registered email address.");

    setStatus("sending");
    try {
      await axiosInstance.post(`/quotations/send/${selectedQuoteId}`, { email: lead.email });
      toast.success("Quotation sent via email!");
      onStatusUpdate(selectedQuoteId, "sent");
      onClose();
    } catch (err) {
      toast.error("Failed to send quotation.");
    } finally {
      setStatus("idle");
    }
  };

  const handleSendWhatsApp = () => {
    if (!selectedQuoteId) return toast.warning("Please select a quotation first.");
    if (!lead.phone && !lead.whatsapp) return toast.warning("No phone number registered.");

    const phoneNum = lead.whatsapp || lead.phone;
    const cleanNum = phoneNum.replace(/[^0-9]/g, '');

    const quote = quotations.find(q => q._id === selectedQuoteId);

    const pdfUrl = `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/quotations/pdf/${quote._id}`;
    const text = `Hello ${lead.name}!%0A%0AWe have prepared your quotation (${quote.quotationNumber}) for your upcoming shoot.%0A%0ATotal Amount: Rs. ${quote.total}%0A%0AYou can review and download the official PDF quotation here: ${pdfUrl}%0A%0ALet us know if you have any questions!`;

    window.open(`https://wa.me/${cleanNum}?text=${text}`, '_blank');

    // Optimistically update status to 'sent'
    onStatusUpdate(selectedQuoteId, "sent");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex justify-end">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          ></motion.div>

          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-sm h-full bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
              <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Send Quotation
              </h2>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Select Quotation</label>
                <div className="space-y-2">
                  {quotations.length === 0 ? (
                    <div className="text-sm text-red-400 italic">No Quotations Exist. Please create one.</div>
                  ) : quotations.map(q => (
                    <label key={q._id} className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${selectedQuoteId === q._id ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/10' : 'border-slate-200 dark:border-slate-800 hover:border-cyan-300'}`}>
                      <input
                        type="radio"
                        name="quote"
                        value={q._id}
                        checked={selectedQuoteId === q._id}
                        onChange={(e) => setSelectedQuoteId(e.target.value)}
                        className="text-cyan-500 w-4 h-4 mr-3"
                      />
                      <div className="flex-1">
                        <div className="font-bold text-slate-900 dark:text-white text-sm">{q.quotationNumber}</div>
                        <div className="text-xs text-slate-500">Total: Rs. {q.total}</div>
                      </div>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${q.status === 'sent' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                        {q.status}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Client Details</label>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl text-sm space-y-2">
                  <div className="flex flex-col">
                    <span className="text-slate-500 text-xs">Email to:</span>
                    <span className="text-slate-900 dark:text-white font-medium">{lead.email || <span className="text-red-400 italic">Not provided</span>}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-500 text-xs">WhatsApp:</span>
                    <span className="text-slate-900 dark:text-white font-medium">{lead.whatsapp || lead.phone || <span className="text-red-400 italic">Not provided</span>}</span>
                  </div>
                </div>
              </div>

            </div>

            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-3">
              <button
                onClick={handleSendEmail}
                disabled={status === "sending" || !lead.email}
                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 font-bold uppercase tracking-widest py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {status === "sending" ? "Sending..." : <><Send className="w-4 h-4" /> Send via Email</>}
              </button>

              <button
                onClick={handleSendWhatsApp}
                disabled={(!lead.phone && !lead.whatsapp)}
                className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold uppercase tracking-widest py-3 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20 disabled:opacity-50"
              >
                <MessageCircle className="w-4 h-4" /> Send via WhatsApp
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
