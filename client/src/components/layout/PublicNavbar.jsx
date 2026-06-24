import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function PublicNavbar({ settings }) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Portfolio", path: "/portfolio" },
    { name: "Stories", path: "/stories" },
    { name: "About", path: "/about" },
    { name: "Pricing", path: "/packages" },
    { name: "Contact", path: "/contact" },
  ];

  const businessName = settings?.businessName || "Aurelius";

  return (
    <nav className="fixed top-0 left-0 w-full z-50 transition-all duration-500">
      <div className="glass px-6 py-4 md:px-12 md:py-6 flex justify-between items-center">
        {/* Logo */}
        <Link to="/">
          <motion.div 
            className="text-2xl font-serif tracking-widest uppercase hover:text-luxury-crimson transition-colors flex items-center h-10"
            whileHover={{ scale: 1.05 }}
          >
            {settings?.logo ? (
              <img src={settings.logo} alt={businessName} className="h-full object-contain filter invert opacity-90" />
            ) : (
              businessName
            )}
          </motion.div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-12 items-center">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`text-xs uppercase tracking-[0.2em] font-medium transition-all relative group ${
                location.pathname === item.path ? "text-luxury-crimson" : "text-luxury-ink/60 hover:text-luxury-ink"
              }`}
            >
              {item.name}
              <span className={`absolute -bottom-2 left-0 h-[1px] bg-luxury-crimson transition-all duration-300 ${
                location.pathname === item.path ? "w-full" : "w-0 group-hover:w-full"
              }`} />
            </Link>
          ))}
          <Link to="/contact">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 bg-luxury-dark text-white text-[10px] uppercase tracking-[0.3em] hover:bg-luxury-crimson transition-colors"
            >
              Inquire
            </motion.button>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-luxury-bg md:hidden pt-32 pb-12 px-6 flex flex-col justify-between"
          >
            <div className="flex flex-col gap-8">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.path}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className="text-left block"
                  >
                    <span className={`text-4xl font-serif italic ${
                      location.pathname === item.path ? "text-luxury-crimson" : "text-luxury-ink"
                    }`}>
                      {item.name}
                    </span>
                    <p className="text-[8px] uppercase tracking-[0.4em] text-luxury-ink/40 mt-1">
                      {item.path === "/portfolio" ? "The Gallery" : item.path === "/contact" ? "Inquiry" : "Explore"}
                    </p>
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="space-y-4 border-t border-luxury-dark/10 pt-8">
              <p className="text-[10px] uppercase tracking-widest text-luxury-ink/60">New York Studio</p>
              <p className="text-[10px] uppercase tracking-widest text-luxury-ink/60">+1 212 555 0198</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
