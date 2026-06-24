import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Image, Upload } from "lucide-react";
import axiosInstance from "../../../utils/axiosInstance";
import { toast } from "react-toastify";

export default function AddTeamModal({ isOpen, onClose, onMemberAdded, member = null }) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    whatsapp: "",
    email: "",
    skills: "", // comma separated
    gear: "", // comma separated
    tools: "", // comma separated
    notes: "",
    showOnAbout: true
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: member?.name || "",
        phone: member?.phone || "",
        whatsapp: member?.whatsapp || "",
        email: member?.email || "",
        skills: member?.skills ? member.skills.join(", ") : "",
        gear: member?.gear ? member.gear.join(", ") : "",
        tools: member?.tools ? member.tools.join(", ") : "",
        notes: member?.notes || "",
        showOnAbout: member?.showOnAbout !== undefined ? member.showOnAbout : true
      });
      setPhotoFile(null);
    }
  }, [isOpen, member]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return toast.error("Name and Phone are required");

    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (["skills", "gear", "tools"].includes(key)) {
          // parse comma separated into array stringified
          const arr = formData[key].split(",").map(i => i.trim()).filter(Boolean);
          data.append(key, JSON.stringify(arr));
        } else {
          data.append(key, formData[key]);
        }
      });

      if (photoFile) {
        data.append("photo", photoFile);
      }

      if (member) {
        await axiosInstance.put(`/team/${member._id}`, data, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        toast.success("Team member updated");
      } else {
        await axiosInstance.post("/team", data, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        toast.success("Team member added");
      }

      onMemberAdded();
      onClose();
    } catch (error) {
      toast.error(member ? "Failed to update team member" : "Failed to add team member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex justify-center items-center p-4">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        ></motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 shrink-0">
            <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">
              {member ? "Edit Team Member" : "Add Team Member"}
            </h2>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto custom-scrollbar">
            <form id="team-form" onSubmit={handleSubmit} className="space-y-6">

              <div className="flex flex-col sm:flex-row gap-6">
                {/* Photo Upload area */}
                <div className="w-full sm:w-1/3 flex flex-col items-center gap-3">
                  <div className="w-32 h-32 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-900 relative group">
                    {photoFile ? (
                      <img src={URL.createObjectURL(photoFile)} alt="preview" className="w-full h-full object-cover" />
                    ) : member?.photo ? (
                      <img src={member.photo} alt="existing" className="w-full h-full object-cover" />
                    ) : (
                      <Image className="w-8 h-8 text-slate-400" />
                    )}
                    <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white cursor-pointer transition-opacity">
                      <Upload className="w-5 h-5 mb-1" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Upload</span>
                      <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                    </label>
                  </div>
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Profile Photo</span>

                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      id="showOnAbout"
                      name="showOnAbout"
                      checked={formData.showOnAbout}
                      onChange={(e) => setFormData(prev => ({ ...prev, showOnAbout: e.target.checked }))}
                      className="w-4 h-4 text-cyan-600 border-slate-300 dark:border-slate-750 rounded focus:ring-cyan-500 cursor-pointer"
                    />
                    <label htmlFor="showOnAbout" className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest cursor-pointer select-none">
                      Show on About Us
                    </label>
                  </div>
                </div>

                <div className="w-full sm:w-2/3 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Full Name *</label>
                    <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-3 py-2 outline-none focus:border-cyan-500 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Phone *</label>
                    <input required type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-3 py-2 outline-none focus:border-cyan-500 rounded-lg text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">WhatsApp</label>
                      <input type="text" name="whatsapp" value={formData.whatsapp} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-3 py-2 outline-none focus:border-cyan-500 rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Email</label>
                      <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-3 py-2 outline-none focus:border-cyan-500 rounded-lg text-sm" />
                    </div>
                  </div>
                </div>
              </div>

              <hr className="border-slate-200 dark:border-slate-800" />

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Skills (comma separated)</label>
                  <input type="text" name="skills" value={formData.skills} onChange={handleChange} placeholder="Photographer, Videographer, Editor..." className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-3 py-2 outline-none focus:border-cyan-500 rounded-lg text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Camera Gear</label>
                    <input type="text" name="gear" value={formData.gear} onChange={handleChange} placeholder="Sony A7III, Canon R6..." className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-3 py-2 outline-none focus:border-cyan-500 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Other Tools</label>
                    <input type="text" name="tools" value={formData.tools} onChange={handleChange} placeholder="Gimbal, Drone, Lights..." className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-3 py-2 outline-none focus:border-cyan-500 rounded-lg text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Extra Notes</label>
                  <textarea name="notes" value={formData.notes} onChange={handleChange} rows="2" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-3 py-2 outline-none focus:border-cyan-500 rounded-lg text-sm"></textarea>
                </div>
              </div>
            </form>
          </div>

          <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shrink-0">
            <button
              form="team-form"
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold uppercase tracking-widest py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50"
            >
              {loading ? (member ? "Updating..." : "Adding...") : (member ? "Update Team Member" : "Save Team Member")}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
