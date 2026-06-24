import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, Clock, MapPin, Plus, Receipt, User, Upload, FileText, Image as ImageIcon, ChevronDown, ChevronUp, Eye } from "lucide-react";
import axiosInstance from "../../../utils/axiosInstance";
import { toast } from "react-toastify";

export default function LedgerDetailDrawer({ isOpen, onClose, member, onUpdate }) {
   const [entries, setEntries] = useState([]);
   const [totalAssigned, setTotalAssigned] = useState(0);
   const [totalPaid, setTotalPaid] = useState(0);
   const [totalPending, setTotalPending] = useState(0);
   const [loading, setLoading] = useState(false);

   // Manual Entry Form
   const [isManualModalOpen, setIsManualModalOpen] = useState(false);
   const [manualAmount, setManualAmount] = useState("");
   const [manualDesc, setManualDesc] = useState("");
   const [manualType, setManualType] = useState("expense"); // "expense" or "payment"
   const [manualProof, setManualProof] = useState(null);

   // Logs Logic
   const [expandedLogId, setExpandedLogId] = useState(null);

   // Payment Form
   const [activePaymentEntry, setActivePaymentEntry] = useState(null); // the ledger ID
   const [paymentAmount, setPaymentAmount] = useState("");
   const [paymentMethod, setPaymentMethod] = useState("UPI");
   const [paymentNotes, setPaymentNotes] = useState("");
   const [paymentProof, setPaymentProof] = useState(null);
   const [isUploading, setIsUploading] = useState(false);

   // Edit Amount Logic
   const [editingEntryId, setEditingEntryId] = useState(null);
   const [editAmount, setEditAmount] = useState("");

   useEffect(() => {
      if (isOpen && member) {
         fetchLedger();
      }
   }, [isOpen, member]);

   const fetchLedger = async () => {
      setLoading(true);
      try {
         const { data } = await axiosInstance.get(`/ledger/user/${member._id}`);
         setEntries(data.entries);
         setTotalAssigned(data.totalAssigned);
         setTotalPaid(data.totalPaid);
         setTotalPending(data.totalPending);
      } catch (error) {
         toast.error("Failed to load ledgers");
      } finally {
         setLoading(false);
      }
   };

   const handleManualEntry = async () => {
      if (!manualAmount || !manualDesc) return toast.warning("Amount and Description required");
      try {
         setIsUploading(true);
         const formData = new FormData();
         formData.append("teamMemberId", member._id);
         formData.append("amount", manualAmount);
         formData.append("description", manualDesc);
         formData.append("type", manualType);
         if (manualProof) formData.append("proof", manualProof);

         await axiosInstance.post(`/ledger/manual`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
         });

         toast.success(manualType === 'expense' ? "Cost registered" : "Direct payment logged");
         setIsManualModalOpen(false);
         setManualAmount("");
         setManualDesc("");
         setManualType("expense");
         setManualProof(null);
         fetchLedger();
         onUpdate();
      } catch (e) {
         toast.error("Failed to log manual entry");
      } finally {
         setIsUploading(false);
      }
   };

   const handleEditAmount = async (entryId) => {
      if (editAmount === "") return toast.warning("Enter a valid amount");
      try {
         await axiosInstance.put(`/ledger/${entryId}/amount`, { amount: editAmount });
         toast.success("Assigned amount corrected!");
         setEditingEntryId(null);
         setEditAmount("");
         fetchLedger();
         onUpdate();
      } catch (e) {
         toast.error("Failed to update amount");
      }
   };

   const handlePaymentSubmit = async () => {
      if (!paymentAmount) return toast.warning("Enter payment amount");

      // Boundary Validation Map against the current open Entry
      const targetEntry = entries.find(e => e._id === activePaymentEntry);
      if (targetEntry) {
         const balance = targetEntry.totalAmount - targetEntry.paidAmount;
         if (Number(paymentAmount) > balance) return toast.error(`Max payment limit for this event is ₹${balance.toLocaleString()}`);
      }

      try {
         setIsUploading(true);
         const formData = new FormData();
         formData.append("amount", paymentAmount);
         formData.append("method", paymentMethod);
         formData.append("notes", paymentNotes);
         if (paymentProof) formData.append("proof", paymentProof);

         await axiosInstance.post(`/ledger/${activePaymentEntry}/payment`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
         });

         toast.success("Payment successful!");
         setActivePaymentEntry(null);
         setPaymentAmount("");
         setPaymentNotes("");
         setPaymentProof(null);
         fetchLedger();
         onUpdate();
      } catch (e) {
         toast.error("Payment failed");
      } finally {
         setIsUploading(false);
      }
   };

   if (!member) return null;

   const drawerVariants = {
      closed: { x: "100%", transition: { type: "tween", duration: 0.3 } },
      open: { x: 0, transition: { type: "tween", duration: 0.3, ease: "easeOut" } },
   };

   return (
      <AnimatePresence>
         {isOpen && (
            <>
               <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
                  onClick={onClose}
               />
               <motion.div
                  variants={drawerVariants} initial="closed" animate="open" exit="closed"
                  className="fixed top-0 right-0 h-full w-full max-w-lg bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col border-l border-slate-200 dark:border-slate-800"
               >
                  <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-white shadow-sm ring-2 ring-cyan-500/20">
                           {member.photo ? <img src={member.photo} className="w-full h-full object-cover" /> : <User className="w-12 h-12 p-3 text-slate-300" />}
                        </div>
                        <div>
                           <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{member.name}</h2>
                           <p className="text-xs text-slate-500 uppercase tracking-widest">{member.role || 'Team Member'}</p>
                        </div>
                     </div>
                     <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-200 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                     </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-50/50 dark:bg-slate-950">

                     {/* KHATA SUMMARY EXPORT BLOCK */}
                     <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                           <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Total Paid</p>
                           <p className="text-2xl font-black text-emerald-500 text-left">₹{totalPaid.toLocaleString()}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col items-end">
                           <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Total Pending</p>
                           <p className={`text-2xl font-black text-right ${totalPending > 0 ? 'text-orange-500' : 'text-slate-400'}`}>₹{totalPending.toLocaleString()}</p>
                        </div>
                     </div>

                     <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Transaction Ledger</h3>
                        <button onClick={() => setIsManualModalOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-xs font-bold shadow-sm hover:scale-95 transition-transform">
                           <Plus className="w-3 h-3" /> Manual Expense
                        </button>
                     </div>

                     {loading ? (
                        <div className="text-center text-slate-400 py-10">Loading ledger...</div>
                     ) : entries.length === 0 ? (
                        <div className="text-center text-slate-400 py-10 italic">No transactions found.</div>
                     ) : (
                        <div className="space-y-4">
                           {entries.map(entry => {
                              const balance = entry.totalAmount - entry.paidAmount;
                              return (
                                 <div key={entry._id} className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
                                    {/* Header Stripe based on Type */}
                                    <div className={`h-1.5 w-full ${entry.referenceType === 'assignment' ? 'bg-cyan-500' : entry.referenceType === 'album' ? 'bg-purple-500' : 'bg-slate-500'}`}></div>

                                    <div className="p-4">
                                       <div className="flex justify-between items-start mb-2">
                                          <div>
                                             <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-widest mb-2 inline-block ${entry.referenceType === 'assignment' ? 'bg-cyan-100 text-cyan-700' :
                                                entry.referenceType === 'album' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'
                                                }`}>
                                                {entry.referenceType}
                                             </span>
                                             <h4 className="font-bold text-slate-900 dark:text-white text-base leading-tight mb-1 flex items-center gap-2">
                                                {entry.description}
                                             </h4>
                                             <p className="text-[10px] text-slate-400 uppercase tracking-wider">{new Date(entry.createdAt).toLocaleString()}</p>
                                          </div>
                                          <div className="text-right">
                                             <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-0.5">Assigned Cost</p>
                                             {editingEntryId === entry._id ? (
                                                <div className="flex items-center gap-1">
                                                   <input type="number" autoFocus value={editAmount} onChange={e => setEditAmount(e.target.value)} className="w-16 px-1.5 py-0.5 border border-cyan-500 rounded text-xs outline-none bg-white dark:bg-slate-800 dark:text-white" />
                                                   <button onClick={() => handleEditAmount(entry._id)} className="text-emerald-500 hover:text-emerald-600"><CheckCircle className="w-4 h-4" /></button>
                                                   <button onClick={() => setEditingEntryId(null)} className="text-red-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                                                </div>
                                             ) : (
                                                <div className="flex items-center gap-2 justify-end cursor-pointer group" onClick={() => { setEditingEntryId(entry._id); setEditAmount(entry.totalAmount); }}>
                                                   <p className="font-black text-slate-900 dark:text-white">₹{entry.totalAmount.toLocaleString()}</p>
                                                   <span className="text-[10px] text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Edit</span>
                                                </div>
                                             )}
                                          </div>
                                       </div>

                                       {/* Expandable Action UI */}
                                       {balance > 0 && activePaymentEntry !== entry._id ? (
                                          <div className="mt-4 pt-3 border-t border-dashed border-slate-200 dark:border-slate-800 flex justify-between items-center">
                                             <div className="flex items-center gap-2">
                                                <span className="text-[10px] uppercase font-bold text-slate-400">Paid: <span className="text-emerald-500">₹{entry.paidAmount.toLocaleString()}</span></span>
                                                <span className="text-[10px] uppercase font-bold text-slate-400">Pending: <span className="text-orange-500">₹{balance.toLocaleString()}</span></span>
                                             </div>
                                             <button onClick={() => setActivePaymentEntry(entry._id)} className="px-3 py-1.5 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 font-bold text-xs rounded-lg border border-cyan-200 dark:border-cyan-800 hover:bg-cyan-100 transition-colors">
                                                Record Payment
                                             </button>
                                          </div>
                                       ) : null}

                                       {/* View History Toggle Button (UX Improvement) */}
                                       {(entry.payments?.length > 0 || entry.activityLogs?.length > 0 || entry.proofImage) && activePaymentEntry !== entry._id && (
                                          <button
                                             onClick={() => setExpandedLogId(expandedLogId === entry._id ? null : entry._id)}
                                             className="w-full mt-4 flex items-center justify-center gap-2 py-2 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 text-[10px] uppercase tracking-widest font-bold rounded-lg border border-slate-200 dark:border-slate-700 transition"
                                          >
                                             {expandedLogId === entry._id ? <><ChevronUp className="w-3.5 h-3.5" /> Hide Timeline</> : <><ChevronDown className="w-3.5 h-3.5" /> View detailed timeline {(entry.payments?.length + entry.activityLogs?.length > 0) ? `(${entry.payments?.length + entry.activityLogs?.length} Logs)` : ''}</>}
                                          </button>
                                       )}

                                       {/* Inline Payment Form */}
                                       {activePaymentEntry === entry._id && (
                                          // ... form logic natively unchanged 
                                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                             <h5 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2"><Receipt className="w-3.5 h-3.5" /> Settle Account</h5>
                                             <div className="flex gap-2 mb-3">
                                                <input type="number" placeholder={`Pending: ₹${balance}`} value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} className="bg-slate-50 dark:bg-slate-950 dark:text-white border border-slate-200 dark:border-slate-700 text-sm px-3 py-2 rounded-lg flex-1 outline-none focus:border-cyan-500" />
                                                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="bg-slate-50 dark:bg-slate-950 dark:text-white border border-slate-200 dark:border-slate-700 text-sm px-3 py-2 rounded-lg outline-none focus:border-cyan-500">
                                                   <option value="UPI">UPI</option>
                                                   <option value="Cash">Cash</option>
                                                   <option value="Bank">Bank Transfer</option>
                                                </select>
                                             </div>
                                             <input type="text" placeholder="Transaction ID / Notes (Optional)" value={paymentNotes} onChange={e => setPaymentNotes(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 dark:text-white border border-slate-200 dark:border-slate-700 text-sm px-3 py-2 rounded-lg outline-none focus:border-cyan-500 mb-3" />
                                             <div className="flex items-center gap-3 mb-4">
                                                <label className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition text-xs font-bold text-slate-600">
                                                   <Upload className="w-3 h-3" /> Upload Proof
                                                   <input type="file" accept="image/*" className="hidden" onChange={e => setPaymentProof(e.target.files[0])} />
                                                </label>
                                             </div>

                                             {paymentProof && (
                                                <div className="relative w-20 h-20 mb-4 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                                                   <img src={URL.createObjectURL(paymentProof)} className="w-full h-full object-cover" alt="Preview" />
                                                   <button onClick={() => setPaymentProof(null)} className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full hover:bg-black/80"><X className="w-3 h-3" /></button>
                                                </div>
                                             )}
                                             <div className="flex gap-2">
                                                <button onClick={() => setActivePaymentEntry(null)} className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">Cancel</button>
                                                <button onClick={handlePaymentSubmit} disabled={isUploading} className="flex-1 py-2 bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-sm shadow-emerald-500/20">{isUploading ? 'Uploading...' : 'Confirm Paid'}</button>
                                             </div>
                                          </motion.div>
                                       )}

                                       {/* Toggleable Logs Panel */}
                                       <AnimatePresence>
                                          {expandedLogId === entry._id && (
                                             <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 overflow-hidden">

                                                {/* Original Image Proof Thumbnail (Thumbnails directly shown!) */}
                                                {entry.proofImage && (
                                                   <div className="mb-6 flex flex-col gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:shadow-md transition">
                                                      <a href={entry.proofImage} target="_blank" rel="noreferrer" className="block relative group shrink-0 w-full h-48 sm:h-64">
                                                         <img src={entry.proofImage} className="w-full h-full object-cover rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800" alt="Original Proof" />
                                                         <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex flex-col justify-center items-center rounded-lg backdrop-blur-sm">
                                                            <Eye className="w-6 h-6 text-white mb-2" />
                                                            <span className="text-[10px] uppercase font-bold text-white tracking-widest">View HD Image</span>
                                                         </div>
                                                      </a>
                                                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                         <p className="text-[10px] uppercase font-bold text-cyan-600 dark:text-cyan-400 mb-1.5 tracking-widest flex items-center gap-1.5"><ImageIcon className="w-3.5 h-3.5" /> Attached Reference</p>
                                                         <h5 className="text-base font-black text-slate-900 dark:text-white mb-1 truncate">Original Expense Receipt</h5>
                                                         <p className="text-xs text-slate-500 leading-relaxed mb-4 break-words">This image was attached when the manual expense entry was originally recorded into the ledger.</p>
                                                         <a href={entry.proofImage} target="_blank" rel="noreferrer" className="self-start text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase py-1.5 px-3 rounded tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition">Open in new tab</a>
                                                      </div>
                                                   </div>
                                                )}

                                                {/* Payments History Track */}
                                                {entry.payments?.length > 0 && (
                                                   <div className="mb-6">
                                                      <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                                                         <Receipt className="w-4 h-4 text-slate-400" />
                                                         <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Payment Transactions</p>
                                                      </div>
                                                      <div className="space-y-3">
                                                         {entry.payments.map((p, i) => (
                                                            <div key={i} className="flex flex-col gap-4 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow border-l-4 border-l-emerald-500 transition group">

                                                               {/* Interactive Prominent Image Thumbnail */}
                                                               {p.referenceImage && (
                                                                  <a href={p.referenceImage} target="_blank" rel="noreferrer" className="block relative w-full h-48 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                                                                     <img src={p.referenceImage} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Payment Proof" />
                                                                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col justify-center items-center transition backdrop-blur-[2px]">
                                                                        <Eye className="w-5 h-5 text-white mb-1" />
                                                                        <span className="text-[9px] uppercase font-bold text-white tracking-widest">Verify</span>
                                                                     </div>
                                                                  </a>
                                                               )}

                                                               <div className="flex-1 min-w-0 flex flex-col justify-between">
                                                                  <div>
                                                                     <div className="flex justify-between items-start mb-1 gap-2">
                                                                        <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">₹{p.amount.toLocaleString()}</span>
                                                                        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-[9px] font-bold uppercase tracking-widest shadow-sm shrink-0">{p.method} Transfer</span>
                                                                     </div>
                                                                     {p.notes && <p className="text-xs text-slate-500 italic mt-1 leading-snug break-words">Note: "{p.notes}"</p>}
                                                                  </div>

                                                                  <div className="flex justify-between items-end mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 font-medium">
                                                                     <div className="flex items-center gap-1.5 text-emerald-500 shrink-0">
                                                                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                                                        <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 dark:text-emerald-400">Processed</span>
                                                                     </div>
                                                                     <div className="text-right min-w-0">
                                                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-0.5 truncate">Time of Settlement</p>
                                                                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block truncate">{new Date(p.date).toLocaleString()}</span>
                                                                     </div>
                                                                  </div>
                                                               </div>
                                                            </div>
                                                         ))}
                                                      </div>
                                                   </div>
                                                )}

                                                {/* Tracking Revision Logs */}
                                                {entry.activityLogs?.length > 0 && (
                                                   <div>
                                                      <p className="text-[8px] uppercase tracking-widest text-slate-400 font-bold mb-2">Revision History</p>
                                                      <div className="space-y-1.5 border-l-2 border-slate-100 dark:border-slate-800 pl-2">
                                                         {entry.activityLogs.map((log, i) => (
                                                            <div key={i} className="flex gap-2 items-start text-[10px]">
                                                               <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 mt-1.5 shrink-0"></div>
                                                               <div className="flex-1 text-slate-500 leading-tight">
                                                                  {log.message} <span className="text-slate-400">({new Date(log.timestamp).toLocaleString()})</span>
                                                               </div>
                                                            </div>
                                                         ))}
                                                      </div>
                                                   </div>
                                                )}

                                             </motion.div>
                                          )}
                                       </AnimatePresence>

                                    </div>
                                 </div>
                              )
                           })}
                        </div>
                     )}
                  </div>
               </motion.div>

               {/* Manual Entry Modal Overlap */}
               <AnimatePresence>
                  {isManualModalOpen && (
                     <div className="fixed inset-0 z-[60] flex items-center justify-center">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60" onClick={() => setIsManualModalOpen(false)} />
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
                           <h3 className="font-black text-lg mb-4 text-slate-900 dark:text-white">Add Manual Entry</h3>

                           <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg mb-4">
                              <button onClick={() => setManualType("expense")} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${manualType === 'expense' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white' : 'text-slate-500'}`}>Work Value / Cost</button>
                              <button onClick={() => setManualType("payment")} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${manualType === 'payment' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white' : 'text-slate-500'}`}>Direct Payment / Advance</button>
                           </div>

                           <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Amount (₹)</label>
                           <input type="number" value={manualAmount} onChange={e => setManualAmount(e.target.value)} placeholder="e.g. 500" className="w-full bg-slate-50 dark:bg-slate-950 dark:text-white border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg mb-4 outline-none focus:border-cyan-500" />

                           <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Description / Reason</label>
                           <input type="text" value={manualDesc} onChange={e => setManualDesc(e.target.value)} placeholder={manualType === 'expense' ? 'e.g. Travel Allowance' : 'e.g. Cash Advance'} className="w-full bg-slate-50 dark:bg-slate-950 dark:text-white border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg mb-4 outline-none focus:border-cyan-500" />

                           <div className="flex items-center gap-3 mb-4">
                              <label className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg cursor-pointer transition text-xs font-bold text-slate-600 dark:text-slate-300">
                                 <Upload className="w-3 h-3" /> Upload Receipt / Proof
                                 <input type="file" accept="image/*" className="hidden" onChange={e => setManualProof(e.target.files[0])} />
                              </label>
                           </div>

                           {manualProof && (
                              <div className="relative w-20 h-20 mb-6 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                                 <img src={URL.createObjectURL(manualProof)} className="w-full h-full object-cover" alt="Preview" />
                                 <button onClick={() => setManualProof(null)} className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full hover:bg-black/80"><X className="w-3 h-3" /></button>
                              </div>
                           )}

                           <div className="flex gap-2">
                              <button onClick={() => setIsManualModalOpen(false)} className="flex-1 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition">Cancel</button>
                              <button onClick={handleManualEntry} disabled={isUploading} className="flex-1 py-2.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm uppercase tracking-wider hover:bg-slate-800 transition disabled:opacity-50">{isUploading ? 'Uploading...' : 'Save Entry'}</button>
                           </div>
                        </motion.div>
                     </div>
                  )}
               </AnimatePresence>
            </>
         )}
      </AnimatePresence>
   );
}
