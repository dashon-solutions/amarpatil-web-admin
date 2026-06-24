import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Plus, Trash2, Edit, Save, CheckCircle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "../../utils/axiosInstance";

const Packages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({ title: "", description: "", category: "Photography" });
  const [variants, setVariants] = useState([]);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const { data } = await axiosInstance.get("/cms/package");
      setPackages(data);
    } catch (err) {
      toast.error("Failed to fetch packages");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (pkg = null) => {
    if (pkg) {
      setEditingId(pkg._id);
      setFormData({
        title: pkg.title || "",
        description: pkg.description || "",
        category: pkg.category || "Photography"
      });
      setVariants(pkg.variants || []);
    } else {
      setEditingId(null);
      setFormData({ title: "", description: "", category: "Photography" });
      setVariants([]);
    }
    setIsModalOpen(true);
  };

  const addVariant = () => {
    setVariants([...variants, { name: "", price: 0, sellingPrice: 0, features: [""] }]);
  };

  const updateVariant = (index, field, value) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };

  const removeVariant = (index) => {
    const updated = [...variants];
    updated.splice(index, 1);
    setVariants(updated);
  };

  const updateVariantFeature = (vIndex, fIndex, value) => {
    const updated = [...variants];
    updated[vIndex].features[fIndex] = value;
    setVariants(updated);
  };

  const addVariantFeature = (vIndex) => {
    const updated = [...variants];
    updated[vIndex].features.push("");
    setVariants(updated);
  };

  const removeVariantFeature = (vIndex, fIndex) => {
    const updated = [...variants];
    updated[vIndex].features.splice(fIndex, 1);
    setVariants(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (variants.length === 0) {
      toast.error("You must add at least one variant");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = { ...formData, variants: JSON.stringify(variants) };

      const submitData = new FormData();
      Object.keys(payload).forEach(key => submitData.append(key, payload[key]));
      // Note: Image upload logic for variants can be appended here using variantImage_${idx} if needed

      if (editingId) {
        await axiosInstance.put(`/cms/package/${editingId}`, submitData, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Package updated successfully");
      } else {
        await axiosInstance.post("/cms/package", submitData, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Package created successfully");
      }
      setIsModalOpen(false);
      fetchPackages();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save package");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this package map completely?")) {
      try {
        await axiosInstance.delete(`/cms/package/${id}`);
        toast.success("Package deleted");
        fetchPackages();
      } catch (err) {
        toast.error("Failed to delete");
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Service Packages</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage global service packages and dynamic pricing variants.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2.5 rounded-lg shadow-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors">
          <Plus className="w-5 h-5" />
          Add Package
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500">Loading packages...</div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence>
            {packages.map((pkg) => (
              <motion.div key={pkg._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start bg-slate-50 dark:bg-slate-800/50">
                  <div>
                    <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 tracking-wider uppercase bg-cyan-100 dark:bg-cyan-500/10 px-2 py-1 rounded inline-block mb-2">{pkg.category}</span>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{pkg.title}</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{pkg.description || "No description provided."}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleOpenModal(pkg)} className="p-2 text-slate-500 hover:text-cyan-600 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(pkg._id)} className="p-2 text-slate-500 hover:text-red-500 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pkg.variants.map((v, i) => (
                    <div key={i} className="border border-slate-200 dark:border-slate-700 rounded-xl p-5 relative hover:border-cyan-500 transition-colors">
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">{v.name}</h4>
                      <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-2xl font-black text-slate-900 dark:text-white">${v.sellingPrice}</span>
                        {v.price > v.sellingPrice && <span className="text-sm text-slate-400 line-through">${v.price}</span>}
                      </div>
                      <ul className="space-y-2">
                        {v.features.map((f, fi) => (
                          <li key={fi} className="flex items-start text-sm text-slate-600 dark:text-slate-400">
                            <CheckCircle className="w-4 h-4 text-cyan-500 mr-2 mt-0.5 shrink-0" /> {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  {pkg.variants.length === 0 && <div className="text-slate-400 italic">No variants configured.</div>}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[90vh]">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{editingId ? "Edit Package" : "Create Package"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><XCircle className="w-6 h-6" /></button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
              {/* Core Info */}
              <div className="bg-slate-50 dark:bg-slate-800/30 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4">Core Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Package Title</label>
                    <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-cyan-500" placeholder="e.g. Wedding Photography" />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                    <input type="text" required value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-cyan-500" placeholder="e.g. Events" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">General Description</label>
                    <textarea rows="2" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-cyan-500"></textarea>
                  </div>
                </div>
              </div>

              {/* Variants Builder */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg">Variants / Tiers</h3>
                  <button type="button" onClick={addVariant} className="flex items-center text-sm font-medium text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 hover:underline"><Plus className="w-4 h-4 mr-1" /> Add Variant</button>
                </div>

                <div className="space-y-6">
                  {variants.map((v, i) => (
                    <div key={i} className="border border-slate-200 dark:border-slate-700 rounded-xl p-6 relative bg-white dark:bg-slate-800/10">
                      <button type="button" onClick={() => removeVariant(i)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500"><Trash2 className="w-5 h-5" /></button>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 pr-8">
                        <div>
                          <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Tier Name</label>
                          <input type="text" required value={v.name} onChange={e => updateVariant(i, 'name', e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" placeholder="e.g. Premium" />
                        </div>
                        <div>
                          <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Original Price ($)</label>
                          <input type="number" required value={v.price} onChange={e => updateVariant(i, 'price', e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" />
                        </div>
                        <div>
                          <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Selling Price ($)</label>
                          <input type="number" required value={v.sellingPrice} onChange={e => updateVariant(i, 'sellingPrice', e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Included Features</label>
                          <button type="button" onClick={() => addVariantFeature(i)} className="text-xs text-cyan-600">+ Add Feature</button>
                        </div>
                        <div className="space-y-2">
                          {v.features.map((feature, fi) => (
                            <div key={fi} className="flex items-center gap-2">
                              <input type="text" value={feature} onChange={e => updateVariantFeature(i, fi, e.target.value)} className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-sm" placeholder="e.g. 8 Hours Coverage" />
                              <button type="button" onClick={() => removeVariantFeature(i, fi)} className="text-slate-400 hover:text-red-500"><XCircle className="w-4 h-4" /></button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                  {variants.length === 0 && <div className="text-center p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-slate-500">No variants added. Please add at least one variant to save this package.</div>}
                </div>
              </div>

            </form>
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end">
              <button type="submit" onClick={handleSubmit} disabled={isSubmitting} className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-2.5 rounded-lg shadow-sm font-medium flex items-center gap-2 disabled:opacity-50">
                <Save className="w-4 h-4" /> {isSubmitting ? "Saving..." : "Save Package"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Packages;
