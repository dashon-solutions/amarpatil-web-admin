import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import { Plus, Edit2, Trash2, X, Image as ImageIcon, Star, CheckCircle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    message: "",
    rating: 5,
    isActive: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const fetchTestimonials = async () => {
    try {
      const res = await axiosInstance.get("/cms/testimonial");
      setTestimonials(res.data);
    } catch (error) {
      toast.error("Failed to fetch testimonials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleRatingChange = (ratingVal) => {
    setFormData({
      ...formData,
      rating: ratingVal,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const openModal = (testimonial = null) => {
    if (testimonial) {
      setIsEditing(true);
      setCurrentId(testimonial._id);
      setFormData({
        name: testimonial.name,
        message: testimonial.message,
        rating: testimonial.rating || 5,
        isActive: testimonial.isActive,
      });
      setImagePreview(testimonial.image || null);
    } else {
      setIsEditing(false);
      setCurrentId(null);
      setFormData({ name: "", message: "", rating: 5, isActive: true });
      setImagePreview(null);
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.message) {
      toast.error("Name and Message are required");
      return;
    }

    const data = new FormData();
    data.append("name", formData.name);
    data.append("message", formData.message);
    data.append("rating", formData.rating);
    data.append("isActive", formData.isActive);
    if (imageFile) data.append("image", imageFile);

    setIsSubmitting(true);
    try {
      if (isEditing) {
        await axiosInstance.put(`/cms/testimonial/${currentId}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Testimonial updated");
      } else {
        await axiosInstance.post("/cms/testimonial", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Testimonial created");
      }
      setIsModalOpen(false);
      fetchTestimonials();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save testimonial");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this testimonial permanently?")) {
      try {
        await axiosInstance.delete(`/cms/testimonial/${id}`);
        toast.success("Testimonial deleted");
        fetchTestimonials();
      } catch (error) {
        toast.error("Failed to delete testimonial");
      }
    }
  };

  const toggleActiveStatus = async (testimonial) => {
    try {
      await axiosInstance.put(`/cms/testimonial/${testimonial._id}`, {
        isActive: !testimonial.isActive,
      });
      toast.success(`Testimonial ${!testimonial.isActive ? "activated" : "hidden"}`);
      fetchTestimonials();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Testimonials</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage customer feedback and star ratings displayed on the website.
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors shadow-sm font-medium"
        >
          <Plus className="w-4 h-4" /> Add Testimonial
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20 text-slate-400">Loading testimonials...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {testimonials.map((test) => (
              <motion.div
                key={test._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`bg-white dark:bg-slate-900 rounded-xl p-6 border shadow-xs flex flex-col justify-between transition-all duration-300 ${
                  test.isActive ? "border-slate-200 dark:border-slate-800" : "border-slate-200 dark:border-slate-800 opacity-60"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    {/* Stars */}
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < test.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-200 dark:text-slate-700"
                          }`}
                        />
                      ))}
                    </div>

                    {/* Active/Hidden Button */}
                    <button
                      onClick={() => toggleActiveStatus(test)}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-full flex items-center gap-1 transition-all ${
                        test.isActive
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      {test.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {test.isActive ? "ACTIVE" : "HIDDEN"}
                    </button>
                  </div>

                  <p className="text-slate-600 dark:text-slate-350 text-sm italic mb-6 line-clamp-4">
                    "{test.message}"
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4 mt-auto">
                  <div className="flex items-center gap-3">
                    {test.image ? (
                      <img
                        src={test.image}
                        alt={test.name}
                        className="w-10 h-10 object-cover rounded-full shadow-sm"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                        <ImageIcon className="w-4 h-4 text-slate-400" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-sm text-slate-800 dark:text-white leading-tight">
                        {test.name}
                      </h4>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <button
                      onClick={() => openModal(test)}
                      className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title="Edit Testimonial"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(test._id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title="Delete Testimonial"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {testimonials.length === 0 && (
            <div className="col-span-full py-16 text-center text-slate-500 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900">
              <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-20 text-slate-400" />
              <p>No testimonials added yet. Create one!</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                {isEditing ? "Edit Testimonial" : "Add Testimonial"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Eleanor Vance"
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white focus:ring-1 focus:ring-cyan-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Rating
                </label>
                <div className="flex gap-1.5 py-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleRatingChange(i + 1)}
                      className="text-slate-300 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          i < formData.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-350 dark:text-slate-600"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Message / Quote
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows="4"
                  placeholder="Insert customer experience text..."
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white focus:ring-1 focus:ring-cyan-500 outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Photo / Avatar
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-100 dark:file:bg-slate-800 file:text-slate-700 dark:file:text-slate-300 file:cursor-pointer"
                  />
                </div>
                <div className="flex justify-center">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-14 h-14 object-cover rounded-full border border-slate-200"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 border border-dashed rounded-full flex items-center justify-center text-slate-400 text-xs">
                      No Photo
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  id="isActive"
                  className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Active (Display on website)
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-650 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 text-sm font-medium shadow-sm transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
