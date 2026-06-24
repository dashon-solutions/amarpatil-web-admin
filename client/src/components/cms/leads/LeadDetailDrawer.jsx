import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Phone, Mail, Calendar, Camera, Package, MessageSquare, Clock, FileText, Download, Plus } from "lucide-react";
import { useDispatch } from "react-redux";
import { updateLeadStatus } from "../../../features/leads/leadSlice";
import axiosInstance from "../../../utils/axiosInstance";
import { toast } from "react-toastify";
import QuotationForm from "./QuotationForm";
import SendQuotationDrawer from "./SendQuotationDrawer";

const STAGES = [
  { id: "new", title: "New Lead" },
  { id: "contacted", title: "Contacted" },
  { id: "quotation_sent", title: "Quotation Sent" },
  { id: "advance_paid", title: "Advance Paid" },
  { id: "shoot_done", title: "Shoot Done" },
  { id: "payment_pending", title: "Payment Pending" },
  { id: "closed", title: "Closed" },
];

export default function LeadDetailDrawer({ lead, onClose, onRequireBooking }) {
  const dispatch = useDispatch();
  const [status, setStatus] = useState(lead?.status || "new");
  const [note, setNote] = useState("");
  const [notesList, setNotesList] = useState(lead?.notes || []);
  const [submittingNote, setSubmittingNote] = useState(false);

  const [quotations, setQuotations] = useState([]);
  const [isQuotationFormOpen, setIsQuotationFormOpen] = useState(false);
  const [isSendDrawerOpen, setIsSendDrawerOpen] = useState(false);

  useEffect(() => {
    if (lead?._id) {
      axiosInstance.get(`/quotations/lead/${lead._id}`).then(({ data }) => setQuotations(data.quotations)).catch(() => { });
    }
  }, [lead]);

  if (!lead) return null;

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;

    if (newStatus === "advance_paid") {
      if (onRequireBooking) {
        onRequireBooking(lead);
      }
      return;
    }

    try {
      await dispatch(updateLeadStatus({ id: lead._id, status: newStatus })).unwrap();
      setStatus(newStatus);
      toast.success("Status updated successfully");
    } catch (err) {
      toast.error("Failed to update status");
      setStatus(lead.status); // revert on UI
    }
  };

  const handleAddNote = async () => {
    if (!note.trim()) return;
    setSubmittingNote(true);
    try {
      const { data } = await axiosInstance.post(`/leads/${lead._id}/notes`, { text: note });
      setNotesList(data.lead.notes);
      setNote("");
      toast.success("Note added");
    } catch (err) {
      toast.error("Failed to add note");
    } finally {
      setSubmittingNote(false);
    }
  };

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
            <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Lead Details
            </h2>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Action Bar: Status Update */}
            <div className="bg-cyan-500/10 border border-cyan-500/20 p-4 rounded-xl flex justify-between items-center">
              <span className="text-cyan-600 dark:text-cyan-400 font-bold text-sm uppercase tracking-wider">Current Stage</span>
              <select
                value={status}
                onChange={handleStatusChange}
                className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded px-3 py-1.5 text-sm font-medium outline-none focus:border-cyan-500"
              >
                {STAGES.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
            </div>

            {/* Client Info */}
            <section>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center">
                <User className="w-4 h-4 mr-2" /> Client Details
              </h3>
              <div className="bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3 text-sm">
                <div className="flex items-start">
                  <span className="w-24 text-slate-500 font-medium">Name</span>
                  <span className="text-slate-900 dark:text-white font-bold">{lead.name}</span>
                </div>
                <div className="flex items-start">
                  <span className="w-24 text-slate-500 font-medium">Phone</span>
                  <a href={`tel:${lead.phone}`} className="text-cyan-500 hover:underline flex items-center"><Phone className="w-3 h-3 mr-1" />{lead.phone}</a>
                </div>
                {lead.whatsapp && lead.whatsapp !== lead.phone && (
                  <div className="flex items-start">
                    <span className="w-24 text-slate-500 font-medium">WhatsApp</span>
                    <a href={`https://wa.me/${lead.whatsapp}`} target="_blank" rel="noreferrer" className="text-emerald-500 hover:underline">{lead.whatsapp}</a>
                  </div>
                )}
                {lead.email && (
                  <div className="flex items-start">
                    <span className="w-24 text-slate-500 font-medium">Email</span>
                    <a href={`mailto:${lead.email}`} className="text-cyan-500 hover:underline flex items-center"><Mail className="w-3 h-3 mr-1" />{lead.email}</a>
                  </div>
                )}
              </div>
            </section>

            {/* Event Info */}
            <section>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center">
                <Camera className="w-4 h-4 mr-2" /> Event Details
              </h3>
              <div className="bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3 text-sm">
                <div className="flex items-start">
                  <span className="w-24 text-slate-500 font-medium">Shoot Type</span>
                  <span className="text-slate-900 dark:text-white">{lead.shootType || "—"}</span>
                </div>
                <div className="flex items-start">
                  <span className="w-24 text-slate-500 font-medium">Date</span>
                  <span className="text-slate-900 dark:text-white flex items-center">
                    {lead.eventDate ? (
                      <><Calendar className="w-3 h-3 mr-2 text-emerald-500" /> {new Date(lead.eventDate).toLocaleDateString()}</>
                    ) : "—"}
                  </span>
                </div>
                {lead.package?.variantName && (
                  <div className="flex items-start mt-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <span className="w-24 text-slate-500 font-medium">Package</span>
                    <span className="text-cyan-500 font-bold bg-cyan-500/10 px-2 py-0.5 rounded flex items-center">
                      <Package className="w-3 h-3 mr-1" /> {lead.package.variantName}
                    </span>
                  </div>
                )}
              </div>
            </section>

            {/* Message from Client */}
            {lead.message && (
              <section>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center">
                  <MessageSquare className="w-4 h-4 mr-2" /> Original Message
                </h3>
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-sm text-slate-700 dark:text-slate-300 italic">
                  "{lead.message}"
                </div>
              </section>
            )}

            {/* Quotations Section */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center">
                  <FileText className="w-4 h-4 mr-2" /> Quotations
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsSendDrawerOpen(true)}
                    className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                  >
                    Send
                  </button>
                  <button
                    onClick={() => setIsQuotationFormOpen(true)}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center transition-colors shadow-sm shadow-cyan-500/20"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Create
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {quotations.map(q => (
                  <div key={q._id} className="bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex justify-between items-center group transition-colors hover:border-cyan-500/50">
                    <div className="flex-1">
                      <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center">
                        {q.quotationNumber}
                        <span className={`ml-3 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${q.status === 'sent' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30' : 'bg-slate-200 text-slate-500 dark:bg-slate-800'}`}>
                          {q.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {new Date(q.createdAt).toLocaleDateString()} • Rs. {q.total.toLocaleString()}
                      </div>
                    </div>
                    <a
                      href={`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/quotations/pdf/${q._id}?token=${localStorage.getItem('token')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-slate-400 hover:text-cyan-500 bg-white dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 rounded-full transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100 shadow-sm"
                      title="Download PDF"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                ))}
                {quotations.length === 0 && (
                  <div className="text-center p-6 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-slate-500 text-sm">
                    No quotations created yet.
                  </div>
                )}
              </div>
            </section>

            {/* Notes Section */}
            <section>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center">
                <Clock className="w-4 h-4 mr-2" /> Timeline & Notes
              </h3>

              <div className="mb-4 flex space-x-2">
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a text note..."
                  className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-3 py-2 rounded-lg text-sm outline-none focus:border-cyan-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                />
                <button
                  onClick={handleAddNote}
                  disabled={submittingNote || !note.trim()}
                  className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                >
                  Add
                </button>
              </div>

              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-800 before:to-transparent">
                {notesList.slice().reverse().map((n, idx) => (
                  <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm text-sm text-slate-700 dark:text-slate-300">
                      <div>{n.text}</div>
                      <div className="text-[10px] text-slate-400 mt-2 font-medium">
                        {new Date(n.date).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </motion.div>
      </div>

      {isQuotationFormOpen && (
        <QuotationForm
          isOpen={isQuotationFormOpen}
          onClose={() => setIsQuotationFormOpen(false)}
          lead={lead}
          onQuotationCreated={(quotation) => {
            setQuotations([quotation, ...quotations]);
          }}
        />
      )}

      {isSendDrawerOpen && (
        <SendQuotationDrawer
          isOpen={isSendDrawerOpen}
          onClose={() => setIsSendDrawerOpen(false)}
          lead={lead}
          quotations={quotations}
          onStatusUpdate={(id, newStatus) => {
            setQuotations(quotations.map(q => q._id === id ? { ...q, status: newStatus } : q));
          }}
        />
      )}
    </AnimatePresence>
  );
}
