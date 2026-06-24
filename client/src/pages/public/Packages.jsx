import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";

export default function Packages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axiosInstance.get("/cms/package");
        // Color assignments for luxury feel
        const colors = ["bg-luxury-blue", "bg-luxury-crimson", "bg-luxury-gold"];
        const enhancedPackages = (data || []).map((pkg, idx) => ({
          ...pkg,
          color: colors[idx % colors.length],
          popular: idx === 1 // Make the second one popular by default
        }));
        setPackages(enhancedPackages);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="pt-32 min-h-screen pb-32">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
        <header className="text-center mb-32">
          <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-luxury-gold mb-6 block">Invest in Art</span>
          <h1 className="text-7xl md:text-9xl font-serif tracking-tighter mb-12">PRICING <br /> <span className="italic-small font-italic">STRUCTURE</span></h1>
          <p className="max-w-xl mx-auto text-luxury-ink/60 leading-relaxed font-light">
            Luxury is an investment in storytelling. Each package is tailored to provide a seamless experience from conception to high-fidelity output.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {packages.map((pkg) => {
            const variant = pkg.variants && pkg.variants[0] ? pkg.variants[0] : null;
            return (
              <motion.div
                key={pkg._id}
                whileHover={{ y: -10 }}
                className={`relative flex flex-col p-8 md:p-12 border ${
                  pkg.popular ? "border-luxury-crimson shadow-2xl z-10" : "border-luxury-dark/10"
                } rounded-3xl bg-white overflow-hidden`}
              >
                {pkg.popular && (
                  <div className="absolute top-0 right-0 py-2 px-8 bg-luxury-crimson text-white text-[10px] uppercase tracking-[0.3em] font-bold rotate-45 translate-x-[25%] translate-y-[50%]">
                    Most Preferred
                  </div>
                )}
                
                <div className="mb-12">
                  <span className={`w-3 h-3 rounded-full mb-6 block ${pkg.color}`} />
                  <h3 className="text-4xl font-serif mb-2">{pkg.title}</h3>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-luxury-ink/40 font-bold">{pkg.category}</p>
                </div>

                <div className="mb-12">
                  <span className="text-5xl font-serif">{variant ? `₹${variant.sellingPrice}` : "Custom"}</span>
                  <p className="text-sm text-luxury-ink/60 mt-4 leading-relaxed line-clamp-3 h-20 overflow-hidden">
                    {pkg.description || "Premium photography package designed to capture your most essential moments with style and precision."}
                  </p>
                </div>

                <div className="flex-grow space-y-6 mb-12">
                  {(variant ? variant.features : ["Professional Consultation", "Private Online Gallery"]).map((feat, i) => (
                    <div key={i} className="flex gap-4 items-center">
                      <Check className={`w-4 h-4 shrink-0 ${pkg.popular ? "text-luxury-crimson" : "text-luxury-ink/40"}`} />
                      <span className="text-sm font-light text-luxury-ink/80">{feat}</span>
                    </div>
                  ))}
                </div>

                <Link to="/contact">
                  <button className={`w-full py-6 rounded-xl flex items-center justify-center gap-4 group transition-all ${
                    pkg.popular 
                      ? "bg-luxury-crimson text-white hover:bg-luxury-dark" 
                      : "bg-luxury-dark text-white hover:bg-luxury-gold"
                  }`}>
                    <span className="text-[10px] uppercase tracking-[0.4em] font-bold">Select Vision</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                  </button>
                </Link>
              </motion.div>
            );
          })}

          {packages.length === 0 && !loading && (
            <div className="col-span-full text-center py-12 text-luxury-ink/60">
              Pricing details will be available soon.
            </div>
          )}
        </div>

        {/* Custom Inquiry */}
        <section className="mt-32 p-12 md:p-24 bg-luxury-dark rounded-[3rem] text-white flex flex-col md:flex-row justify-between items-center gap-12">
           <div className="max-w-xl">
             <h2 className="text-4xl md:text-5xl font-serif mb-8 italic">NEED SOMETHING <br /> BESPOKE?</h2>
             <p className="text-white/60 leading-relaxed font-light">
               We often handle complex international productions that require custom logistical and creative planning. Reach out for a tailored proposal.
             </p>
           </div>
           <Link to="/contact">
             <motion.button 
               whileHover={{ scale: 1.05 }}
               className="px-12 py-8 border border-white/20 rounded-full text-xs uppercase tracking-[0.3em] font-bold hover:bg-white hover:text-luxury-dark transition-all"
             >
               Direct Inquiry
             </motion.button>
           </Link>
        </section>
      </div>
    </div>
  );
}
