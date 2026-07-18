import { useEffect, useState } from "react";
import AboutUs from "../components/AboutUs";
import PageHero from "../components/PageHero";
import { motion } from "motion/react";
import { Eye, ShieldCheck, HeartHandshake } from "lucide-react";
import { getTeam, getSiteSettings } from "../utils/api";
import { formatHeading } from "../utils/text";

// DEVELOPER CONFIGURATION FLAG
// Set this to true to enable the Team Section on the About Page, or false to hide it globally.
const SHOW_TEAM_FLAG = true;

export default function AboutPage() {
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [showTeam, setShowTeam] = useState(false);

  useEffect(() => {
    if (!SHOW_TEAM_FLAG) {
      setShowTeam(false);
      return;
    }

    Promise.all([
      getSiteSettings().catch((err) => {
        console.error("Failed to load site settings from API:", err);
        return { showTeam: true }; // Default fallback
      }),
      getTeam().catch((err) => {
        console.error("Failed to load team members from API:", err);
        return { success: false, team: [] };
      })
    ])
      .then(([settings, teamData]) => {
        const isTeamEnabled = settings && settings.showTeam !== false;
        if (isTeamEnabled && teamData && teamData.success && Array.isArray(teamData.team) && teamData.team.length > 0) {
          setTeamMembers(teamData.team);
          setShowTeam(true);
        } else {
          setShowTeam(false);
        }
      })
      .catch((err) => {
        console.error("Failed to resolve team rendering data:", err);
        setShowTeam(false);
      });
  }, []);

  const philosophyItems = [
    {
      icon: <Eye className="w-5 h-5 text-gold-warm" />,
      title: "The Editorial Eye",
      description: "Custom composition, natural light framing, and cinematic color palettes designed to isolate and elevate. We capture subjects not just as they are, but as timeless works of art."
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-gold-warm" />,
      title: "The Archival Standard",
      description: "We print exclusively on fine-art museum-grade cotton papers, using custom leather albums and true-tonal ink coordinates built to persist for generations."
    },
    {
      icon: <HeartHandshake className="w-5 h-5 text-gold-warm" />,
      title: "Uncompromised Discretion",
      description: "We value the privacy of our distinguished clients. Absolute NDA/confidential client protocols and silent, concierge-style service on commission sites globally."
    }
  ];

  return (
    <div className="bg-white min-h-screen">
      <PageHero
        title="Our Philosophy"
        slogan="THE ART OF OBSERVATION"
        subtitle="ABOUT AMAR PATIL PHOTOGRAPHY"
        description="A legacy of custom craftsmanship, uncompromised standards, and quiet luxury in visual journalism."
        bgImage="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=1800&q=85"
      />
      
      {/* Section 1: Intro Profile & Stats */}
      <AboutUs />

      {/* Section 2: Core Philosophy */}
      <section className="py-24 bg-[#0E4F44]/5 border-t border-b border-navy-dark/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="space-y-4 mb-16 text-center max-w-2xl mx-auto">
            <span className="text-gold-warm tracking-[0.3em] text-[10px] uppercase font-bold block">
              OUR GUIDING PRINCIPLES
            </span>
            <h2 className="text-3xl sm:text-4xl font-secondary font-bold text-navy-dark">
              {formatHeading("Photography Philosophy")}
            </h2>
            <div className="h-[1.5px] w-20 bg-gold-warm mx-auto pt-1" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {philosophyItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white border border-navy-dark/5 p-8 shadow-xs rounded-xs hover:border-gold-warm duration-300 flex flex-col space-y-4 text-left"
              >
                <div className="w-10 h-10 rounded-full bg-gold-warm/10 flex items-center justify-center">
                  {item.icon}
                </div>
                <h3 className="font-secondary text-lg font-bold text-navy-dark">
                  {item.title}
                </h3>
                <p className="text-navy-dark/70 text-xs sm:text-sm font-primary font-light leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Our Team (Renders dynamically based on SHOW_TEAM_FLAG and API data presence) */}
      {showTeam && teamMembers.length > 0 && (
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="space-y-4 mb-16 text-center max-w-2xl mx-auto">
              <span className="text-gold-warm tracking-[0.3em] text-[10px] uppercase font-bold block">
                THE CREATIVE DIRECTORS
              </span>
              <h2 className="text-3xl sm:text-4xl font-secondary font-bold text-navy-dark">
                {formatHeading("Our Team")}
              </h2>
              <div className="h-[1.5px] w-20 bg-gold-warm mx-auto pt-1" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member._id || index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="group flex flex-col justify-between space-y-6 text-left"
                >
                  {/* Photo wrapper */}
                  <div className="relative aspect-[3/4] overflow-hidden bg-navy-dark/5 shadow-md border border-navy-dark/5 rounded-xs">
                    <img
                      src={member.photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"}
                      alt={member.name}
                      className="w-full h-full object-cover transform duration-1000 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/45 via-transparent to-transparent pointer-events-none" />
                  </div>

                  {/* Details */}
                  <div className="space-y-2">
                    <span className="text-gold-warm font-primary text-[10px] tracking-widest uppercase font-bold">
                      {member.skills && member.skills.length > 0 ? member.skills.join(" • ") : "Creative Partner"}
                    </span>
                    <h3 className="font-secondary text-xl font-bold text-navy-dark">
                      {member.name}
                    </h3>
                    <p className="text-navy-dark/70 text-xs sm:text-sm font-primary font-light leading-relaxed">
                      {member.notes || "Professional curator and collaborative visual partner at Amar Patil Photography."}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
