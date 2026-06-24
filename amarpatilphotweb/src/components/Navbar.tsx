import { useState, useEffect } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useLocation } from "react-router-dom";
import { getSiteSettings } from "../utils/api";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isLightText = isScrolled || isHome;

  useEffect(() => {
    getSiteSettings()
      .then((data) => {
        if (data && data.businessName) {
          setSettings(data);
        }
      })
      .catch((err) => console.error("Error loading site settings in navbar:", err));

    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: "Home", to: "/" },
    { label: "Gallery", to: "/gallery" },
    { label: "Stories", to: "/stories" },
    { label: "About Us", to: "/about" },
    { label: "Contact Us", to: "/contact" }
  ];

  return (
    <>
      <header
        id="navbar-header"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
          ? "bg-[#0E4F44] backdrop-blur-md shadow-xs border-b border-navy-dark/10 py-4"
          : "bg-transparent py-6"
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          {/* Logo */}
          <Link
            id="navbar-logo-link"
            to="/"
            className="flex items-center space-x-1 group"
          >
            {settings?.logo ? (
              <img src={settings.logo} alt="Logo" className="h-[50px] w-[300px] object-cover mr-2" />
            ) : null}


          </Link>

          {/* Desktop Navigation Links */}
          <nav id="desktop-nav" className="hidden lg:flex items-center space-x-10">
            {navItems.map((item) => (
              <Link
                id={`nav-link-${item.label.toLowerCase().replace(" ", "-")}`}
                key={item.label}
                to={item.to}
                className={`relative font-primary text-xs tracking-widest uppercase font-medium duration-300 group py-1 ${isLightText ? "text-white/80 hover:text-white" : "text-white hover:text-gold-warm bg-white/10 hover:bg-white/20 border-white/20"
                  }`}
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-gold-warm transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Call to Action Desktop button */}
          <div className="hidden lg:flex items-center">
            <Link
              id="navbar-cta-btn"
              to="/contact"
              className={`inline-flex items-center space-x-2 text-xs uppercase tracking-widest font-semibold transition-colors duration-300 px-4 py-2 border rounded-sm ${isLightText
                ? "text-white hover:text-gold-warm bg-white/10 hover:bg-white/20 border-white/20"
                : "text-white hover:text-gold-warm bg-white/10 hover:bg-white/20 border-white/20"
                }`}
            >
              <span>Inquire</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Menu Trigger */}
          <button
            id="mobile-menu-trigger"
            onClick={() => setIsMobileMenuOpen(true)}
            className={`lg:hidden p-2 transition-colors focus:outline-hidden ${isLightText ? "text-white hover:text-gold-warm" : "text-[#0E4F44] hover:text-gold-warm"
              }`}
            aria-label="Open navigation menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              id="mobile-drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-navy-dark/40 z-50 backdrop-blur-xs"
            />

            {/* Content Drawer */}
            <motion.div
              id="mobile-drawer-container"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-85 bg-white z-50 shadow-2xl p-8 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-12 border-b border-navy-dark/10 pb-6">
                  <div className="flex flex-col">
                    {settings?.logo ? (
                      <img src={settings.logo} alt="Logo" className="h-[40px] w-auto object-contain" />
                    ) : (
                      <>
                        <span className="font-secondary text-xl font-bold tracking-widest text-navy-dark">
                          {settings?.businessName || "ATELIER"}
                        </span>
                        <span className="font-primary text-[9px] tracking-widest text-gold-warm uppercase">
                          Editorial Luxury
                        </span>
                      </>
                    )}
                  </div>
                  <button
                    id="mobile-menu-close"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 text-navy-dark hover:text-gold-warm transition-colors focus:outline-hidden"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav id="mobile-nav" className="flex flex-col space-y-6">
                  {navItems.map((item, index) => (
                    <motion.div key={item.label} className="w-full">
                      <Link
                        id={`mobile-nav-link-${item.label.toLowerCase().replace(" ", "-")}`}
                        to={item.to}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="font-secondary text-xl font-medium text-navy-dark hover:text-gold-warm tracking-wide transition-colors py-1 flex items-center justify-between w-full"
                      >
                        <span>{item.label}</span>
                        <span className="font-primary text-xs text-navy-dark/30 hover:text-gold-warm">
                          0{index + 1}
                        </span>
                      </Link>
                    </motion.div>
                  ))}
                </nav>
              </div>

              {/* Bottom Drawer Footer */}
              <div className="border-t border-navy-dark/10 pt-8">
                <p className="text-[10px] uppercase tracking-widest text-navy-dark/40 mb-3">
                  Inquiries & Bespoke Consultation
                </p>
                <a
                  href={`mailto:${settings?.contact?.email || "curator@ateliereditorial.com"}`}
                  className="font-secondary text-sm text-navy-dark hover:text-gold-warm transition-colors font-medium"
                >
                  {settings?.contact?.email || "curator@ateliereditorial.com"}
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
