import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import { Plus, Edit2, Trash2, X, Image as ImageIcon, Filter } from "lucide-react";

export default function Galleries() {
  const [galleries, setGalleries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    isFeatured: false,
    isActive: true,
  });
  const [imageFiles, setImageFiles] = useState([]);

  const fetchData = async () => {
    try {
      const [galRes, catRes] = await Promise.all([
        axiosInstance.get("/cms/gallery"),
        axiosInstance.get("/cms/category")
      ]);
      setGalleries(galRes.data);
      setCategories(catRes.data);
    } catch (error) {
      toast.error("Failed to fetch data");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleFileChange = (e) => {
    setImageFiles(Array.from(e.target.files));
  };

  const openModal = (gallery = null, defaultCategory = "") => {
    if (gallery) {
      setIsEditing(true);
      setCurrentId(gallery._id);
      setFormData({
        title: gallery.title || "",
        category: gallery.category?._id || "",
        isFeatured: gallery.isFeatured || false,
        isActive: gallery.isActive !== false,
      });
    } else {
      setIsEditing(false);
      setCurrentId(null);
      setFormData({
        title: "",
        category: defaultCategory || "",
        isFeatured: false,
        isActive: true
      });
    }
    setImageFiles([]);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category) {
      return toast.error("Please select a category");
    }
    if (!isEditing && imageFiles.length === 0) {
      return toast.error("At least one image is required");
    }

    setIsSubmitting(true);

    try {
      if (isEditing) {
        const data = new FormData();
        data.append("title", formData.title);
        data.append("category", formData.category);
        data.append("isFeatured", formData.isFeatured);
        data.append("isActive", formData.isActive);
        if (imageFiles.length > 0) data.append("image", imageFiles[0]);

        await axiosInstance.put(`/cms/gallery/${currentId}`, data);
        toast.success("Image updated");
      } else {
        // Upload multiple images sequentially
        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i];
          const data = new FormData();
          
          // Use input title if provided, otherwise default to filename
          const fileTitle = formData.title || file.name.substring(0, file.name.lastIndexOf('.')) || "Gallery Image";
          data.append("title", fileTitle);
          data.append("category", formData.category);
          data.append("isFeatured", formData.isFeatured);
          data.append("isActive", formData.isActive);
          data.append("image", file);

          await axiosInstance.post("/cms/gallery", data);
        }
        toast.success(`${imageFiles.length} images added to gallery`);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this image?")) {
      try {
        await axiosInstance.delete(`/cms/gallery/${id}`);
        toast.success("Image deleted");
        fetchData();
      } catch (error) {
        toast.error("Failed to delete image");
      }
    }
  };

  const filteredGalleries = selectedCategoryFilter === "all"
    ? galleries
    : galleries.filter((gal) => gal.category?._id === selectedCategoryFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Gallery Images</h1>
          <p className="text-sm text-slate-500 mt-1">Manage public website portfolio images.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Category Selector Filter */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="bg-transparent text-sm outline-none text-slate-700 dark:text-slate-200 cursor-pointer font-medium"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={() => openModal(null, selectedCategoryFilter !== "all" ? selectedCategoryFilter : "")} 
            className="flex items-center gap-2 px-4 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 shadow-sm transition-colors text-sm font-semibold shrink-0"
          >
            <Plus className="w-4 h-4" /> Add Image(s)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredGalleries.map((gal) => (
          <div key={gal._id} className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 group relative">
            <div className="aspect-square relative overflow-hidden bg-slate-100 dark:bg-slate-800">
              {gal.image ? (
                <img src={gal.image} alt={gal.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-8 h-8 text-slate-400" /></div>
              )}

              <div className="absolute top-2 right-2 flex gap-1">
                {gal.isFeatured && (
                  <span className="px-2 py-1 bg-amber-500 text-white text-[10px] font-bold uppercase rounded-md shadow-sm">
                    Featured
                  </span>
                )}
                {!gal.isActive && (
                  <span className="px-2 py-1 bg-rose-500 text-white text-[10px] font-bold uppercase rounded-md shadow-sm">
                    Hidden
                  </span>
                )}
              </div>

              {/* Action Overlay */}
              <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                <button onClick={() => openModal(gal)} className="p-2 bg-white text-slate-900 rounded-full hover:bg-cyan-500 hover:text-white transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(gal._id)} className="p-2 bg-white text-rose-600 rounded-full hover:bg-rose-600 hover:text-white transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-3 border-t border-slate-200 dark:border-slate-800">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{gal.title || 'Untitled'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{gal.category?.name || 'No Category'}</p>
            </div>
          </div>
        ))}
      </div>

      {filteredGalleries.length === 0 && (
        <div className="text-center py-12 text-slate-500 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
          No images found in this gallery view.
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                {isEditing ? "Edit Image" : "Add Image(s)"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Category selector is placed first */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium"
                >
                  <option value="" disabled>Select Category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Upload image input is displayed directly after the category is selected */}
              {formData.category && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Upload Image{isEditing ? "" : "(s)"} *
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple={!isEditing}
                    onChange={handleFileChange}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm cursor-pointer"
                  />
                  {!isEditing && imageFiles.length > 0 && (
                    <p className="text-xs text-cyan-600 dark:text-cyan-400 font-bold mt-1.5">{imageFiles.length} file(s) selected.</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Title {isEditing ? "(Optional)" : "(Optional, falls back to file name)"}
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleInputChange}
                    id="isFeatured"
                    className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  />
                  <label htmlFor="isFeatured" className="text-sm font-medium text-slate-700 dark:text-slate-300 select-none">Featured on Home</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    id="isActive"
                    className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-slate-700 dark:text-slate-300 select-none">Active</label>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg text-sm font-semibold">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-md transition-colors text-sm font-bold disabled:opacity-50">
                  {isSubmitting ? "Uploading..." : isEditing ? "Save Changes" : "Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
