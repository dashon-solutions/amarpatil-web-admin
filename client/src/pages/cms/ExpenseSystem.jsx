import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Image as ImageIcon, Receipt, Building, Briefcase, Plane, Coffee, CreditCard, Eye, X, Upload, Calendar, Wallet } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";

const CATEGORY_ICONS = {
   "Utility": Building,
   "Office": Coffee,
   "Equipment": Briefcase,
   "Travel": Plane,
   "Vendor": CreditCard,
   "Other": Receipt
};

const ExpenseSystem = () => {
   const [expenses, setExpenses] = useState([]);
   const [stats, setStats] = useState({ totalAllTime: 0, totalThisMonth: 0 });
   const [loading, setLoading] = useState(true);

   // Modal State
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [formData, setFormData] = useState({ title: "", description: "", amount: "", category: "Utility" });
   const [receiptImage, setReceiptImage] = useState(null);
   const [isUploading, setIsUploading] = useState(false);

   useEffect(() => {
      fetchExpenses();
   }, []);

   const fetchExpenses = async () => {
      setLoading(true);
      try {
         const { data } = await axiosInstance.get("/expense");
         if (data.success) {
            setExpenses(data.expenses);
            setStats({ totalAllTime: data.totalAllTime, totalThisMonth: data.totalThisMonth });
         }
      } catch (error) {
         toast.error("Failed to fetch expenses");
      } finally {
         setLoading(false);
      }
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      if (!formData.title || !formData.amount) {
         return toast.warning("Title and Amount are required.");
      }

      setIsUploading(true);
      try {
         const payload = new FormData();
         payload.append("title", formData.title);
         payload.append("description", formData.description);
         payload.append("amount", formData.amount);
         payload.append("category", formData.category);
         if (receiptImage) {
            payload.append("receipt", receiptImage);
         }

         await axiosInstance.post("/expense", payload, {
            headers: { "Content-Type": "multipart/form-data" }
         });

         toast.success("Expense registered successfully!");
         setIsModalOpen(false);
         setFormData({ title: "", description: "", amount: "", category: "Utility" });
         setReceiptImage(null);
         fetchExpenses();
      } catch (error) {
         toast.error("Error creating expense.");
      } finally {
         setIsUploading(false);
      }
   };

   const handleDelete = async (id) => {
      if (!window.confirm("Are you sure you want to delete this expense?")) return;
      try {
         await axiosInstance.delete(`/expense/${id}`);
         toast.success("Expense deleted");
         fetchExpenses();
      } catch (error) {
         toast.error("Failed to delete expense");
      }
   };

   return (
      <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto min-h-screen">
         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
               <h1 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Business Expenses</h1>
               <p className="text-sm text-slate-500 mt-1 dark:text-slate-400">Track and manage studio utilities, gear maintenance, and office costs.</p>
            </div>
            <button
               onClick={() => setIsModalOpen(true)}
               className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm hover:shadow transition-all active:scale-95"
            >
               <Plus className="w-5 h-5" />
               Record Expense
            </button>
         </div>

         {/* Analytics Summary */}
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
            <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-center">
               <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Calendar className="w-4 h-4" /> This Month's Expenses</span>
               <h2 className="text-4xl font-black text-slate-900 dark:text-white">₹{stats.totalThisMonth.toLocaleString()}</h2>
            </div>
            <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-center">
               <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Wallet className="w-4 h-4" /> All Time Overhead</span>
               <h2 className="text-4xl font-black text-slate-900 dark:text-white">₹{stats.totalAllTime.toLocaleString()}</h2>
            </div>
         </div>

         {loading ? (
            <div className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest animate-pulse">Loading Expenses...</div>
         ) : expenses.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
               <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-4" />
               <h3 className="text-lg font-bold text-slate-900 dark:text-white">No expenses recorded</h3>
               <p className="text-slate-500 text-sm mt-1">Start tracking your business overheads by clicking the button above.</p>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
               {expenses.map((expense) => {
                  const Icon = CATEGORY_ICONS[expense.category] || Receipt;
                  return (
                     <div key={expense._id} className="relative flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-all group overflow-hidden pl-[4px]">
                        {/* Color Bar Accent */}
                        <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-emerald-500 rounded-l-2xl"></div>

                        <div className="p-5 flex flex-col gap-4">
                           {/* Premium Prominent Image Header */}
                           {expense.receiptImage && (
                              <a href={expense.receiptImage} target="_blank" rel="noreferrer" className="block relative w-full h-48 sm:h-56 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                                 <img src={expense.receiptImage} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Receipt Proof" />
                                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col justify-center items-center transition backdrop-blur-[2px]">
                                    <Eye className="w-6 h-6 text-white mb-2" />
                                    <span className="text-[10px] uppercase font-bold text-white tracking-widest">View Full Receipt</span>
                                 </div>
                              </a>
                           )}

                           <div className="flex-1 min-w-0 flex flex-col justify-between">
                              <div className="flex justify-between items-start mb-2 gap-3">
                                 <div className="min-w-0">
                                    <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-[9px] font-bold uppercase tracking-widest shadow-sm mb-2 shrink-0">
                                       <Icon className="w-3 h-3" /> {expense.category}
                                    </span>
                                    <h4 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">{expense.title}</h4>
                                 </div>
                                 <span className="text-xl font-black text-emerald-500 tracking-tight shrink-0">₹{expense.amount.toLocaleString()}</span>
                              </div>

                              {expense.description && <p className="text-xs text-slate-500 italic mb-4 leading-snug break-words">"{expense.description}"</p>}

                              <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800 mt-auto">
                                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(expense.createdAt).toLocaleDateString()}</p>
                                 <button onClick={() => handleDelete(expense._id)} className="p-1.5 text-slate-400 hover:text-red-500 bg-slate-50 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition disabled:opacity-50">
                                    <Trash2 className="w-4 h-4" />
                                 </button>
                              </div>
                           </div>
                        </div>
                     </div>
                  )
               })}
            </div>
         )}

         {/* Modal Overlay */}
         <AnimatePresence>
            {isModalOpen && (
               <div className="fixed inset-0 z-50 flex justify-end">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />

                  <motion.div
                     initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: "tween", duration: 0.3 }}
                     className="relative w-[95%] sm:w-full sm:max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800"
                  >
                     <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                        <h3 className="font-black text-xl text-slate-900 dark:text-white uppercase tracking-tight">Record Expense</h3>
                        <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-100 dark:bg-slate-800 rounded-full transition-colors"><X className="w-4 h-4" /></button>
                     </div>

                     <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
                        <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Expense Title *</label>
                           <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Electricity Bill" className="w-full bg-slate-50 dark:bg-slate-950 dark:text-white border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl outline-none focus:border-emerald-500 transition-colors" />
                        </div>

                        <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Amount (₹) *</label>
                           <input type="number" required value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} placeholder="0" className="w-full bg-slate-50 dark:bg-slate-950 dark:text-white border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl outline-none focus:border-emerald-500 transition-colors text-lg font-bold" />
                        </div>

                        <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Category</label>
                           <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 dark:text-white border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl outline-none focus:border-emerald-500 transition-colors cursor-pointer">
                              {Object.keys(CATEGORY_ICONS).map(cat => (
                                 <option key={cat} value={cat}>{cat}</option>
                              ))}
                           </select>
                        </div>

                        <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Notes / Description</label>
                           <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Any additional details..." className="w-full bg-slate-50 dark:bg-slate-950 dark:text-white border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl outline-none focus:border-emerald-500 transition-colors resize-none h-24" />
                        </div>

                        <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Receipt Attachment</label>
                           <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition">
                              <Upload className="w-6 h-6 text-slate-400 mb-2" />
                              <span className="text-xs font-bold text-slate-500">Click to upload receipt image</span>
                              <input type="file" accept="image/*" className="hidden" onChange={e => setReceiptImage(e.target.files[0])} />
                           </label>
                        </div>

                        {receiptImage && (
                           <div className="relative w-full h-40 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                              <img src={URL.createObjectURL(receiptImage)} className="w-full h-full object-cover" alt="Preview" />
                              <button type="button" onClick={() => setReceiptImage(null)} className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-black/80 backdrop-blur-sm transition"><X className="w-4 h-4" /></button>
                           </div>
                        )}

                     </form>
                     <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                        <button onClick={handleSubmit} disabled={isUploading} className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-sm shadow flex justify-center items-center gap-2 transition disabled:opacity-50">
                           {isUploading ? "Uploading..." : "Save Expense"}
                        </button>
                     </div>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>
      </div>
   );
};

export default ExpenseSystem;
