import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Plus, Trash2, Edit, Image as ImageIcon, CheckCircle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "../../utils/axiosInstance";

const Banners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "", subtitle: "", slogan: "", description: "", ctaText: "Book Now", ctaLink: "/packages", isActive: true
  });
  const [files, setFiles] = useState({ mainImage: null, sideImage: null });
  const [previews, setPreviews] = useState({ mainImage: null, sideImage: null });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const { data } = await axiosInstance.get("/cms/banner");
      setBanners(data);
    } catch (err) {
      toast.error("Failed to fetch banners");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ title: "", subtitle: "", slogan: "", description: "", ctaText: "Book Now", ctaLink: "/packages", isActive: true });
    setFiles({ mainImage: null, sideImage: null });
    setPreviews({ mainImage: null, sideImage: null });
    setEditingId(null);
  };

  const handleOpenModal = (banner = null) => {
    if (banner) {
      setEditingId(banner._id);
      setFormData({
        title: banner.title || "",
        subtitle: banner.subtitle || "",
        slogan: banner.slogan || "",
        description: banner.description || "",
        ctaText: banner.ctaText || "Book Now",
        ctaLink: banner.ctaLink || "/packages",
        isActive: banner.isActive,
      });
      setPreviews({
        mainImage: banner.mainImage || null,
        sideImage: banner.sideImage || null,
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      setFiles({ ...files, [field]: file });
      setPreviews({ ...previews, [field]: URL.createObjectURL(file) });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submitData = new FormData();
    Object.keys(formData).forEach(key => submitData.append(key, formData[key]));
    if (files.mainImage) submitData.append("mainImage", files.mainImage);
    if (files.sideImage) submitData.append("sideImage", files.sideImage);

    setIsSubmitting(true);
    try {
      if (editingId) {
        await axiosInstance.put(`/cms/banner/${editingId}`, submitData, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Banner updated");
      } else {
        await axiosInstance.post("/cms/banner", submitData, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Banner created");
      }
      setIsModalOpen(false);
      fetchBanners();
    } catch (err) {
      toast.error("Error saving banner");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this banner permanently?")) {
      try {
        await axiosInstance.delete(`/cms/banner/${id}`);
        toast.success("Banner deleted");
        fetchBanners();
      } catch (err) {
        toast.error("Failed to delete banner");
      }
    }
  };

  const toggleActive = async (id, currentStatus) => {
    try {
      await axiosInstance.put(`/cms/banner/${id}`, { isActive: !currentStatus });
      fetchBanners();
    } catch (err) {
      toast.error("Failed to change status");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Hero Banners</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage the dynamic hero section on your homepage.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2.5 rounded-lg shadow-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Banner
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20 text-slate-400">Loading banners...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence>
            {banners?.map?.((banner) => (
              <motion.div
                key={banner._id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                className={`bg-white dark:bg-slate-900 rounded-2xl border ${banner.isActive ? 'border-cyan-500 shadow-md' : 'border-slate-200 dark:border-slate-800 opacity-70'} overflow-hidden relative group transition-all duration-300`}
              >
                {/* Image Background */}
                <div className="h-48 bg-slate-100 dark:bg-slate-800 relative w-full overflow-hidden">
                  {banner.mainImage ? (
                    <img src={banner.mainImage} alt={banner.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : <div className="absolute inset-0 flex items-center justify-center text-slate-300"><ImageIcon className="w-10 h-10" /></div>}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>

                  {/* Status Badge */}
                  <div className="absolute top-4 left-4">
                    <button
                      onClick={() => toggleActive(banner._id, banner.isActive)}
                      className={`px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1 backdrop-blur-md ${banner.isActive ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-slate-800/50 text-slate-300 border border-slate-600'}`}
                    >
                      {banner.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {banner.isActive ? "ACTIVE" : "HIDDEN"}
                    </button>
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-5">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 truncate">{banner.title || "Untitled Banner"}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{banner.description}</p>

                  <div className="flex gap-2 justify-end mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button onClick={() => handleOpenModal(banner)} className="p-2 text-slate-400 hover:text-cyan-600 transition-colors bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(banner._id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {banners.length === 0 && (
            <div className="col-span-full py-20 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
              <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No banners uploaded yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{editingId ? "Edit Banner" : "New Banner"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><XCircle className="w-6 h-6" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
                  <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-cyan-500" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subtitle</label>
                  <input type="text" value={formData.subtitle} onChange={e => setFormData({ ...formData, subtitle: e.target.value })} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-cyan-500" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Slogan</label>
                  <input type="text" value={formData.slogan} onChange={e => setFormData({ ...formData, slogan: e.target.value })} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-cyan-500" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">CTA Text</label>
                  <input type="text" value={formData.ctaText} onChange={e => setFormData({ ...formData, ctaText: e.target.value })} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-cyan-500" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">CTA Link</label>
                  <input type="text" value={formData.ctaLink} onChange={e => setFormData({ ...formData, ctaLink: e.target.value })} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-cyan-500" />
                </div>
                <div className="col-span-2 flex items-center mt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                    <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} className="w-5 h-5 rounded text-cyan-600 focus:ring-cyan-500 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700" />
                    Display on Website
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea rows="3" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-cyan-500"></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Main Hero Image (req)</label>
                  <div className="h-40 bg-slate-50 dark:bg-slate-800 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center overflow-hidden relative cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                    {previews.mainImage ? <img src={previews.mainImage} className="w-full h-full object-cover" /> : <div className="text-slate-400 text-sm flex flex-col items-center"><ImageIcon className="w-6 h-6 mb-2" />Upload</div>}
                    <input type="file" onChange={(e) => handleFileChange(e, 'mainImage')} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Side Focus Image (opt)</label>
                  <div className="h-40 bg-slate-50 dark:bg-slate-800 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center overflow-hidden relative cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                    {previews.sideImage ? <img src={previews.sideImage} className="w-full h-full object-cover" /> : <div className="text-slate-400 text-sm flex flex-col items-center"><ImageIcon className="w-6 h-6 mb-2" />Upload</div>}
                    <input type="file" onChange={(e) => handleFileChange(e, 'sideImage')} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button type="submit" disabled={isSubmitting} className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2.5 rounded-lg shadow-sm transition-colors font-medium disabled:opacity-50">
                  {isSubmitting ? "Saving..." : "Save Banner"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Banners;
