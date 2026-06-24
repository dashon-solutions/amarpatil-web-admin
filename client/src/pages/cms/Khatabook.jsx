import React, { useEffect, useState } from "react";
import { BookText, Search, CreditCard, ChevronRight, User } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import LedgerDetailDrawer from "../../components/cms/khatabook/LedgerDetailDrawer";

export default function Khatabook() {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get("/ledger/summary");
      if (data.success) {
        setSummary(data.summary);
      }
    } catch (e) {
      toast.error("Failed to load Khata summary");
    } finally {
      setLoading(false);
    }
  };

  const filtered = summary.filter((s) =>
    s.member?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col pt-4 overflow-hidden relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 px-1">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
             <BookText className="w-8 h-8 text-cyan-600 dark:text-cyan-400" /> Khata
          </h1>
          <p className="text-slate-500 font-light mt-1 text-sm">Manage assignments, track designer payouts, and handle general expenses.</p>
        </div>
        <div className="flex w-full sm:w-auto items-center gap-3">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search team member..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-600 outline-none transition-all text-sm shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-6">
          <AnimatePresence>
            {loading ? (
              <div className="col-span-full py-20 text-center text-slate-400 font-medium">Loading ledger records...</div>
            ) : filtered.length === 0 ? (
              <div className="col-span-full py-20 text-center">
                <CreditCard className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                <p className="text-slate-500 text-lg font-medium">No team members found.</p>
                <p className="text-slate-400 text-sm mt-1">Add team members in the Team Module to generate Khatabook records.</p>
              </div>
            ) : (
              filtered.map((record, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={record.member._id}
                  onClick={() => { setSelectedMember(record.member); setIsDrawerOpen(true); }}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 cursor-pointer shadow-sm hover:shadow-md hover:border-cyan-300 dark:hover:border-cyan-700 transition-all group"
                >
                  <div className="flex items-center gap-4 mb-5 pb-5 border-b border-slate-100 dark:border-slate-800">
                     <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                        {record.member.photo ? (
                           <img src={record.member.photo} alt={record.member.name} className="w-full h-full object-cover" />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center font-bold text-slate-400">
                             <User className="w-6 h-6" />
                           </div>
                        )}
                     </div>
                     <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate">{record.member.name}</h3>
                        <p className="text-xs text-slate-500 uppercase tracking-widest truncate">{record.member.role || 'Staff'}</p>
                     </div>
                     <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-700 group-hover:text-cyan-500 transition-colors" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Total Value</p>
                        <p className="text-lg font-black text-slate-700 dark:text-slate-300">₹{record.totalAssigned.toLocaleString()}</p>
                     </div>
                     <div>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-emerald-500 mb-1">Advance / Paid</p>
                        <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">₹{record.totalPaid.toLocaleString()}</p>
                     </div>
                     <div className="col-span-2 pt-3 border-t border-slate-50 dark:border-slate-800/50">
                        <div className="flex justify-between items-end">
                           <p className="text-xs uppercase font-bold tracking-widest text-slate-500">Outstanding Balance</p>
                           <p className={`text-xl font-black ${record.totalPending > 0 ? 'text-orange-500' : 'text-slate-400'}`}>
                             ₹{record.totalPending.toLocaleString()}
                           </p>
                        </div>
                     </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      <LedgerDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        member={selectedMember}
        onUpdate={fetchSummary}
      />
    </div>
  );
}
