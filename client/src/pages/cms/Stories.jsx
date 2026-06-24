import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Plus, Edit2, Trash2, X, Image as ImageIcon } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";

export default function Stories() {
  const [stories, setStories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    shortDescription: "",
    description: "",
    isActive: true,
  });

  const [mainImage, setMainImage] = useState(null);
  const [sideImage, setSideImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]); // new files
  const [existingGalleryImages, setExistingGalleryImages] = useState([]); // urls

  const fetchStories = async () => {
    try {
      const res = await axiosInstance.get("/cms/story");
      setStories(res.data);
    } catch (error) {
      toast.error("Failed to fetch stories");
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "title" && !isEditing) {
      setFormData({
        ...formData,
        title: value,
        slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      });
    } else {
      setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
    }
  };

  const handleFileChange = (e, type) => {
    if (type === "main") setMainImage(e.target.files[0]);
    else if (type === "side") setSideImage(e.target.files[0]);
    else if (type === "gallery") {
      setGalleryImages(Array.from(e.target.files));
    }
  };

  const removeExistingImage = (index) => {
    const updated = [...existingGalleryImages];
    updated.splice(index, 1);
    setExistingGalleryImages(updated);
  };

  const openModal = (story = null) => {
    if (story) {
      setIsEditing(true);
      setCurrentId(story._id);
      setFormData({
        title: story.title,
        slug: story.slug,
        shortDescription: story.shortDescription || "",
        description: story.description || "",
        isActive: story.isActive,
        showOnHome: story.showOnHome || false,
      });
      setExistingGalleryImages(story.galleryImages || []);
    } else {
      setIsEditing(false);
      setCurrentId(null);
      setFormData({
        title: "",
        slug: "",
        shortDescription: "",
        description: "",
        isActive: true,
        showOnHome: false,
      });
      setExistingGalleryImages([]);
    }
    setMainImage(null);
    setSideImage(null);
    setGalleryImages([]);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEditing && !mainImage) return toast.error("Main image is required");

    const data = new FormData();
    data.append("title", formData.title);
    data.append("slug", formData.slug);
    data.append("shortDescription", formData.shortDescription);
    data.append("description", formData.description);
    data.append("isActive", formData.isActive);
    data.append("showOnHome", formData.showOnHome);

    if (mainImage) data.append("mainImage", mainImage);
    if (sideImage) data.append("sideImage", sideImage);

    if (isEditing) {
      data.append("existingGalleryImages", JSON.stringify(existingGalleryImages));
    }

    galleryImages.forEach((file, index) => {
      data.append(`galleryImages_${index}`, file);
    });

    setIsSubmitting(true);
    try {
      if (isEditing) {
        await axiosInstance.put(`/cms/story/${currentId}`, data);
        toast.success("Story updated");
      } else {
        await axiosInstance.post("/cms/story", data);
        toast.success("Story created");
      }
      setIsModalOpen(false);
      fetchStories();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save story");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this story?")) {
      try {
        await axiosInstance.delete(`/cms/story/${id}`);
        toast.success("Story deleted");
        fetchStories();
      } catch (error) {
        toast.error("Failed to delete story");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Stories / Work Showcase</h1>
        <button onClick={() => openModal()} className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700">
          <Plus className="w-4 h-4" /> Add Story
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stories.map((story) => (
          <div key={story._id} className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="h-48 relative bg-slate-100 dark:bg-slate-800">
              {story.mainImage ? (
                <img src={story.mainImage} alt={story.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-8 h-8 text-slate-400" /></div>
              )}
              {!story.isActive && (
                <span className="absolute top-3 right-3 px-2 py-1 bg-rose-500 text-white text-[10px] font-bold uppercase rounded-md shadow-sm">
                  Hidden
                </span>
              )}
            </div>
            <div className="p-5">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">{story.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">{story.shortDescription}</p>

              <div className="flex items-center justify-between mt-4">
                <span className="text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                  {story.galleryImages?.length || 0} images
                </span>
                <div className="flex gap-2">
                  <button onClick={() => openModal(story)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(story._id)} className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {stories.length === 0 && (
        <div className="text-center py-12 text-slate-500 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
          No stories created yet.
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-800 my-8">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10 rounded-t-xl">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                {isEditing ? "Edit Story" : "Add Story"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Story Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Slug</label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Short Description (For Cards)</label>
                <textarea
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Description (Plain text / paragraphs)</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="5"
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Main Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "main")}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Side Image (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "side")}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Gallery Images (Multiple)</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFileChange(e, "gallery")}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm mb-4"
                />

                {isEditing && existingGalleryImages.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-2">Existing Images:</p>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {existingGalleryImages.map((img, idx) => (
                        <div key={idx} className="relative group rounded-md overflow-hidden bg-slate-100 aspect-square">
                          <img src={img} alt="Gallery" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(idx)}
                            className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-6 pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    id="isActive"
                    className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-slate-700 dark:text-slate-300">Active</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="showOnHome"
                    checked={formData.showOnHome}
                    onChange={handleInputChange}
                    id="showOnHome"
                    className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500"
                  />
                  <label htmlFor="showOnHome" className="text-sm font-medium text-slate-700 dark:text-slate-300">Show on Home Page</label>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 -mx-6 -mb-6 rounded-b-xl">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50">
                  {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create Story"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
