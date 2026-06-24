import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axiosInstance from "../../utils/axiosInstance";

export default function About() {
  const [about, setAbout] = useState(null);
  const [team, setTeam] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aboutRes, teamRes] = await Promise.all([
          axiosInstance.get("/cms/about"),
          axiosInstance.get("/team")
        ]);
        setAbout(aboutRes.data);
        if (teamRes.data && teamRes.data.team) {
          setTeam(teamRes.data.team);
        }
      } catch (err) {
        console.error("Failed to fetch about page data");
      }
    };
    fetchData();
  }, []);

  return (
    <div className="pt-32 min-h-screen pb-32">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
        <header className="mb-24 md:mb-32 relative">
          <motion.h1 
             initial={{ x: -20, opacity: 0 }}
             animate={{ x: 0, opacity: 1 }}
             transition={{ duration: 1 }}
             className="text-[14vw] md:text-[12vw] font-serif leading-[0.8] tracking-tighter"
          >
            THE <br /> <span className="text-luxury-crimson">VISIONARY</span>
          </motion.h1>
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-full md:w-2/3 lg:w-1/2 aspect-square md:aspect-video rounded-3xl overflow-hidden -z-10 opacity-30 md:opacity-100 mix-blend-multiply transition-all">
             <img 
               src={about?.image || "https://picsum.photos/seed/photographer/1600/900"} 
               alt={about?.title || "Aurelius Studio"} 
               referrerPolicy="no-referrer"
               className="w-full h-full object-cover"
             />
          </div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-24 items-start">
          <div className="lg:col-span-5 space-y-8 md:space-y-12">
            <h2 className="text-3xl md:text-4xl font-serif leading-snug">
              {about?.title || "Based in New York City, Aurelius is an award-winning photography house specializing in High-Style Editorial."}
            </h2>
            <div className="flex gap-8 md:gap-12">
              <div className="space-y-2">
                <span className="text-3xl md:text-4xl font-serif">12+</span>
                <p className="text-[8px] md:text-[10px] uppercase tracking-widest text-luxury-ink/40">Exp.</p>
              </div>
              <div className="space-y-2">
                <span className="text-3xl md:text-4xl font-serif">250+</span>
                <p className="text-[8px] md:text-[10px] uppercase tracking-widest text-luxury-ink/40">Projects</p>
              </div>
              <div className="space-y-2">
                <span className="text-3xl md:text-4xl font-serif">18</span>
                <p className="text-[8px] md:text-[10px] uppercase tracking-widest text-luxury-ink/40">Awards</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 hidden lg:block h-64 border-l border-luxury-dark/10" />

          <div className="lg:col-span-6 space-y-12">
            {about?.description ? (
              <div className="space-y-6">
                {about.description.split('\n').map((paragraph, idx) => (
                  <p key={idx} className="text-xl text-luxury-ink/70 leading-relaxed font-light">
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : (
              <>
                <p className="text-xl text-luxury-ink/70 leading-relaxed font-light">
                  We believe that photography is more than just light hitting a sensor. It is the architectural alignment of shadow, emotion, and texture.
                </p>
                <p className="text-lg text-luxury-ink/60 leading-relaxed font-light">
                  Founded by Julian Aurelius in 2014, the studio has redefined visual standards for premium brands worldwide. Our approach combines classical art theory with modern cinematic lighting to create images that don't just capture attention—they command it.
                </p>
              </>
            )}
            
            <div className="pt-12">
              <h4 className="text-[10px] uppercase tracking-[0.4em] font-bold mb-8">The Team</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                {team.map(member => (
                  <div key={member._id} className="flex flex-col gap-2 cursor-pointer group">
                    <img 
                      src={member.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}`} 
                      alt={member.name}
                      className="w-20 h-20 object-cover rounded-full filter grayscale group-hover:grayscale-0 transition-all duration-300" 
                    />
                    <div>
                      <span className="text-xs uppercase tracking-widest font-medium group-hover:text-luxury-crimson transition-colors">
                        {member.name}
                      </span>
                      <p className="text-[9px] uppercase tracking-widest text-luxury-ink/40">{member.role}</p>
                    </div>
                  </div>
                ))}
                {team.length === 0 && (
                  <div className="col-span-full text-xs uppercase tracking-widest font-medium opacity-40">
                    No team members found.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Timeline/Awards Section */}
        <section className="mt-48">
          <h2 className="text-5xl font-serif mb-24 text-center">HONORS & PUBLISHED WORKS</h2>
          <div className="space-y-0">
            {[
              { year: "2025", title: "Awwwards Site of the Year", category: "Global Recognition" },
              { year: "2024", title: "Vogue Creative Choice", category: "Editorial Feature" },
              { year: "2023", title: "LensCulture Portrait Award", category: "Art Direction" },
              { year: "2022", title: "Muse Photography Award", category: "High Fashion" },
            ].map((award, i) => (
              <motion.div 
                key={i}
                whileHover={{ backgroundColor: "rgba(193, 18, 31, 0.03)" }}
                className="group flex flex-col md:flex-row justify-between items-center py-12 border-t border-luxury-dark/10 px-8 transition-colors cursor-pointer"
              >
                <div className="flex gap-12 items-center">
                  <span className="text-xl font-serif text-luxury-gold">{award.year}</span>
                  <h3 className="text-2xl md:text-3xl font-serif group-hover:pl-4 transition-all duration-300">{award.title}</h3>
                </div>
                <span className="text-[10px] uppercase tracking-[0.3em] text-luxury-ink/40 mt-4 md:mt-0 italic">{award.category}</span>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
