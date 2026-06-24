import React, { useState } from "react";
import { motion } from "framer-motion";
import { Send, MapPin, Phone, Mail } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/axiosInstance";

export default function Contact() {
  const { settings } = useOutletContext();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    shootType: "Editorial",
    message: ""
  });
  const [status, setStatus] = useState("idle");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    try {
      await axiosInstance.post("/leads", { 
        ...formData, 
        source: "contact_form",
      });
      setStatus("success");
      toast.success("Inquiry sent successfully!");
      setFormData({ name: "", email: "", shootType: "Editorial", message: "" });
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      toast.error("Failed to send inquiry.");
      setStatus("idle");
    }
  };

  return (
    <div className="pt-32 min-h-screen pb-32">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-24">
        
        {/* Left Side: Info */}
        <div className="lg:col-span-5 space-y-24">
          <div>
            <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-luxury-gold mb-6 block">Ready to start?</span>
            <h1 className="text-8xl md:text-9xl font-serif tracking-tighter leading-[0.8] mb-12">LET'S <br /> <span className="text-luxury-blue italic">TALK</span></h1>
            <p className="max-w-xs text-luxury-ink/60 leading-relaxed font-light">
              We take on a limited number of productions each month to ensure absolute focus on quality.
            </p>
          </div>

          <div className="space-y-12">
            <div className="flex gap-8 items-start group">
              <div className="w-12 h-12 bg-luxury-surface rounded-full flex items-center justify-center shrink-0 group-hover:bg-luxury-crimson transition-colors group-hover:text-white">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-2">Studio Location</h4>
                <p className="text-sm font-light text-luxury-ink/60">{settings?.contact?.address || "7th Avenue, 10011 Manhattan, New York"}</p>
              </div>
            </div>

            <div className="flex gap-8 items-start group">
              <div className="w-12 h-12 bg-luxury-surface rounded-full flex items-center justify-center shrink-0 group-hover:bg-luxury-blue transition-colors group-hover:text-white">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-2">Direct Line</h4>
                <p className="text-sm font-light text-luxury-ink/60">{settings?.contact?.phone || "+1 212 555 0198"}</p>
              </div>
            </div>

            <div className="flex gap-8 items-start group">
              <div className="w-12 h-12 bg-luxury-surface rounded-full flex items-center justify-center shrink-0 group-hover:bg-luxury-gold transition-colors group-hover:text-white">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-2">Email</h4>
                <p className="text-sm font-light text-luxury-ink/60">{settings?.contact?.email || "hello@aurelius.studio"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="lg:col-span-7 bg-white p-12 md:p-20 rounded-[3rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-luxury-crimson/5 blur-[120px] pointer-events-none" />
          
          <form className="space-y-12 relative z-10" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
              <div className="space-y-6">
                <label className="text-[10px] uppercase tracking-[0.4em] font-bold text-luxury-ink/40">Full Name</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-transparent border-b border-luxury-ink/10 pb-6 outline-none focus:border-luxury-crimson transition-colors font-serif text-2xl md:text-xl" 
                  placeholder="Alexander McQueen"
                />
              </div>
              <div className="space-y-6">
                <label className="text-[10px] uppercase tracking-[0.4em] font-bold text-luxury-ink/40">Email Address</label>
                <input 
                  required
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-transparent border-b border-luxury-ink/10 pb-6 outline-none focus:border-luxury-crimson transition-colors font-serif text-2xl md:text-xl" 
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div className="space-y-6">
              <label className="text-[10px] uppercase tracking-[0.4em] font-bold text-luxury-ink/40">Services</label>
              <div className="flex flex-wrap gap-3 pt-2">
                {["Editorial", "Campaign", "Portrait", "Commercial"].map(opt => (
                  <button 
                    key={opt}
                    type="button"
                    onClick={() => setFormData({...formData, shootType: opt})}
                    className={`px-6 py-4 md:px-8 md:py-3 rounded-full text-[9px] md:text-[10px] uppercase tracking-widest font-bold border transition-all ${
                      formData.shootType === opt 
                        ? "bg-luxury-dark text-white border-luxury-dark" 
                        : "border-luxury-ink/10 hover:border-luxury-blue"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <label className="text-[10px] uppercase tracking-[0.4em] font-bold text-luxury-ink/40">The Vision</label>
              <textarea 
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="w-full bg-transparent border-b border-luxury-ink/10 pb-6 outline-none focus:border-luxury-crimson transition-colors font-serif text-2xl md:text-xl resize-none" 
                placeholder="Tell us about the project..."
              />
            </div>

            <motion.button 
              type="submit"
              disabled={status === "sending" || status === "success"}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-8 bg-luxury-crimson text-white rounded-2xl flex items-center justify-center gap-6 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <span className="text-xs uppercase tracking-[0.5em] font-bold">
                {status === "idle" ? "Initiate Project" : status === "sending" ? "Initiating..." : "Initiated"}
              </span>
              <Send className="w-4 h-4 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" />
            </motion.button>

            <p className="text-[10px] text-center text-luxury-ink/30 uppercase tracking-widest">
              A reply will follow within 24 standard business hours.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
