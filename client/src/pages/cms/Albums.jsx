import React, { useEffect, useState } from "react";
import { Plus, Search, FolderClosed, BookImage, Disc, CheckCircle, Cloud, FileDigit, MessageCircle } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import AlbumModal from "../../components/cms/albums/AlbumModal";
import AlbumDetailDrawer from "../../components/cms/albums/AlbumDetailDrawer";

export default function Albums() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get("/albums");
      if (data.success) {
        setAlbums(data.albums);
        // Automatically sync the open drawer with the fresh database output using functional update to bypass scope closure!
        setSelectedAlbum(prev => {
           if (!prev) return null;
           return data.albums.find(a => a._id === prev._id) || prev;
        });
      }
    } catch (e) {
      toast.error("Failed to load albums.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = status || "created";
    const map = {
      created: { color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300", label: "Created" },
      sent_for_selection: { color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", label: "Sent for Selection" },
      selection_done: { color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400", label: "Selection Done" },
      design_assigned: { color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", label: "Design Assigned" },
      design_completed: { color: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400", label: "Design Completed" },
      printing: { color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400", label: "Printing" },
      delivered: { color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", label: "Delivered", icon: CheckCircle },
    };
    const mapped = map[s];
    const Icon = mapped.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${mapped.color}`}>
        {Icon && <Icon className="w-3 h-3" />}
        {mapped.label}
      </span>
    );
  };

  const sendQuickWhatsApp = (e, album) => {
    e.stopPropagation();
    let template = "";
    if (album.deliveryMethod === 'physical') {
       template = `Hello ${album.clientName},\n\nYour album photos are finalized! 📸\n\nYour premium Pen Drive is ready for pickup/delivery. Please contact the studio so we can coordinate your physical delivery.\n\nThank you!`;
    } else {
       template = `Hello ${album.clientName},\n\nYour photos are ready for selection! 📸\n\nPlease open the secure Google Drive link below and select your favorite photos for your album.\n\n🔗 ${album.driveLink}\n\nInstructions:\n1. Open the Drive link.\n2. Note down the image numbers or take screenshots.\n3. Reply to us with your final selections.\n\nThank you!`;
    }
    const encoded = encodeURI(template);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const filtered = albums.filter((a) =>
    a.clientName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col pt-4 overflow-hidden relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 px-1">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
             Album Links
          </h1>
          <p className="text-slate-500 font-light mt-1 text-sm">Lightweight Google Drive directory mapping.</p>
        </div>
        <div className="flex w-full sm:w-auto items-center gap-3">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-600 outline-none transition-all text-sm group"
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-slate-900 dark:bg-cyan-600 hover:bg-slate-800 dark:hover:bg-cyan-500 text-white px-4 py-2 rounded-xl font-medium transition-all shadow-md shrink-0 focus:scale-95 duration-200"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Map Album</span>
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-[800px] sm:min-w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="p-4 pl-6">Client & Event</th>
                <th className="p-4">Delivery</th>
                <th className="p-4">Selection Type</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <AnimatePresence>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-400">Loading directory...</td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-16 text-center">
                      <FolderClosed className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-500 font-medium text-lg">No albums tracked</p>
                      <p className="text-slate-400 text-sm mt-1">Map your first Google Drive to a Booking to begin.</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((album, idx) => (
                    <motion.tr
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={album._id}
                      onClick={() => { setSelectedAlbum(album); setIsDrawerOpen(true); }}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                    >
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0">
                            <BookImage className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                              {album.clientName}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {album.bookingId ? album.bookingId.shootType : 'Manual Map'} • {album.eventDate ? new Date(album.eventDate).toLocaleDateString() : album.bookingId?.eventDate ? new Date(album.bookingId.eventDate).toLocaleDateString() : new Date(album.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                           {album.deliveryMethod === 'physical' ? (
                             <>
                               <FileDigit className="w-4 h-4 text-orange-500" />
                               <span className="text-xs text-slate-500 font-medium truncate max-w-[150px]">Pen Drive 📦</span>
                             </>
                           ) : (
                             <>
                               <Cloud className="w-4 h-4 text-blue-500" />
                               <span className="text-xs text-slate-500 font-medium truncate max-w-[150px]" title={album.driveLink}>{album.driveLink || 'Cloud Hosted'}</span>
                             </>
                           )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                          {album.selectionType === 'client' ? 'Client Curates' : 'Studio Curates'}
                        </span>
                      </td>
                      <td className="p-4">{getStatusBadge(album.status)}</td>
                      <td className="p-4 text-right pr-6">
                         <div className="flex items-center justify-end gap-3">
                           {album.assignedDesigner ? (
                              <span className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center justify-end gap-2" title="Designer Assigned">
                                 <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                 <span className="hidden sm:inline">{album.assignedDesigner.name}</span>
                              </span>
                           ) : (
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest hidden sm:inline">Unassigned</span>
                           )}
                           <button 
                             onClick={(e) => sendQuickWhatsApp(e, album)}
                             className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 rounded-lg transition-colors border border-green-200 dark:border-green-800/50"
                             title="Send WhatsApp Template"
                           >
                             <MessageCircle className="w-4 h-4" />
                           </button>
                         </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      <AlbumModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={fetchAlbums}
      />

      <AlbumDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        album={selectedAlbum}
        onUpdate={fetchAlbums}
      />
    </div>
  );
}
