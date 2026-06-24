import React, { useState } from "react";
import { Edit, Eye, Trash2, Calendar, Phone } from "lucide-react";
import { useDispatch } from "react-redux";
import { deleteLead } from "../../../features/leads/leadSlice";
import { toast } from "react-toastify";

const STATUS_LABELS = {
  new: "New Lead",
  contacted: "Contacted",
  advance_paid: "Advance Paid",
  payment_pending: "Payment Pending",
  closed: "Closed",
  done: "Done",
};

const STATUS_COLORS = {
  new: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  contacted: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  advance_paid: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  payment_pending: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  closed: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  done: "bg-slate-500/10 text-slate-500 border-slate-500/20",
};

export default function ListView({ leads, onLeadClick }) {
  const dispatch = useDispatch();

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this lead?")) {
      try {
        await dispatch(deleteLead(id)).unwrap();
        toast.success("Lead deleted successfully");
      } catch (error) {
        toast.error("Failed to delete lead");
      }
    }
  };

  return (
    <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden h-full flex flex-col">
      <div className="overflow-x-auto flex-1">
        <table className="w-full min-w-[600px] sm:min-w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
              <th className="p-4 font-bold">Client Name</th>
              <th className="p-4 font-bold">Shoot / Event</th>
              <th className="p-4 font-bold">Status</th>
              <th className="p-4 font-bold">Source</th>
              <th className="p-4 font-bold text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-sm">
            {leads.map((lead) => (
              <tr 
                key={lead._id} 
                className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors cursor-pointer"
                onClick={() => onLeadClick(lead)}
              >
                <td className="p-4">
                  <div className="font-bold text-slate-900 dark:text-white">{lead.name}</div>
                  <div className="text-xs text-slate-500 flex items-center mt-1">
                    <Phone className="w-3 h-3 mr-1" /> {lead.phone}
                  </div>
                </td>
                <td className="p-4">
                  <div className="font-medium text-slate-700 dark:text-slate-300">{lead.shootType || "Not specified"}</div>
                  {lead.eventDate && (
                    <div className="text-xs text-slate-500 flex items-center mt-1">
                      <Calendar className="w-3 h-3 mr-1" /> {new Date(lead.eventDate).toLocaleDateString()}
                    </div>
                  )}
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${STATUS_COLORS[lead.status]}`}>
                    {STATUS_LABELS[lead.status]}
                  </span>
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-400 uppercase text-xs">
                  {lead.source?.replace('_', ' ')}
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-center space-x-3">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onLeadClick(lead); }}
                      className="text-slate-400 hover:text-cyan-500 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => handleDelete(e, lead._id)}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                      title="Delete Lead"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            
            {leads.length === 0 && (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-500">
                  No leads found. Switch to the board view to add one manually or wait for inquiries.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
