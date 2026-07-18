import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { STAT_CARDS } from "../data";
import { Sparkles, Calendar, Heart, Shield } from "lucide-react";
import { getAbout } from "../utils/api";
import { formatHeading } from "../utils/text";

export default function AboutUs() {
  const [about, setAbout] = useState<any>(null);

  useEffect(() => {
    getAbout()
      .then((data) => {
        if (data && data.description) {
          setAbout(data);
        }
      })
      .catch((err) => console.error("Error loading about details:", err));
  }, []);

  const getSubIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Calendar className="w-4 h-4 text-gold-warm" />;
      case 1:
        return <Heart className="w-4 h-4 text-gold-warm" />;
      case 2:
        return <Shield className="w-4 h-4 text-gold-warm" />;
      default:
        return <Sparkles className="w-4 h-4 text-gold-warm" />;
    }
  };

  const paragraphs = about?.description
    ? about.description.split("\n\n").filter(Boolean)
    : [
      "We are a multi-disciplinary design and editorial firm curated to elevate premium brands. Inspired by architectural balance and classic typography, we orchestrate experiences that cultivate trust and command premium authority.",
      "Our philosophy honors four core milestones of creation: absolute structural experience, patient materials craftsmanship, uncompromised raw quality check, and modern aesthetic innovation."
    ];

  const title = about?.title || "About Us";
  const imageUrl = about?.image || "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=85";

  return (
    <section id="about" className="py-12 md:py-16 bg-white relative overflow-hidden border-t border-navy-dark/5">
      {/* Editorial Watermark background */}
      <div className="absolute left-6 bottom-12 pointer-events-none select-none hidden xl:block opacity-5">
        <span className="text-[12vw] font-secondary font-black text-navy-dark tracking-[0.2em] leading-none uppercase">
          PURITY
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">

          {/* Left Column: Professional Brand Image */}
          <div className="lg:col-span-5 relative order-2 lg:order-1">
            <div className="absolute top-4 right-4 bottom-4 left-4 border border-gold-warm/25 pointer-events-none z-10" />
            <div className="absolute -inset-4 border border-navy-dark/10 pointer-events-none" />

            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1 }}
              className="relative aspect-4/5 md:aspect-3/4 lg:aspect-4/5 overflow-hidden shadow-2xl bg-navy-dark/5 rounded-xs"
            >
              <img
                src='/amru_patil.jpg'
                alt={title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {/* Subtle visual gradient */}
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-navy-dark/35 to-transparent z-10 pointer-events-none" />
            </motion.div>

            {/* Accent Gold Banner badge representing strict architectural standards */}
            <div className="absolute -bottom-6 -right-6 lg:right-6 bg-navy-dark border border-gold-warm p-6 text-white max-w-sm shadow-xl rounded-sm z-20">
              <span className="text-gold-warm block font-mono text-[9px] tracking-[0.25em] font-semibold uppercase">
                Our Guarantee
              </span>
              <p className="font-secondary text-sm italic font-medium mt-1">
                “True design is the physical manifest of silence and geometry.”
              </p>
            </div>
          </div>

          {/* Right Column: Content Intro with Stat Cards */}
          <div className="lg:col-span-7 space-y-10 order-1 lg:order-2">
            <div className="space-y-4">
              <span className="text-gold-warm tracking-[0.3em] text-[10px] uppercase font-bold block">
                MEET THE MODERN ATELIER
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-secondary font-black tracking-tight text-navy-dark">
                {formatHeading(title)}
              </h2>
              <div className="flex items-center space-x-2 pt-1">
                <div className="h-[2px] w-14 bg-navy-dark" />
                <div className="h-[2px] w-6 bg-gold-warm" />
              </div>
            </div>

            {/* Introduction paragraphs */}
            <div className="space-y-6 text-navy-dark/75 font-light leading-relaxed text-sm md:text-base font-primary max-w-2xl">
              {paragraphs.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>

            {/* Structured Metric Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {STAT_CARDS.map((stat, index) => (
                <motion.div
                  id={`stat-card-${index}`}
                  key={index}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.08 }}
                  className="bg-white border border-navy-dark/10 p-6 flex flex-col justify-between hover:border-gold-warm duration-300 shadow-xs relative overflow-hidden"
                >
                  {/* Decorative faint icon */}
                  <div className="absolute top-4 right-4 opacity-15">
                    {getSubIcon(index)}
                  </div>

                  <div>
                    <span className="block font-secondary text-3xl md:text-4xl font-extrabold text-navy-dark tracking-tight">
                      {stat.value}
                    </span>
                    <span className="block font-primary text-[10px] tracking-widest text-gold-warm uppercase font-bold mt-1.5">
                      {stat.label}
                    </span>
                  </div>
                  <p className="text-navy-dark/60 text-xs font-light font-primary mt-3 leading-relaxed">
                    {stat.description}
                  </p>
                </motion.div>
              ))}
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
