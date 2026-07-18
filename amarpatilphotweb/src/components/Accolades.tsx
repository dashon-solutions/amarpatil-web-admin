import { motion } from "motion/react";
import { Eye, ShieldCheck, Award } from "lucide-react";

export default function Accolades() {
  const pillars = [
    {
      icon: <Eye className="w-8 h-8 stroke-[1] text-gold-warm" />,
      title: "The Editorial Aesthetic",
      desc: "Inspired by global luxury editorial catalogs. We blend cinematic lighting, thoughtful styling, and medium-format precision to craft visual poetry."
    },
    {
      icon: <ShieldCheck className="w-8 h-8 stroke-[1] text-gold-warm" />,
      title: "The Quiet Philosophy",
      desc: "An unobtrusive, photojournalistic approach. We capture the genuine, unscripted emotional details of your legacy without breaking the raw ambiance."
    },
    {
      icon: <Award className="w-8 h-8 stroke-[1] text-gold-warm" />,
      title: "The Archival Legacy",
      desc: "Crafted for generations. From museum-grade fine art cotton prints to hand-bound Italian leather albums, we guarantee physical permanence."
    }
  ];

  return (
    <section id="branding-identity" className="bg-white py-12 border-t border-b border-navy-dark/5">
      <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
        {/* Elegant typography header */}
        <div className="space-y-4 mb-20">
          <p className="text-xs uppercase tracking-[0.3em] text-gold-warm font-semibold">
            THE SIGNATURE BRAND
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-secondary font-black tracking-tight text-navy-dark">
            Amar Patil <span className="text-gold-warm font-light italic">Photography</span>
          </h2>
          <p className="text-navy-dark/65 text-sm sm:text-base font-primary max-w-2xl mx-auto font-light leading-relaxed">
            Bespoke documentation for high-profile clients, visionary families, and editorial publishers. We preserve heritage by capturing visual journeys with uncompromised craftsmanship.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {pillars.map((pillar, index) => (
            <motion.div
              id={`brand-pillar-${index}`}
              key={index}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="group relative border border-navy-dark/10 p-10 flex flex-col items-center text-center min-h-[300px] justify-start hover:border-gold-warm duration-500 bg-white shadow-xs rounded-xs"
            >
              {/* Inner gold frame border */}
              <div className="absolute inset-2 border border-transparent group-hover:border-gold-warm/15 duration-500 pointer-events-none" />

              {/* Icon Emblem */}
              <div className="p-4 bg-navy-dark/5 group-hover:bg-gold-warm/10 rounded-full duration-500 mb-6">
                {pillar.icon}
              </div>

              {/* Pillar Content */}
              <div className="space-y-3">
                <h3 className="font-secondary text-lg font-bold text-navy-dark group-hover:text-gold-warm duration-300">
                  {pillar.title}
                </h3>
                <p className="text-navy-dark/65 text-xs sm:text-sm font-primary font-light leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Brand Alliances & Press Coverage */}
        <div id="brand-alliances" className="mt-20 pt-12 border-t border-navy-dark/10">
          <p className="text-[9px] uppercase tracking-[0.25em] text-navy-dark/40 mb-8 font-bold">
            Curated Press Coverage & Brand Alliances
          </p>
          <div className="flex flex-wrap items-center justify-center gap-10 md:gap-20 opacity-40 hover:opacity-75 transition-opacity duration-500">
            <span className="font-secondary text-lg md:text-xl font-bold tracking-widest text-[#0c0d0e]">
              VOGUE
            </span>
            <span className="font-secondary text-lg md:text-xl italic font-black tracking-widest text-[#151515]">
              AD
            </span>
            <span className="font-secondary text-lg md:text-xl font-medium tracking-tight text-[#0a1128]">
              Bazaar
            </span>
            <span className="font-secondary text-base md:text-lg font-bold tracking-widest text-[#242424] uppercase">
              GOURMET
            </span>
            <span className="font-secondary text-lg md:text-xl italic tracking-wide text-navy-dark">
              ELLE
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
