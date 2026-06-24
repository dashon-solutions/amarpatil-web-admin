import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Wallet, CheckCircle, Clock, Plus, User, FileText, Smartphone, Download, CheckSquare, ListTodo } from "lucide-react";
import axiosInstance from "../../../utils/axiosInstance";
import { toast } from "react-toastify";

export default function BookingDetailDrawer({ booking, onClose }) {
  const [tasks, setTasks] = useState([]);
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);

  // Create task state
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDate, setTaskDate] = useState("");

  // Create payment state
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("UPI");
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);

  useEffect(() => {
    if (booking?._id) {
      fetchBookingDetails();
    }
  }, [booking]);

  const fetchBookingDetails = async () => {
    try {
      const [tRes, pRes, iRes] = await Promise.all([
        axiosInstance.get(`/tasks?bookingId=${booking._id}`),
        axiosInstance.get(`/payments/${booking._id}`),
        axiosInstance.get(`/payments/invoices/${booking._id}`)
      ]);
      setTasks(tRes.data.tasks);
      setPayments(pRes.data.payments);
      setInvoices(iRes.data.invoices);
    } catch (error) {
      toast.error("Failed to load booking details");
    }
  };

  if (!booking) return null;

  const handleAddTask = async () => {
    if (!taskTitle || !taskDate) return toast.error("Please provide title and date for the task");
    try {
      await axiosInstance.post('/tasks', { title: taskTitle, date: taskDate, bookingId: booking._id });
      setTaskTitle("");
      setTaskDate("");
      fetchBookingDetails();
      toast.success("Task added");
    } catch (e) {
      toast.error("Failed to add task");
    }
  };

  const handleToggleTaskStatus = async (taskId, currentStatus) => {
    const newStatus = currentStatus === "pending" ? "completed" : "pending";
    try {
      await axiosInstance.put(`/tasks/${taskId}`, { status: newStatus });
      fetchBookingDetails();
    } catch (e) {
      toast.error("Failed to update task");
    }
  };

  const handleAddPayment = async () => {
    if (!amount || amount <= 0) return toast.error("Please enter a valid amount");
    setIsPaymentLoading(true);
    try {
      await axiosInstance.post(`/payments/${booking._id}`, { amount, method });
      setAmount("");
      fetchBookingDetails(); // Refreshes payments, invoices and updates remaining balance visual
      toast.success("Payment recorded and invoice generated successfully!");
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to add payment");
    } finally {
      setIsPaymentLoading(false);
    }
  };

  const remainingBalance = booking.totalAmount - payments.reduce((acc, p) => acc + p.amount, 0);
  const totalPaid = payments.reduce((acc, p) => acc + p.amount, 0);
  const progressPercent = Math.min(100, Math.round((totalPaid / booking.totalAmount) * 100));

  return (
    <AnimatePresence>
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
          {/* Header */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Booking Manager
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1">{booking.clientName}</p>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

            {/* Tasks Section */}
            <section>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center">
                <ListTodo className="w-4 h-4 mr-2" /> Task Management
              </h3>

              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Task title..."
                  className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-3 py-2 rounded-lg text-sm outline-none focus:border-cyan-500"
                />
                <input
                  type="date"
                  value={taskDate}
                  onChange={(e) => setTaskDate(e.target.value)}
                  className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-3 py-2 rounded-lg text-sm outline-none focus:border-cyan-500 w-36"
                />
                <button
                  onClick={handleAddTask}
                  className="bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                {tasks.map(t => (
                  <div key={t._id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 px-4 py-3 rounded-xl hover:border-cyan-500/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <button onClick={() => handleToggleTaskStatus(t._id, t.status)} className={`${t.status === 'completed' ? 'text-emerald-500' : 'text-slate-400 hover:text-cyan-500'} transition-colors`}>
                        <CheckSquare className="w-5 h-5" />
                      </button>
                      <div>
                        <p className={`text-sm font-bold ${t.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-900 dark:text-slate-100'}`}>{t.title}</p>
                        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{new Date(t.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {tasks.length === 0 && <p className="text-xs text-slate-500 italic text-center p-4">No tasks assigned.</p>}
              </div>
            </section>

            {/* Payment & Invoices Section */}
            <section className="pt-6 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center">
                <Wallet className="w-4 h-4 mr-2" /> Financials
              </h3>

              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl mb-6">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Paid: ₹{totalPaid.toLocaleString()}</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white">Due: ₹{(remainingBalance > 0 ? remainingBalance : 0).toLocaleString()}</p>
                  </div>
                  <div className="text-cyan-500 font-bold text-sm bg-cyan-500/10 px-2 py-0.5 rounded">{progressPercent}%</div>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div className={`h-full ${progressPercent === 100 ? 'bg-emerald-500' : 'bg-cyan-500'} transition-all`} style={{ width: `${progressPercent}%` }}></div>
                </div>
              </div>

              {remainingBalance > 0 && (
                <div className="bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 p-4 rounded-xl mb-6 flex flex-col gap-3">
                  <h4 className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-1">Add Payment</h4>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Amount..."
                      className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-3 py-2 rounded-lg text-sm outline-none focus:border-cyan-500"
                    />
                    <select
                      value={method}
                      onChange={(e) => setMethod(e.target.value)}
                      className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-3 py-2 rounded-lg text-sm outline-none focus:border-cyan-500"
                    >
                      <option value="UPI">UPI</option>
                      <option value="Cash">Cash</option>
                      <option value="Bank">Bank</option>
                    </select>
                  </div>
                  <button
                    onClick={handleAddPayment}
                    disabled={isPaymentLoading}
                    className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider shadow-sm transition hover:bg-slate-800 dark:hover:bg-slate-200 disabled:opacity-50"
                  >
                    {isPaymentLoading ? 'Recording...' : 'Record Payment & Auto-Invoice'}
                  </button>
                </div>
              )}

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2 mb-2">Invoice Timeline</h4>
                {invoices.map(inv => (
                  <div key={inv._id} className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-sm flex items-center">
                          {inv.invoiceNumber}
                          <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                            {inv.type}
                          </span>
                        </p>
                        <p className="text-xs text-slate-500 font-medium mt-1 uppercase">₹{inv.amount.toLocaleString()} on {new Date(inv.date).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-2">
                      {inv.pdfUrl && (
                        <>
                          <a href={inv.pdfUrl} target="_blank" rel="noreferrer" className="flex-1 flex justify-center items-center py-2 bg-slate-100 dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 text-slate-700 dark:text-slate-300 hover:text-cyan-600 text-xs font-bold uppercase tracking-wider rounded transition-colors group-hover:border-cyan-500/30">
                            <Download className="w-3.5 h-3.5 mr-1" /> PDF
                          </a>
                          <button
                            onClick={() => {
                              const msg = `Hello ${booking.clientName},%0A%0AYour payment invoice (${inv.type}) is ready.%0AAmount: Rs. ${inv.amount}%0A%0ADownload here:%0A${inv.pdfUrl}%0A%0A- Our Studio`;
                              window.open(`https://wa.me/?text=${msg}`, '_blank');
                            }}
                            className="flex-1 flex justify-center items-center py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20 text-xs font-bold uppercase tracking-wider rounded transition-colors">
                            <Smartphone className="w-3.5 h-3.5 mr-1" /> Send
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {invoices.length === 0 && <p className="text-xs text-slate-500 italic text-center p-4">No payments recorded yet.</p>}
              </div>

            </section>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
