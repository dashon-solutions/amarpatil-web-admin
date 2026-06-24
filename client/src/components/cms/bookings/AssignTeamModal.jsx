import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, UserCheck, MessageCircle } from "lucide-react";
import axiosInstance from "../../../utils/axiosInstance";
import { toast } from "react-toastify";

export default function AssignTeamModal({ isOpen, onClose, booking, onAssignFinished }) {
  const [team, setTeam] = useState([]);
  const [selectedMember, setSelectedMember] = useState("");
  const [amountAssigned, setAmountAssigned] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) fetchTeam();
  }, [isOpen]);

  const fetchTeam = async () => {
    try {
      const { data } = await axiosInstance.get("/team");
      setTeam(data.team);
    } catch (e) {
      toast.error("Failed to load team");
    }
  };

  if (!isOpen || !booking) return null;

  const handleAssign = async () => {
    if (!selectedMember) return toast.warning("Please select a team member");

    setLoading(true);
    try {
      const payload = {
        bookingId: booking._id,
        teamMemberId: selectedMember,
        shootDate: booking.eventDate,
        shootType: booking.shootType,
        notes,
        amountAssigned
      };

      const { data } = await axiosInstance.post("/assignments", payload);

      const member = team.find(m => m._id === selectedMember);

      // Build WhatsApp execution
      if (member && member.phone) {
        let ph = member.whatsapp || member.phone;
        ph = ph.replace(/[^0-9]/g, '');
        const txt = `Hello ${member.name},%0A%0AYou have been assigned a new shoot! 📸%0A%0A📅 Date: ${booking.eventDate ? new Date(booking.eventDate).toLocaleDateString() : 'TBD'}%0A📍 Type: ${booking.shootType || 'Photography'}%0A%0AClient: ${booking.clientName}%0A%0A${notes ? `Notes:%0A${notes}` : ''}`;

        window.open(`https://wa.me/${ph}?text=${txt}`, '_blank');
      }

      toast.success("Team member assigned successfully!");
      onAssignFinished();
      onClose();
    } catch (error) {
      toast.error("Failed to assign team member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex justify-center items-end sm:items-center">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        ></motion.div>

        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="relative w-full sm:max-w-md bg-white dark:bg-slate-950 rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
        >
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center">
              <UserCheck className="w-4 h-4 mr-2" /> Assign Staff
            </h2>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-200 dark:bg-slate-800 rounded-full transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 overflow-y-auto space-y-5 custom-scrollbar">

            <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-100 dark:border-cyan-900/50 p-4 rounded-xl">
              <div className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest mb-1">Booking Info</div>
              <div className="font-bold text-slate-900 dark:text-white">{booking.clientName} - {booking.shootType || 'Shoot'}</div>
              <div className="text-sm text-cyan-700 dark:text-cyan-500 mt-1">{booking.eventDate ? new Date(booking.eventDate).toLocaleDateString() : 'Date TBA'}</div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Select Member</label>
              <div className="space-y-2">
                {team.length === 0 ? (
                  <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-200 dark:border-red-900/50">No team members available. Go to Team Management to add some.</div>
                ) : (
                  team.map((member) => (
                    <label
                      key={member._id}
                      className={`flex items-center p-3 border rounded-xl cursor-pointer transition-colors ${selectedMember === member._id ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/10' : 'border-slate-200 dark:border-slate-800'}`}
                    >
                      <input type="radio" value={member._id} checked={selectedMember === member._id} onChange={(e) => setSelectedMember(e.target.value)} className="text-cyan-500 w-4 h-4 mr-3" />
                      <div className="flex items-center gap-3 w-full">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 shrink-0">
                          {member.photo ? <img src={member.photo} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-xs uppercase">{member.name.charAt(0)}</div>}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-slate-900 dark:text-white text-sm">{member.name}</div>
                          <div className="text-[10px] text-slate-500 truncate">{member.skills.join(", ") || 'No specific skills'}</div>
                        </div>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Total Payable Amount (₹)</label>
              <input
                type="number"
                value={amountAssigned}
                onChange={e => setAmountAssigned(e.target.value)}
                placeholder="e.g. 5000"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-4 py-3 rounded-xl outline-none focus:border-cyan-500 text-sm mb-4 font-bold"
              />

              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Internal Notes / Brief</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Bring drone setup, focus on candid shots..."
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-4 py-3 rounded-xl outline-none focus:border-cyan-500 text-sm"
                rows="3"
              ></textarea>
            </div>

          </div>

          <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <button
              onClick={handleAssign}
              disabled={loading || team.length === 0}
              className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold uppercase tracking-widest py-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20 disabled:opacity-50"
            >
              {loading ? "Processing..." : <><MessageCircle className="w-5 h-5" /> Assign & Notify Staff</>}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
