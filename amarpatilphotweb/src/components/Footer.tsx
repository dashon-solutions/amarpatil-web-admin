import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUp } from "lucide-react";
import { getSiteSettings } from "../utils/api";

export default function Footer() {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    getSiteSettings()
      .then((data) => {
        if (data && data.businessName) {
          setSettings(data);
        }
      })
      .catch((err) => console.error("Error loading site settings in footer:", err));
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const footerItems = [
    { label: "Home", to: "/" },
    { label: "Gallery", to: "/gallery" },
    { label: "Stories", to: "/stories" },
    { label: "About Us", to: "/about" },
    { label: "Contact Us", to: "/contact" }
  ];

  return (
    <footer id="footer-section" className="bg-[#0E4F44] text-white/90 border-t border-white/10 py-10 md:py-12">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-8">

        {/* Left: Logo, copyright, dev credits */}
        <div className="flex flex-col items-center md:items-start space-y-3 text-center md:text-left">
          {/* Logo container */}
          <div className="mb-1">
            {settings?.logo ? (
              <img src={settings.logo} alt="Logo" className="h-[50px] w-[300px] object-cover mr-2" />
            ) : (
              <span className="font-secondary text-xl font-bold tracking-widest text-white">
                {settings?.businessName || "ATELIER"}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-[10px] text-white/50 tracking-wider">
            <span>© {new Date().getFullYear()} {settings?.businessName || "Amar Patil Photography"}. All rights reserved.</span>
          </div>

          <div className="text-[10px] text-white/40 tracking-wider font-primary">
            Developed by{" "}
            <a
              href="https://www.dashonsolutions.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-warm hover:text-white duration-300 font-semibold underline underline-offset-2"
            >
              Dashon Solutions Pvt. Ltd.
            </a>
          </div>
        </div>

        {/* Right: Nav Links + Scroll to Top */}
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <nav className="flex flex-wrap justify-center items-center gap-4 sm:gap-6">
            {footerItems.map((item) => (
              <Link
                id={`footer-link-${item.label.toLowerCase().replace(" ", "-")}`}
                key={item.label}
                to={item.to}
                className="font-primary text-[10px] text-white/70 hover:text-gold-warm duration-300 transition-colors uppercase tracking-widest font-semibold"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <button
            id="scroll-to-top-btn"
            onClick={scrollToTop}
            className="p-2 bg-white/10 hover:bg-gold-warm hover:text-navy-dark text-white duration-300 rounded-full cursor-pointer shadow-sm animate-none"
            aria-label="Back to Top"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </footer>
  );
}
