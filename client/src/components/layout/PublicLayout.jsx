import React, { useEffect, useState } from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence, useScroll } from "framer-motion";
import axiosInstance from "../../utils/axiosInstance";

import PublicNavbar from "./PublicNavbar";
import PublicFooter from "./PublicFooter";

export default function PublicLayout() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await axiosInstance.get("/cms/site-settings");
        setSettings(data);
      } catch (err) {
        // console.error(err);
      } finally {
        // Simulate premium loading state for 1 second on initial load
        setTimeout(() => setLoading(false), 1000);
      }
    };
    fetchSettings();
  }, []);

  // Smooth scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] bg-luxury-dark flex flex-col items-center justify-center font-sans">
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           className="text-center"
        >
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-white text-4xl md:text-6xl font-serif tracking-[0.5em] mb-8 uppercase"
          >
            {settings?.siteName || "AURELIUS"}
          </motion.h2>
          <div className="w-48 h-[1px] bg-white/20 mx-auto relative overflow-hidden">
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-luxury-gold"
            />
          </div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-white/40 mt-8">Establishing Connectivity</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-luxury-bg font-sans selection:bg-luxury-crimson selection:text-white">
      {/* Dynamic Background Element */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-luxury-crimson/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-luxury-blue/5 blur-[150px] rounded-full" />
      </div>

      <PublicNavbar settings={settings} />
      
      {/* Scroll Progress Bar - Mobile Optimized */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-luxury-crimson z-[60] origin-left"
        style={{ scaleX: scrollYProgress }}
      />
      
      <main className="relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(10px)" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Pass settings context down to outlet pages */}
            <Outlet context={{ settings }} />
          </motion.div>
        </AnimatePresence>
      </main>

      <PublicFooter settings={settings} />

      {/* Floating CTA for high conversion */}
      <AnimatePresence>
        {location.pathname !== '/contact' && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 right-6 md:bottom-12 md:right-16 z-50"
          >
            <Link to="/contact" className="bg-luxury-crimson text-white px-6 py-4 md:px-8 md:py-5 rounded-full shadow-2xl flex items-center gap-3 md:gap-4 group">
              <span className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] font-bold">Inquire</span>
              <motion.div 
                whileHover={{ scale: 1.5 }}
                className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full transition-transform" 
              />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
