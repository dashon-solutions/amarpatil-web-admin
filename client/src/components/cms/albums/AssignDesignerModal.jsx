import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserX } from "lucide-react";

export default function AssignDesignerModal({ isOpen, onClose, team, assignedDesignerId, onDesignerSelected }) {
  const [designerAmount, setDesignerAmount] = React.useState("");

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
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
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative z-10 border border-slate-200 dark:border-slate-800 flex flex-col max-h-[80vh]"
        >
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900 shrink-0">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">Assign Designer</h2>
              <p className="text-xs text-slate-500 font-medium">Select a team member to manage this album</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors group">
              <X className="w-5 h-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200" />
            </button>
          </div>

          <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/10">
             <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Designer Payable Amount (₹)</label>
             <input 
                type="number"
                value={designerAmount}
                onChange={e => setDesignerAmount(e.target.value)}
                placeholder="e.g. 1500 (Optional)"
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-4 py-3 rounded-xl outline-none focus:border-cyan-500 text-sm font-bold shadow-sm"
             />
             <p className="text-[10px] text-slate-400 mt-1.5 italic">This amount converts directly into a Khatabook ledger entry automatically.</p>
          </div>

          <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
            <div className="grid grid-cols-2 gap-3">
              {/* Unassigned Card */}
              <div 
                onClick={() => onDesignerSelected("", null)}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${!assignedDesignerId ? 'bg-cyan-50 border-cyan-500 dark:bg-cyan-900/20' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-cyan-300'}`}
              >
                <div className="w-8 h-8 rounded-full border border-dashed border-slate-400 flex items-center justify-center shrink-0">
                  <UserX className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold truncate ${!assignedDesignerId ? 'text-cyan-700 dark:text-cyan-400' : 'text-slate-600 dark:text-slate-400'}`}>Unassigned</p>
                  <p className="text-[10px] text-slate-500 truncate">Clear current logic</p>
                </div>
              </div>

              {/* Team Cards */}
              {team.map(t => (
                <div 
                  key={t._id}
                  onClick={() => onDesignerSelected(t._id, designerAmount)}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all group ${assignedDesignerId === t._id ? 'bg-cyan-50 border-cyan-500 shadow-sm dark:bg-cyan-900/30' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-cyan-300 hover:shadow-md'}`}
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 shrink-0 border-2 border-white dark:border-slate-800 shadow-sm">
                    <img src={t.photo} alt={t.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold truncate ${assignedDesignerId === t._id ? 'text-cyan-700 dark:text-cyan-400' : 'text-slate-900 dark:text-white'}`}>{t.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
