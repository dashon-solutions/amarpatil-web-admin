import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Plus, Trash2 } from "lucide-react";
import axiosInstance from "../../../utils/axiosInstance";
import { toast } from "react-toastify";

export default function QuotationForm({ isOpen, onClose, lead, onQuotationCreated }) {
  const [items, setItems] = useState([{ title: "", price: "" }]);
  const [gstEnabled, setGstEnabled] = useState(false);
  const [status, setStatus] = useState("idle");
  const [terms, setTerms] = useState("");

  const [availableScopes, setAvailableScopes] = useState([]);
  const [availableDeliverables, setAvailableDeliverables] = useState([]);
  const [availableTimelines, setAvailableTimelines] = useState([]);

  const [selectedScopes, setSelectedScopes] = useState([]);
  const [selectedDeliverables, setSelectedDeliverables] = useState([]);
  const [selectedTimelines, setSelectedTimelines] = useState([]);

  useEffect(() => {
    if (isOpen) {
      axiosInstance.get("/cms/site-settings")
        .then(({ data }) => {
          if (data) {
            if (data.termsAndConditions) {
              setTerms(data.termsAndConditions.join("\n"));
            }
            if (data.defaultScopeOfServices) {
              setAvailableScopes(data.defaultScopeOfServices);
              setSelectedScopes(data.defaultScopeOfServices);
            }
            if (data.defaultDeliverables) {
              setAvailableDeliverables(data.defaultDeliverables);
              setSelectedDeliverables(data.defaultDeliverables);
            }
            if (data.defaultTimelines) {
              setAvailableTimelines(data.defaultTimelines);
              setSelectedTimelines(data.defaultTimelines);
            }
          }
        })
        .catch(err => {
          console.error("Failed to load default settings: ", err);
        });
    }
  }, [isOpen]);

  const handleToggleScope = (scope) => {
    setSelectedScopes(prev =>
      prev.includes(scope) ? prev.filter(s => s !== scope) : [...prev, scope]
    );
  };

  const handleToggleDeliverable = (deliv) => {
    setSelectedDeliverables(prev =>
      prev.includes(deliv) ? prev.filter(d => d !== deliv) : [...prev, deliv]
    );
  };

  const handleToggleTimeline = (timeItem) => {
    setSelectedTimelines(prev =>
      prev.some(t => t.label === timeItem.label)
        ? prev.filter(t => t.label !== timeItem.label)
        : [...prev, timeItem]
    );
  };

  const subtotal = items.reduce((acc, item) => acc + (parseFloat(item.price) || 0), 0);
  const gstAmount = gstEnabled ? subtotal * 0.18 : 0;
  const total = subtotal + gstAmount;

  const handleAddItem = () => {
    setItems([...items, { title: "", price: "" }]);
  };

  const handleRemoveItem = (index) => {
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.some(i => !i.title || !i.price)) {
      return toast.error("All items must have a name and price");
    }

    setStatus("sending");
    try {
      const payload = {
        leadId: lead._id,
        items: items.map(i => ({ title: i.title, price: parseFloat(i.price) })),
        gstEnabled,
        terms,
        scopeOfServices: selectedScopes,
        deliverables: selectedDeliverables,
        timeline: selectedTimelines,
      };

      const res = await axiosInstance.post("/quotations", payload);
      toast.success("Quotation generated successfully!");
      setStatus("success");

      onQuotationCreated(res.data.quotation);
      setTimeout(() => {
        onClose();
        setStatus("idle");
        setItems([{ title: "", price: "" }]);
        setGstEnabled(false);
      }, 1500);
    } catch (error) {
      setStatus("idle");
      toast.error("Failed to generate quotation.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-center items-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          ></motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-xl flex flex-col max-h-[90vh] overflow-hidden"
          >
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Create Quotation
              </h2>
              <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-6 bg-slate-100 dark:bg-slate-900 p-4 rounded-lg">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Billing To</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{lead.name}</p>
                <p className="text-slate-500 font-medium text-sm">{lead.phone}</p>
              </div>

              <form id="quotation-form" onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2 mb-4 uppercase tracking-wider">
                    Line Items
                  </h3>

                  {items.map((item, index) => (
                    <div key={index} className="flex gap-4 mb-4 items-start">
                      <div className="flex-1">
                        <input
                          required
                          type="text"
                          placeholder="Item Name (e.g. Pre-Wedding Shoot)"
                          value={item.title}
                          onChange={(e) => handleItemChange(index, 'title', e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-3 py-2 rounded-lg text-sm outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div className="w-32">
                        <input
                          required
                          type="number"
                          placeholder="Amount"
                          min="0"
                          value={item.price}
                          onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-3 py-2 rounded-lg text-sm outline-none focus:border-cyan-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        disabled={items.length === 1}
                        className="p-2 text-slate-400 hover:text-red-500 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors mt-0.5"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center text-cyan-600 dark:text-cyan-400 font-bold text-sm tracking-wide hover:underline mt-2"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add Another Item
                  </button>
                </div>

                {/* Scope & Deliverables Selection */}
                {(availableScopes.length > 0 || availableDeliverables.length > 0 || availableTimelines.length > 0) && (
                  <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2 mb-4 uppercase tracking-wider">
                      Scope of Services &amp; Deliverables
                    </h3>
                    <p className="text-xs text-slate-500 mb-4">Check the items you want to include in this quotation PDF.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Scope list */}
                      {availableScopes.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-3">Scope of Services</h4>
                          <div className="space-y-2 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 max-h-48 overflow-y-auto">
                            {availableScopes.map((scope, idx) => (
                              <label key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200">
                                <input
                                  type="checkbox"
                                  checked={selectedScopes.includes(scope)}
                                  onChange={() => handleToggleScope(scope)}
                                  className="mt-0.5 rounded text-cyan-600 focus:ring-cyan-500 border-slate-300 dark:border-slate-700"
                                />
                                <span>{scope}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Deliverables list */}
                      {availableDeliverables.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-3">Deliverables</h4>
                          <div className="space-y-2 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 max-h-48 overflow-y-auto">
                            {availableDeliverables.map((deliv, idx) => (
                              <label key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200">
                                <input
                                  type="checkbox"
                                  checked={selectedDeliverables.includes(deliv)}
                                  onChange={() => handleToggleDeliverable(deliv)}
                                  className="mt-0.5 rounded text-cyan-600 focus:ring-cyan-500 border-slate-300 dark:border-slate-700"
                                />
                                <span>{deliv}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Timelines list */}
                      {availableTimelines.length > 0 && (
                        <div className="md:col-span-2">
                          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-3">Timeline Specifications</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 max-h-48 overflow-y-auto">
                            {availableTimelines.map((time, idx) => (
                              <label key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200">
                                <input
                                  type="checkbox"
                                  checked={selectedTimelines.some(t => t.label === time.label)}
                                  onChange={() => handleToggleTimeline(time)}
                                  className="mt-0.5 rounded text-cyan-600 focus:ring-cyan-500 border-slate-300 dark:border-slate-700"
                                />
                                <div>
                                  <strong className="text-slate-700 dark:text-slate-300">{time.label}:</strong>{" "}
                                  <span>{time.value}</span>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="border-t border-slate-200 dark:border-slate-800 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Terms &amp; Conditions (One per line)</label>
                    <textarea
                      rows={5}
                      value={terms}
                      onChange={(e) => setTerms(e.target.value)}
                      placeholder="Enter terms and conditions (one per line)..."
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-3 py-2 rounded-lg text-sm outline-none focus:border-cyan-500 resize-none"
                    ></textarea>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-end">
                      <label className="flex items-center cursor-pointer">
                        <div className="relative">
                          <input type="checkbox" className="sr-only" checked={gstEnabled} onChange={() => setGstEnabled(!gstEnabled)} />
                          <div className={`block w-10 h-6 rounded-full transition-colors ${gstEnabled ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
                          <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${gstEnabled ? 'transform translate-x-4' : ''}`}></div>
                        </div>
                        <span className="ml-3 font-bold text-sm text-slate-700 dark:text-slate-300 uppercase tracking-widest">Include 18% GST</span>
                      </label>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-5 w-full space-y-3">
                      <div className="flex justify-between text-slate-500">
                        <span>Subtotal</span>
                        <span className="font-medium text-slate-900 dark:text-white">Rs. {subtotal.toFixed(2)}</span>
                      </div>
                      {gstEnabled && (
                        <div className="flex justify-between text-slate-500 border-b border-slate-200 dark:border-slate-800 pb-3">
                          <span>GST (18%)</span>
                          <span className="font-medium text-slate-900 dark:text-white">Rs. {gstAmount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className={`flex justify-between font-black text-lg ${!gstEnabled && 'border-t border-slate-200 dark:border-slate-800 pt-3'}`}>
                        <span className="text-slate-900 dark:text-white">Total</span>
                        <span className="text-cyan-500">Rs. {total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

              </form>
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <button
                form="quotation-form"
                type="submit"
                disabled={status === "sending" || status === "success"}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold uppercase tracking-widest py-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50"
              >
                {status === "idle" ? <><Send className="w-5 h-5" /> Generate PDF Quotation</> : status === "sending" ? "Processing..." : "Quotation Saved!"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
