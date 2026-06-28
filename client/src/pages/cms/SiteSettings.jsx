import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Save, Image as ImageIcon } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";

const SiteSettings = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "",
    contact: { phone: "", email: "", address: "" },
    socialLinks: { facebook: "", instagram: "", youtube: "", whatsapp: "" },
    meta: { title: "", description: "", keywords: [] },
    bankDetails: { accountName: "", bankName: "", accountNumber: "", ifscCode: "", upiId: "" },
    colors: { primary: "#6B1F2A", secondary: "#4A1620", accent: "#B8924A" },
    showTeam: true,
  });
  const [files, setFiles] = useState({ logo: null, stamp: null, signature: null });
  const [previews, setPreviews] = useState({ logo: "", stamp: "", signature: "" });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await axiosInstance.get("/cms/site-settings");
      if (data && Object.keys(data).length > 0) {
        setFormData({
          businessName: data.businessName || "",
          contact: data.contact || { phone: "", email: "", address: "" },
          socialLinks: data.socialLinks || { facebook: "", instagram: "", youtube: "", whatsapp: "" },
          meta: data.meta || { title: "", description: "", keywords: [] },
          bankDetails: data.bankDetails || { accountName: "", bankName: "", accountNumber: "", ifscCode: "", upiId: "" },
          colors: data.colors || { primary: "#6B1F2A", secondary: "#4A1620", accent: "#B8924A" },
          showTeam: data.showTeam !== undefined ? data.showTeam : true
        });
        setPreviews({
          logo: data.logo || "",
          stamp: data.stamp || "",
          signature: data.signature || ""
        });
      }
    } catch (error) {
      toast.error("Failed to load settings.");
    }
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      setFiles(prev => ({ ...prev, [field]: file }));
      setPreviews(prev => ({ ...prev, [field]: URL.createObjectURL(file) }));
    }
  };

  const handleChange = (e, section, key) => {
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: { ...prev[section], [key]: e.target.value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [key]: e.target.value }));
    }
  };

  const handleToggleChange = (e, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.checked
    }));
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      const data = new FormData();
      data.append("businessName", formData.businessName);
      data.append("contact", JSON.stringify(formData.contact));
      data.append("socialLinks", JSON.stringify(formData.socialLinks));
      data.append("meta", JSON.stringify(formData.meta));
      data.append("bankDetails", JSON.stringify(formData.bankDetails));
      data.append("colors", JSON.stringify(formData.colors));
      data.append("showTeam", formData.showTeam);

      if (files.logo) data.append("logo", files.logo);
      if (files.stamp) data.append("stamp", files.stamp);
      if (files.signature) data.append("signature", files.signature);

      await axiosInstance.put("/cms/site-settings", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success("Settings updated successfully!");
    } catch (error) {
      toast.error("Failed to update settings.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Site Settings</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your public website branding, SEO, and contact data.</p>
        </div>
        <button
          onClick={saveSettings}
          disabled={loading}
          className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2.5 rounded-lg shadow-sm transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Basic & Contact Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Business Name</label>
                <input type="text" value={formData.businessName} onChange={(e) => handleChange(e, null, 'businessName')} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-cyan-500" />
              </div>
            </div>

            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-8 mb-4">Document Branding Colors</h3>
            <p className="text-slate-500 text-xs mb-4">Set custom palette colors for your generated PDF Quotations and Invoices.</p>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Primary Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={formData.colors?.primary || "#6B1F2A"} onChange={(e) => handleChange(e, 'colors', 'primary')} className="w-10 h-10 border border-slate-200 dark:border-slate-700 rounded cursor-pointer" />
                  <input type="text" value={formData.colors?.primary || "#6B1F2A"} onChange={(e) => handleChange(e, 'colors', 'primary')} className="w-20 px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded uppercase outline-none focus:border-cyan-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Secondary Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={formData.colors?.secondary || "#4A1620"} onChange={(e) => handleChange(e, 'colors', 'secondary')} className="w-10 h-10 border border-slate-200 dark:border-slate-700 rounded cursor-pointer" />
                  <input type="text" value={formData.colors?.secondary || "#4A1620"} onChange={(e) => handleChange(e, 'colors', 'secondary')} className="w-20 px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded uppercase outline-none focus:border-cyan-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Accent (Gold)</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={formData.colors?.accent || "#B8924A"} onChange={(e) => handleChange(e, 'colors', 'accent')} className="w-10 h-10 border border-slate-200 dark:border-slate-700 rounded cursor-pointer" />
                  <input type="text" value={formData.colors?.accent || "#B8924A"} onChange={(e) => handleChange(e, 'colors', 'accent')} className="w-20 px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded uppercase outline-none focus:border-cyan-500" />
                </div>
              </div>
            </div>

            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-8 mb-4">Page Configurations</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Show Team Section</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Display the Creative Directors/Team roster on the public About Us page.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showTeam}
                    onChange={(e) => handleToggleChange(e, "showTeam")}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                </label>
              </div>
            </div>

            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-8 mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                <input type="text" value={formData.contact.phone} onChange={(e) => handleChange(e, 'contact', 'phone')} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-cyan-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <input type="email" value={formData.contact.email} onChange={(e) => handleChange(e, 'contact', 'email')} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-cyan-500" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Physical Address</label>
                <textarea rows="3" value={formData.contact.address} onChange={(e) => handleChange(e, 'contact', 'address')} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-cyan-500"></textarea>
              </div>
            </div>

            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-8 mb-4">Payment &amp; Bank Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Account Holder Name</label>
                <input type="text" value={formData.bankDetails?.accountName || ""} onChange={(e) => handleChange(e, 'bankDetails', 'accountName')} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-cyan-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Bank Name</label>
                <input type="text" value={formData.bankDetails?.bankName || ""} onChange={(e) => handleChange(e, 'bankDetails', 'bankName')} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-cyan-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Account Number</label>
                <input type="text" value={formData.bankDetails?.accountNumber || ""} onChange={(e) => handleChange(e, 'bankDetails', 'accountNumber')} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-cyan-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">IFSC Code</label>
                <input type="text" value={formData.bankDetails?.ifscCode || ""} onChange={(e) => handleChange(e, 'bankDetails', 'ifscCode')} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-cyan-500" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">UPI ID (for dynamic QR generation)</label>
                <input type="text" placeholder="e.g. business@upi" value={formData.bankDetails?.upiId || ""} onChange={(e) => handleChange(e, 'bankDetails', 'upiId')} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-cyan-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Branding Assets */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 text-center">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 text-left">Brand Logo</h3>
            <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center overflow-hidden relative cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition">
              {previews.logo ? (
                <img src={previews.logo} alt="Logo" className="h-full object-contain p-2" />
              ) : (
                <div className="text-slate-400 flex flex-col items-center"><ImageIcon className="w-8 h-8 mb-2" /><span>Upload Logo</span></div>
              )}
              <input type="file" onChange={(e) => handleFileChange(e, 'logo')} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 text-center">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 text-left">Invoice Stamp / Seal</h3>
            <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center overflow-hidden relative cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition">
              {previews.stamp ? (
                <img src={previews.stamp} alt="Stamp" className="h-full object-contain p-2" />
              ) : (
                <div className="text-slate-400 flex flex-col items-center"><ImageIcon className="w-8 h-8 mb-2" /><span>Upload Stamp / Seal</span></div>
              )}
              <input type="file" onChange={(e) => handleFileChange(e, 'stamp')} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 text-center">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 text-left">Authorized Signature</h3>
            <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center overflow-hidden relative cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition">
              {previews.signature ? (
                <img src={previews.signature} alt="Signature" className="h-full object-contain p-2" />
              ) : (
                <div className="text-slate-400 flex flex-col items-center"><ImageIcon className="w-8 h-8 mb-2" /><span>Upload Signature</span></div>
              )}
              <input type="file" onChange={(e) => handleFileChange(e, 'signature')} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteSettings;
