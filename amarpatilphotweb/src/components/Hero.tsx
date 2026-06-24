import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";
import { getBanners } from "../utils/api";
import { formatHeading } from "../utils/text";

export default function Hero() {
  const [banner, setBanner] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBanners()
      .then((data) => {
        const activeBanners = data.filter((b: any) => b.isActive);
        if (activeBanners.length > 0) {
          setBanner(activeBanners[0]);
        }
      })
      .catch((err) => console.error("Error loading banner:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full bg-navy-dark flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-gold-warm border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <section id="home" className="relative min-h-screen w-full flex items-center justify-center bg-navy-dark overflow-hidden">
      {/* Immersive Full-Bleed Background Visual and Overlays */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.img
          initial={{ scale: 1.12, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.55 }}
          transition={{ duration: 2.5, ease: "easeOut" }}
          src={banner?.mainImage || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=90"}
          alt={banner?.title || "Amar Patil Photography Luxury Banner"}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        {/* Soft luxury linear overlay blend */}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/15 to-transparent" />
        <div className="absolute inset-0 bg-black/40" />
      </div>



      <div className="max-w-7xl mx-auto px-6 md:px-12 py-32 flex flex-col justify-center relative z-10 w-full min-h-screen">
        <div className="max-w-4xl flex flex-col space-y-6 text-left">
          {/* Tagline / Slogan */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center space-x-3 text-gold-warm tracking-[0.3em] text-xs sm:text-sm uppercase font-semibold"
          >
            <span>{banner?.slogan || "CURATORS OF FINE ARTISTRY"}</span>
          </motion.div>

          {/* Subtitle */}
          {banner?.subtitle && (
            <motion.span
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-white/60 text-xs sm:text-sm tracking-[0.2em] uppercase font-light"
            >
              {banner.subtitle}
            </motion.span>
          )}

          {/* Main Title */}
          <div className="space-y-4">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2 }}
              className="text-4xl sm:text-6xl md:text-7.5xl font-secondary font-extrabold text-white leading-[1.1] tracking-tight"
            >
              {banner?.title ? (
                <span className="whitespace-pre-line">{formatHeading(banner.title)}</span>
              ) : (
                <>
                  Sculpting <span className="text-gold-warm font-light italic font-secondary">Light</span> & <br />
                  Capturing Emotion
                </>
              )}
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-white/80 text-base md:text-lg max-w-2xl font-light leading-relaxed font-primary"
            >
              {banner?.description || "Luxury, creativity, and excellence in every detail. We engineer rare visual landmarks that merge architectural accuracy with high-fashion aesthetics."}
            </motion.p>
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-5 pt-6"
          >
            <a
              id="hero-explore-story-btn"
              href={banner?.ctaLink || "#story"}
              className="relative inline-flex items-center justify-center space-x-3 bg-gold-warm text-navy-dark px-8 py-4 text-xs font-semibold uppercase tracking-widest hover:bg-white hover:text-navy-dark transition-all duration-500 rounded-sm shadow-lg hover:shadow-xl group"
            >
              <span>{banner?.ctaText || "Explore Story"}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 duration-300" />
            </a>

            <a
              id="hero-view-gallery-btn"
              href="#gallery"
              className="inline-flex items-center justify-center px-8 py-4 text-xs font-semibold uppercase tracking-widest text-white border border-white/20 hover:border-gold-warm hover:text-gold-warm transition-all duration-300 rounded-sm bg-transparent"
            >
              View Gallery
            </a>
          </motion.div>
        </div>
      </div>

      {/* Bottom Metadata & Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="absolute bottom-8 left-6 right-6 md:left-12 md:right-12 z-20 flex items-center justify-between border-t border-white/10 pt-6 text-white/50 text-[10px] tracking-widest uppercase"
      >
        <div className="flex space-x-12">
          <div>
            <span className="block text-[8px] text-white/30">Shoot By</span>
            <span className="font-semibold text-white/80 font-secondary">Amar Patil Studio</span>
          </div>
          <div>
            <span className="block text-[8px] text-white/30">Artistry</span>
            <span className="font-semibold text-white/80 font-secondary">Premium Photography</span>
          </div>
        </div>

        {/* Scroll Down Hint */}
        <button
          id="hero-scroll-btn"
          onClick={() => {
            const nextSec = document.getElementById("story") || document.getElementById("gallery");
            if (nextSec) {
              nextSec.scrollIntoView({ behavior: "smooth" });
            }
          }}
          className="hidden sm:flex items-center space-x-2 text-white/40 hover:text-gold-warm duration-300 transition-colors focus:outline-hidden group"
          aria-label="Scroll to content"
        >
          <span className="group-hover:translate-y-0.5 duration-300">Scroll Down</span>
          <span className="w-8 h-[1px] bg-white/20 group-hover:bg-gold-warm duration-300" />
        </button>
      </motion.div>
    </section>
  );
}
