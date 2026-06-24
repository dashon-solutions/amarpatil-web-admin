import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function PublicFooter({ settings }) {
  const businessName = settings?.businessName || "Aurelius";
  const contact = settings?.contact || {};
  const social = settings?.socialLinks || {};

  return (
    <footer className="bg-luxury-dark text-white py-24 px-6 md:px-12 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 mb-24">
          <div className="space-y-8">
            {settings?.logo ? (
              <img src={settings.logo} alt={businessName} className="h-12 object-contain filter invert opacity-90" />
            ) : (
              <h3 className="font-serif text-3xl tracking-widest uppercase">{businessName}</h3>
            )}
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              {settings?.meta?.description || "Capturing the essence of high fashion and luxury editorial through a lens of artistic precision."}
            </p>
            <div className="flex gap-6">
              {social.instagram && (
                <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="group">
                  <svg className="w-5 h-5 fill-current text-white/60 group-hover:text-luxury-gold transition-colors" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </a>
              )}
              {social.facebook && (
                <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="group">
                  <svg className="w-5 h-5 fill-current text-white/60 group-hover:text-luxury-blue transition-colors" viewBox="0 0 24 24">
                    <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z"/>
                  </svg>
                </a>
              )}
              {social.youtube && (
                <a href={social.youtube} target="_blank" rel="noopener noreferrer" className="group">
                  <svg className="w-5 h-5 fill-current text-white/60 group-hover:text-luxury-crimson transition-colors" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.501 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.377.55 9.377.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              )}
              {social.whatsapp && (
                <a href={`https://wa.me/${social.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="group">
                  <svg className="w-5 h-5 fill-current text-white/60 group-hover:text-green-500 transition-colors" viewBox="0 0 24 24">
                    <path d="M12.031 0C5.394 0 .015 5.38.015 12.018c0 2.12.552 4.195 1.6 6.012L0 24l6.113-1.603a11.954 11.954 0 005.918 1.564h.005c6.634 0 12.013-5.381 12.013-12.019C24.048 5.38 18.666 0 12.031 0zm0 21.955h-.003c-1.785 0-3.535-.48-5.067-1.39l-.363-.215-3.766.987.998-3.673-.236-.376a9.998 9.998 0 01-1.528-5.32c0-5.522 4.494-10.016 10.019-10.016 5.523 0 10.017 4.494 10.017 10.016 0 5.523-4.494 10.018-10.017 10.018zm5.5-7.518c-.302-.15-1.786-.882-2.064-.984-.277-.101-.48-.15-.682.15-.202.302-.78 1.002-.956 1.203-.176.202-.353.226-.655.076-.302-.15-1.275-.47-2.43-1.5-1.013-.905-1.696-2.023-1.897-2.325-.202-.303-.021-.466.13-.616.135-.134.302-.353.453-.53.15-.176.202-.301.302-.503.101-.202.05-.378-.025-.529-.076-.15-.682-1.644-.935-2.253-.247-.59-.497-.509-.682-.519l-.58-.01c-.202 0-.53.076-.807.378-.277.303-1.058 1.034-1.058 2.52 0 1.487 1.084 2.923 1.235 3.125.151.202 2.132 3.256 5.166 4.565.722.312 1.285.498 1.724.638.723.23 1.382.197 1.902.12.583-.086 1.786-.73 2.038-1.436.252-.705.252-1.311.176-1.437-.076-.126-.277-.202-.58-.353z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/40">Navigation</h4>
            <ul className="space-y-4">
              {[
                { name: "Home", path: "/" },
                { name: "Portfolio", path: "/portfolio" },
                { name: "About", path: "/about" },
                { name: "Packages", path: "/packages" },
                { name: "Contact", path: "/contact" }
              ].map((item) => (
                <li key={item.name}>
                  <Link to={item.path} className="text-sm hover:text-luxury-crimson transition-colors flex items-center gap-2 group">
                    {item.name}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/40">Studio</h4>
            <p className="text-sm text-white/60 leading-loose whitespace-pre-line">
              {contact.address || "7th Avenue, 10011\nManhattan, NY"}<br />
              {contact.phone || "+1 212 555 0198"}<br />
              {contact.email || "hello@aurelius.studio"}
            </p>
          </div>
        </div>

        <div className="border-t border-white/10 pt-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
            © {new Date().getFullYear()} {businessName}. All Rights Reserved.
          </p>
          <div className="flex gap-8 text-[10px] uppercase tracking-[0.2em] text-white/40">
            <Link to="/contact" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>

        <motion.h2 
          initial={{ y: "100%" }}
          whileInView={{ y: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="text-center text-[10vw] leading-none font-serif tracking-tighter opacity-10 mt-12 pointer-events-none select-none uppercase truncate"
        >
          {businessName}
        </motion.h2>
      </div>
    </footer>
  );
}
