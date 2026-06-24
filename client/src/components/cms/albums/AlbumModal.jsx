import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Link as LinkIcon, User, AlignLeft } from "lucide-react";
import axiosInstance from "../../../utils/axiosInstance";
import { toast } from "react-toastify";

export default function AlbumModal({ isOpen, onClose, onCreated }) {
  const [formData, setFormData] = useState({
    mode: "booking", // "booking" | "manual"
    deliveryMethod: "digital", // "digital" | "physical"
    bookingId: "",
    clientName: "",
    clientPhone: "",
    eventDate: "",
    driveLink: "",
    selectionType: "client",
    notes: ""
  });
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchBookings();
      setFormData({
        mode: "booking",
        deliveryMethod: "digital",
        bookingId: "",
        clientName: "",
        clientPhone: "",
        eventDate: "",
        driveLink: "",
        selectionType: "client",
        notes: ""
      });
    }
  }, [isOpen]);

  const fetchBookings = async () => {
    try {
      const { data } = await axiosInstance.get("/bookings");
      setBookings(data.bookings || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleBookingChange = (e) => {
    const bId = e.target.value;
    const booking = bookings.find(b => b._id === bId);
    setFormData({
      ...formData,
      bookingId: bId,
      clientName: booking ? booking.clientName : ""
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.mode === "booking" && !formData.bookingId) {
      return toast.error("Please select a booking.");
    }
    if (formData.mode === "manual" && (!formData.clientName || !formData.eventDate)) {
      return toast.error("Please provide Client Name and Event Date.");
    }

    if (formData.deliveryMethod === "digital" && (!formData.driveLink || !formData.driveLink.includes("drive.google.com"))) {
      return toast.error("Must be a valid Google Drive link.");
    }

    setLoading(true);
    try {
      const payload = { ...formData };
      if (payload.mode === "booking") {
        delete payload.clientPhone;
        delete payload.eventDate;
      } else {
        delete payload.bookingId;
      }

      await axiosInstance.post("/albums", payload);
      toast.success("Album mapped successfully");
      onCreated();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create album");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden relative z-10 border border-slate-200 dark:border-slate-800"
        >
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-cyan-600" /> Map New Album
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors group">
              <X className="w-5 h-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Mode Toggle */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button type="button" onClick={() => setFormData({ ...formData, mode: 'booking' })} className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition ${formData.mode === 'booking' ? 'bg-white dark:bg-slate-700 shadow-sm text-cyan-600 dark:text-cyan-400' : 'text-slate-500'}`}>
                Link Booking
              </button>
              <button type="button" onClick={() => setFormData({ ...formData, mode: 'manual' })} className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition ${formData.mode === 'manual' ? 'bg-white dark:bg-slate-700 shadow-sm text-cyan-600 dark:text-cyan-400' : 'text-slate-500'}`}>
                Manual Entry
              </button>
            </div>

            {formData.mode === "booking" ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Booking Reference
                </label>
                <select
                  required={formData.mode === "booking"}
                  value={formData.bookingId}
                  onChange={handleBookingChange}
                  className="w-full pl-3 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all text-sm font-medium"
                >
                  <option value="">Select a Booking</option>
                  {bookings.map(b => (
                    <option key={b._id} value={b._id}>
                      {b.clientName} - {b.shootType} ({new Date(b.eventDate).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Client Name</label>
                  <input required={formData.mode === "manual"} type="text" value={formData.clientName} onChange={(e) => setFormData({ ...formData, clientName: e.target.value })} className="w-full pl-3 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all text-sm font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Phone</label>
                  <input type="text" value={formData.clientPhone} onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })} className="w-full pl-3 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all text-sm font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Event Date</label>
                  <input required={formData.mode === "manual"} type="date" value={formData.eventDate} onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })} className="w-full pl-3 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all text-sm font-medium" />
                </div>
              </div>
            )}

            {/* Delivery Setting Toggle */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
                Delivery Format
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input type="radio" value="digital" checked={formData.deliveryMethod === 'digital'} onChange={(e) => setFormData({ ...formData, deliveryMethod: e.target.value })} className="accent-blue-500 w-4 h-4" />
                  Digital (G-Drive)
                </label>
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input type="radio" value="physical" checked={formData.deliveryMethod === 'physical'} onChange={(e) => setFormData({ ...formData, deliveryMethod: e.target.value })} className="accent-orange-500 w-4 h-4" />
                  Physical (Pen Drive)
                </label>
              </div>
            </div>

            {formData.deliveryMethod === "digital" && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mt-3 mb-2 flex items-center gap-2">
                  <LinkIcon className="w-3 h-3" /> Google Drive Link
                </label>
                <input
                  required={formData.deliveryMethod === "digital"}
                  type="url"
                  value={formData.driveLink}
                  onChange={(e) => setFormData({ ...formData, driveLink: e.target.value })}
                  placeholder="https://drive.google.com/drive/folders/..."
                  className="w-full pl-3 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium"
                />
                <p className="text-[10px] sm:text-xs text-slate-500 mt-1 italic">Ensure link access is set to "Anyone with the link".</p>
              </motion.div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
                Curator Type
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input type="radio" value="client" checked={formData.selectionType === 'client'} onChange={(e) => setFormData({ ...formData, selectionType: e.target.value })} className="accent-cyan-500 w-4 h-4" />
                  Client Selection
                </label>
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input type="radio" value="admin" checked={formData.selectionType === 'admin'} onChange={(e) => setFormData({ ...formData, selectionType: e.target.value })} className="accent-cyan-500 w-4 h-4" />
                  Studio Selection
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                <AlignLeft className="w-3 h-3" /> Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl h-24 focus:ring-2 focus:ring-cyan-500 outline-none transition-all text-sm resize-none custom-scrollbar"
                placeholder="Any special instructions for the design team..."
              ></textarea>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 flex items-center gap-2 bg-slate-900 dark:bg-cyan-600 hover:bg-slate-800 dark:hover:bg-cyan-500 text-white text-sm font-bold rounded-xl transition shadow-md disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {loading ? "Mapping..." : "Save Album"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
