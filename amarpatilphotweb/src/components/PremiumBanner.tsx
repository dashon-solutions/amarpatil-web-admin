import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { getBanners } from "../utils/api";
import { formatHeading } from "../utils/text";

export default function PremiumBanner() {
  const [banner, setBanner] = useState<any>(null);

  useEffect(() => {
    getBanners()
      .then((data) => {
        const activeBanners = data.filter((b: any) => b.isActive);
        if (activeBanners.length > 1) {
          setBanner(activeBanners[1]);
        } else if (activeBanners.length > 0) {
          setBanner(activeBanners[0]);
        }
      })
      .catch((err) => console.error("Error loading premium banner:", err));
  }, []);

  const title = banner?.title || "Excellence Refined";
  const slogan = banner?.slogan || "THE PINNACLE OF MASTERWORK";
  const description = banner?.description || "Where uncompromised standard of craftsmanship is sculpted into physical and visual reality.";
  const bgImage = banner?.mainImage || "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1800&q=85";

  return (
    <section id="banner" className="relative h-[450px] md:h-[550px] flex items-center justify-center bg-navy-dark overflow-hidden">
      {/* Immersive parallax background container */}
      <div className="absolute inset-0 z-0">
        <img
          src={bgImage}
          alt={title}
          className="w-full h-full object-cover opacity-35 scale-105"
          referrerPolicy="no-referrer"
        />
        {/* Subtle royal overlay with deep midnight gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-navy-dark/95 via-navy-dark/80 to-navy-dark/95 mix-blend-multiply" />
      </div>

      {/* Centered Typography layout */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex justify-center items-center space-x-3"
        >
          <div className="h-[1px] w-8 bg-gold-warm" />
          <span className="text-gold-warm text-[10px] tracking-[0.3em] uppercase font-bold">
            {slogan}
          </span>
          <div className="h-[1px] w-8 bg-gold-warm" />
        </motion.div>

        <motion.h3
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.1 }}
          className="font-secondary text-4xl sm:text-5xl md:text-6.5xl font-black text-white tracking-tight"
        >
          {banner?.title ? (
            formatHeading(banner.title)
          ) : (
            formatHeading("Excellence *Refined*")
          )}
        </motion.h3>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-md mx-auto"
        >
          <p className="text-white/80 font-primary font-light text-xs sm:text-sm tracking-wider uppercase leading-relaxed">
            {description}
          </p>
        </motion.div>

        {/* Minimal luxury mark underneath */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.5 }}
          className="pt-4 flex justify-center"
        >
          <div className="w-8 h-8 rounded-full border border-gold-warm/40 flex items-center justify-center">
            <span className="font-secondary text-[10px] font-bold text-gold-warm">A</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
