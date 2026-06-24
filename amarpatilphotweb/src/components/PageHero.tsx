import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
import { formatHeading } from "../utils/text";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  slogan?: string;
  description?: string;
  bgImage: string;
}

export default function PageHero({
  title,
  subtitle,
  slogan,
  description,
  bgImage
}: PageHeroProps) {
  return (
    <section className="relative h-[65vh] w-full flex items-center justify-center bg-navy-dark overflow-hidden">
      {/* Immersive Background Image and Overlays */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {bgImage ? (
          <motion.img
            key={bgImage}
            initial={{ scale: 1.12, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.55 }}
            transition={{ duration: 2.2, ease: "easeOut" }}
            src={bgImage}
            alt={title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-navy-dark/90" />
        )}
        {/* Soft luxury linear overlay blend */}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/65 to-transparent" />
        <div className="absolute inset-0 bg-black/35" />
      </div>

      {/* Decorative background text */}
      <div className="absolute top-24 left-0 right-0 pointer-events-none select-none text-center hidden md:block z-5">
        <span className="text-[10vw] font-secondary text-white/[0.015] uppercase tracking-[0.25em] leading-none">
          ATELIER
        </span>
      </div>

      {/* Editorial Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 w-full text-left pt-16">
        <div className="max-w-3xl flex flex-col space-y-5">
          {/* Tagline / Slogan */}
          {slogan && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center space-x-2.5 text-gold-warm tracking-[0.3em] text-xs uppercase font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5 text-gold-warm animate-pulse" />
              <span>{slogan}</span>
            </motion.div>
          )}

          {/* Subtitle */}
          {subtitle && (
            <motion.span
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-white/60 text-xs tracking-[0.2em] uppercase font-light"
            >
              {subtitle}
            </motion.span>
          )}

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="text-3xl sm:text-5xl md:text-6.5xl font-secondary font-extrabold text-white leading-[1.1] tracking-tight"
          >
            {formatHeading(title)}
          </motion.h1>

          {/* Description */}
          {description && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-white/80 text-sm sm:text-base max-w-2xl font-light leading-relaxed font-primary"
            >
              {description}
            </motion.p>
          )}
        </div>
      </div>
    </section>
  );
}
