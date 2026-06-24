import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, CheckSquare, Mail, MessageCircle, Copy, CheckCircle, Disc, ExternalLink, Brush, UserCheck, Activity
} from "lucide-react";
import axiosInstance from "../../../utils/axiosInstance";
import { toast } from "react-toastify";
import AssignDesignerModal from "./AssignDesignerModal";

const ALBUM_STATUSES = [
  "created",
  "sent_for_selection",
  "selection_done",
  "design_assigned",
  "design_completed",
  "printing",
  "delivered"
];

const STATUS_LABELS = {
  created: "Created",
  sent_for_selection: "Sent to Client",
  selection_done: "Selection Received",
  design_assigned: "Design Assigned",
  design_completed: "Design Done",
  printing: "Printing",
  delivered: "Delivered"
};

export default function AlbumDetailDrawer({ isOpen, onClose, album, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [team, setTeam] = useState([]);
  const [assignedDesigner, setAssignedDesigner] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchTeam();
      setAssignedDesigner(album?.assignedDesigner?._id || "");
    }
  }, [isOpen, album]);

  const fetchTeam = async () => {
    try {
      const { data } = await axiosInstance.get("/team");
      setTeam(data.team || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setLoading(true);
      await axiosInstance.put(`/albums/${album._id}`, { status: newStatus });
      toast.success("Status advanced.");
      onUpdate();
    } catch (e) {
      toast.error("Failed to advance status");
    } finally {
      setLoading(false);
    }
  };

  const handleDesignerAssignment = async (designerObjId, designerAmount) => {
    try {
      setLoading(true);
      const payload = { assignedDesigner: designerObjId };
      if (designerAmount) payload.assignedDesignerAmount = designerAmount;
      await axiosInstance.put(`/albums/${album._id}`, payload);
      toast.success("Designer mapping updated!");
      setAssignedDesigner(designerObjId);
      setIsAssignModalOpen(false);
      onUpdate();
    } catch (err) {
      toast.error("Failed to assign designer.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, type = "Link") => {
    navigator.clipboard.writeText(text);
    if (type === "Link") {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      toast.success("Message copied to clipboard!");
    }
  };

  const sendWhatsApp = () => {
    const encoded = encodeURI(whatsappTemplate);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  if (!isOpen || !album) return null;

  const currentIndex = ALBUM_STATUSES.indexOf(album.status);

  let whatsappTemplate = "";
  if (album.deliveryMethod === 'physical') {
    whatsappTemplate = `Hello ${album.clientName},\n\nYour album photos are finalized! 📸\n\nYour premium Pen Drive is ready for pickup/delivery. Please contact the studio so we can coordinate your physical delivery.\n\nThank you!`;
  } else {
    whatsappTemplate = `Hello ${album.clientName},\n\nYour photos are ready for selection! 📸\n\nPlease open the secure Google Drive link below and select your favorite photos for your album.\n\n🔗 ${album.driveLink}\n\nInstructions:\n1. Open the Drive link.\n2. Note down the image numbers or take screenshots.\n3. Reply to us with your final selections.\n\nThank you!`;
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />

        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", bounce: 0, duration: 0.4 }}
          className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{album.clientName}</h2>
              <p className="text-xs text-slate-500 font-medium">Mapped Drive • {STATUS_LABELS[album.status]}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

            {/* Drive Link Card / Physical Badge */}
            {album.deliveryMethod === 'physical' ? (
              <div className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-xl border border-orange-100 dark:border-orange-900/30">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <FileDigit className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-orange-800 dark:text-orange-300">Physical Delivery Active</h3>
                  </div>
                  <span className="text-xs bg-orange-200 text-orange-800 dark:bg-orange-800 px-2 py-1 rounded font-bold uppercase">PEN DRIVE</span>
                </div>
                <p className="text-xs text-orange-700 dark:text-orange-400 mt-2">This album workflow is tracked physically. File links are bypassed.</p>
              </div>
            ) : (
              <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                <div className="flex items-center gap-2 mb-2">
                  <Disc className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300">Google Drive Origin</h3>
                </div>
                <div className="flex items-center gap-2">
                  <input readOnly value={album.driveLink} className="flex-1 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800/50 rounded-lg px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 outline-none truncate" />
                  <button onClick={() => window.open(album.driveLink, '_blank')} className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition" title="Open Link">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button onClick={() => copyToClipboard(album.driveLink)} className="p-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 rounded-lg transition" title="Copy Link">
                    {copiedLink ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Workflow Tracker */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2"><CheckSquare className="w-4 h-4" /> Album Pipeline</h3>
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-800 before:to-transparent">
                {ALBUM_STATUSES.map((status, index) => {
                  const isCompleted = index <= currentIndex;
                  const isActive = index === currentIndex;
                  return (
                    <div key={status} className="relative flex items-center align-middle justify-between md:justify-normal md:odd:flex-row-reverse group select-none">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-slate-900 shrink-0 mx-auto bg-slate-100 dark:bg-slate-800 relative z-10 transition-colors">
                        {isCompleted && <div className="w-3 h-3 bg-cyan-500 rounded-full" />}
                      </div>
                      <div onClick={() => handleStatusChange(status)} className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-3 rounded-xl cursor-pointer transition border ${isActive ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/10 shadow-sm' : isCompleted ? 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800' : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 opacity-60 hover:opacity-100'}`}>
                        <p className={`text-sm font-bold ${isActive ? 'text-cyan-700 dark:text-cyan-400' : 'text-slate-700 dark:text-slate-300'}`}>{STATUS_LABELS[status]}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Designer Assignment */}
            {currentIndex >= 2 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                  <Brush className="w-4 h-4" /> Designer Core
                </h3>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {album.assignedDesigner ? (
                      <>
                        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shadow-sm">
                          <img src={album.assignedDesigner.photo} alt={album.assignedDesigner.name} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{album.assignedDesigner.name}</p>
                          <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Assigned</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400">
                          <Brush className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 italic">No Designer Assigned</p>
                        </div>
                      </>
                    )}
                  </div>
                  <button onClick={() => setIsAssignModalOpen(true)} className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-300 transition-colors shadow-sm flex items-center gap-2">
                    <UserCheck className="w-3 h-3" /> Select
                  </button>
                </div>
              </div>
            )}

            {/* Communication Hook */}
            {album.selectionType === 'client' && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2"><MessageCircle className="w-4 h-4" /> Client Communication</h3>
                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-4 rounded-xl">
                  <pre className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap font-sans mb-3">{whatsappTemplate}</pre>
                  <div className="flex gap-2">
                    <button onClick={() => copyToClipboard(whatsappTemplate, "Msg")} className="flex-1 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2">
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                    <button onClick={sendWhatsApp} className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-bold transition shadow shadow-green-500/20 flex items-center justify-center gap-2">
                      <MessageCircle className="w-3 h-3" /> WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            )}

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Activity Logs */}
            {album.activityLogs && album.activityLogs.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Activity Protocol
                </h3>
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-slate-800 max-h-48 overflow-y-auto custom-scrollbar">
                  <div className="space-y-4 relative before:absolute before:inset-0 before:ml-1 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-800 before:to-transparent">
                    {album.activityLogs.slice().reverse().map((log, index) => (
                      <div key={log._id || index} className="relative flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 ring-4 ring-slate-50 dark:ring-slate-900 z-10 shrink-0 mx-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">{log.message}</p>
                          <p className="text-[9px] text-slate-400 mt-0.5 uppercase tracking-wider">{new Date(log.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        </motion.div>
      </div>

      <AssignDesignerModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        team={team}
        assignedDesignerId={assignedDesigner}
        onDesignerSelected={handleDesignerAssignment}
      />
    </AnimatePresence>
  );
}
