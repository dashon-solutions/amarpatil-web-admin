import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, MapPin, IndianRupee, FileText, CheckCircle, Trash2, Camera, User, Wallet, UserCheck, Smartphone, Download, UserPlus, Users } from "lucide-react";
import dayjs from "dayjs";
import axiosInstance from "../../../utils/axiosInstance";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import AssignTeamModal from "../bookings/AssignTeamModal";

export default function EventDetailDrawer({ isOpen, onClose, event, onUpdate }) {
  const navigate = useNavigate();

  // Booking details state
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // Payment form state
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("UPI");
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);

  useEffect(() => {
    if (isOpen && event && event.type === "booking") {
      fetchBookingDetails();
    }
  }, [isOpen, event]);

  const fetchBookingDetails = async () => {
    try {
      const [pRes, iRes, aRes] = await Promise.all([
        axiosInstance.get(`/payments/${event._id}`),
        axiosInstance.get(`/payments/invoices/${event._id}`),
        axiosInstance.get(`/assignments/booking/${event._id}`)
      ]);
      setPayments(pRes.data.payments || []);
      setInvoices(iRes.data.invoices || []);
      setAssignments(aRes.data.assignments || []);
    } catch (error) {
      toast.error("Failed to load full booking details");
    }
  };

  if (!event) return null;

  const isBooking = event.type === "booking";

  // Task Handlers
  const handleMarkComplete = async () => {
    try {
      await axiosInstance.put(`/tasks/${event._id}`, { status: "completed" });
      toast.success("Task marked as complete");
      onUpdate();
      onClose();
    } catch (error) {
      toast.error("Failed to update task");
    }
  };

  const handleDeleteTask = async () => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await axiosInstance.delete(`/tasks/${event._id}`);
      toast.success("Task deleted");
      onUpdate();
      onClose();
    } catch (error) {
      toast.error("Failed to delete task");
    }
  };

  const handleAddPayment = async () => {
    if (!amount || amount <= 0) return toast.error("Please enter a valid amount");
    setIsPaymentLoading(true);
    try {
      await axiosInstance.post(`/payments/${event._id}`, { amount, method });
      setAmount("");
      fetchBookingDetails();
      toast.success("Payment recorded and invoice generated successfully!");
      onUpdate(); // refresh calendar if needed
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to add payment");
    } finally {
      setIsPaymentLoading(false);
    }
  };

  const remainingBalance = isBooking ? event.totalAmount - payments.reduce((acc, p) => acc + p.amount, 0) : 0;
  const totalPaid = isBooking ? payments.reduce((acc, p) => acc + p.amount, 0) : 0;
  const progressPercent = isBooking ? Math.min(100, Math.round((totalPaid / event.totalAmount) * 100)) : 0;

  const drawerVariants = {
    closed: { x: "100%", transition: { type: "tween", duration: 0.3 } },
    open: { x: 0, transition: { type: "tween", duration: 0.3, ease: "easeOut" } },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            variants={drawerVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col border-l border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                {isBooking ? <Camera className="text-blue-500" /> : <CheckCircle className={event.status === 'completed' ? 'text-slate-400' : 'text-emerald-500'} />}
                {isBooking ? "Booking Details" : "Task Details"}
              </h2>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-200 dark:bg-slate-800 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {isBooking ? (
                // Booking Detail Section
                <div className="space-y-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                    <h3 className="text-2xl font-black text-blue-900 dark:text-blue-100 mb-1">{event.clientName || event.title}</h3>
                    <p className="text-blue-700 dark:text-blue-300 font-medium">{event.shootType}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center text-slate-600 dark:text-slate-300">
                      <Calendar className="w-5 h-5 mr-3 text-slate-400" />
                      <span className="font-medium">{dayjs(event.start).format("DD MMMM YYYY")}</span>
                    </div>
                    <div className="flex items-center text-slate-600 dark:text-slate-300">
                      <Clock className="w-5 h-5 mr-3 text-slate-400" />
                      <span className="font-medium">{event.time || "10:00 AM"}</span>
                    </div>
                  </div>

                  {/* Assignments Section */}
                  <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center">
                        <Users className="w-4 h-4 mr-2" /> Assigned Team
                      </h3>
                      <button onClick={() => setIsAssignModalOpen(true)} className="text-xs font-bold bg-cyan-100 text-cyan-600 dark:bg-cyan-900/40 dark:text-cyan-400 px-2 py-1 rounded flex items-center hover:bg-cyan-200 transition-colors">
                        <UserPlus className="w-3 h-3 mr-1" /> Assign Staff
                      </button>
                    </div>
                    <div className="space-y-2">
                      {assignments.map(a => (
                        <div key={a._id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 dark:border-slate-700 shrink-0 flex items-center justify-center font-bold text-xs uppercase">
                            <img src={a.teamMemberId?.photo} alt={a.teamMemberId?.name} />
                          </div>

                          <div className="flex-1">
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{a.teamMemberId?.name || 'Unknown'}</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider">{a.teamMemberId?.phone}</p>
                          </div>
                        </div>
                      ))}
                      {assignments.length === 0 && <p className="text-xs text-slate-500 italic">No team assigned yet.</p>}
                    </div>
                  </div>

                  {/* Financials Section */}
                  <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
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
                          {isPaymentLoading ? 'Recording...' : 'Record Payment'}
                        </button>
                      </div>
                    )}

                    <div className="space-y-4">
                      {invoices.map(inv => (
                        <div key={inv._id} className="p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-sm relative overflow-hidden group">
                          <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>
                          <div className="flex justify-between items-start mb-2 ml-1">
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white text-sm flex items-center">
                                {inv.invoiceNumber}
                              </p>
                              <p className="text-xs text-slate-500 font-medium mt-1 uppercase">₹{inv.amount.toLocaleString()} on {new Date(inv.date).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {inv.pdfUrl && (
                              <a href={inv.pdfUrl} target="_blank" rel="noreferrer" className="flex-1 flex justify-center items-center py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 text-slate-700 dark:text-slate-300 hover:text-cyan-600 text-xs font-bold uppercase tracking-wider rounded transition-colors group-hover:border-cyan-500/30">
                                <Download className="w-3.5 h-3.5 mr-1" /> PDF
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                // Task Detail Section
                <div className="space-y-6">
                  <div className={`${event.status === 'completed' ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700' : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/30'} p-5 rounded-2xl border`}>
                    <h3 className={`text-2xl font-black ${event.status === 'completed' ? 'text-slate-500 dark:text-slate-400 line-through' : 'text-emerald-900 dark:text-emerald-100'} mb-1`}>{event.title}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider ${event.status === 'completed' ? 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300' : 'bg-emerald-200 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200'}`}>
                        {event.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center text-slate-600 dark:text-slate-300">
                      <Calendar className="w-5 h-5 mr-3 text-slate-400" />
                      <span className="font-medium">{dayjs(event.start).format("DD MMMM YYYY")}</span>
                    </div>
                    <div className="flex items-center text-slate-600 dark:text-slate-300">
                      <Clock className="w-5 h-5 mr-3 text-slate-400" />
                      <span className="font-medium">{event.time}</span>
                    </div>
                    <div className="flex items-center text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                      <User className="w-5 h-5 mr-3 text-cyan-500" />
                      <div>
                        <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Assigned To</p>
                        <span className="font-medium">{event.assignedTo || "Unassigned"}</span>
                      </div>
                    </div>
                    {event.notes && (
                      <div className="flex items-start text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                        <FileText className="w-5 h-5 mr-3 text-slate-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Notes</p>
                          <p className="font-medium text-sm mt-1 whitespace-pre-wrap">{event.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-wider">Quick Actions</h4>
                    <div className="flex flex-col gap-3">
                      {event.status !== 'completed' && (
                        <button onClick={handleMarkComplete} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 mr-2" /> Mark Complete
                        </button>
                      )}
                      <button onClick={handleDeleteTask} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-red-500 hover:text-red-600 text-slate-700 dark:text-slate-300 font-medium py-2.5 rounded-xl transition-all flex items-center justify-center">
                        <Trash2 className="w-4 h-4 mr-2" /> Delete Task
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}

      {/* Render Assign Team Modal natively over the drawer if needed */}
      <AssignTeamModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        booking={event}
        onAssignFinished={fetchBookingDetails}
      />
    </AnimatePresence>
  );
}
