import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { STORY_DATA } from "../data";
import { getStories } from "../utils/api";
import { formatHeading } from "../utils/text";

interface StoryProps {
  isHomepage?: boolean;
}

export default function Story({ isHomepage = false }: StoryProps) {
  const [story, setStory] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStories()
      .then((data) => {
        const activeStories = data.filter((s: any) => s.isActive);
        if (activeStories.length > 0) {
          const homeStory = activeStories.find((s: any) => s.showOnHome);
          setStory(homeStory || activeStories[0]);
        }
      })
      .catch((err) => console.error("Error loading story:", err))
      .finally(() => setLoading(false));
  }, []);

  const paragraphs = story?.description
    ? story.description.split("\n\n").filter(Boolean)
    : STORY_DATA.paragraphs;

  const imageUrl = story?.mainImage || STORY_DATA.imageUrl;

  return (
    <section id="story" className="relative py-24 md:py-32 bg-white overflow-hidden border-t border-navy-dark/5">
      {/* Editorial Watermark background */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none select-none hidden xl:block opacity-5">
        <span className="text-[14vw] font-secondary font-extrabold text-navy-dark tracking-widest writing-vertical uppercase">
          LEGACY
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          
          {/* Left Column: Beautiful Media Cover */}
          <div className="lg:col-span-5 relative order-2 lg:order-1">
            {/* Elegant multi-layer frames like a fashion layout */}
            <div className="absolute -inset-4 border border-gold-warm/20 pointer-events-none" />
            <div className="absolute inset-0 border border-navy-dark/10 pointer-events-none translate-x-2 translate-y-2" />
            
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2 }}
              className="relative aspect-3/4 overflow-hidden shadow-2xl bg-navy-dark/5 group rounded-xs"
            >
              <img
                src={imageUrl}
                alt={story?.title || STORY_DATA.imageAlt}
                className="w-full h-full object-cover transform duration-1000 ease-out group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              {/* Gold light leak subtle overlay */}
              <div className="absolute inset-0 bg-linear-to-tr from-navy-dark/40 via-transparent to-gold-warm/15 opacity-80 mix-blend-multiply" />
            </motion.div>

            {/* Decorative Gold & Navy Lines underneath */}
            <div className="absolute -bottom-8 -left-8 w-24 h-1 bg-gold-warm" />
            <div className="absolute -bottom-10 -left-6 w-24 h-[1px] bg-navy-dark" />
          </div>

          {/* Right Column: Narrative Copy */}
          <div className="lg:col-span-7 flex flex-col space-y-8 order-1 lg:order-2">
            
            {/* Header section with Navy/Gold contrasted words */}
            <div className="space-y-4">
              <span className="text-gold-warm tracking-[0.3em] text-[10px] uppercase font-bold block">
                AN UNSETTLED QUEST FOR PURITY
              </span>
              
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-secondary font-bold tracking-tight text-navy-dark">
                {story ? formatHeading(story.title) : formatHeading(`Our Story *${STORY_DATA.subtitle}*`)}
              </h2>
              
              {/* Elegant dual-color ornamental line indicator */}
              <div className="flex items-center space-x-2 pt-2">
                <div className="h-[2px] w-12 bg-navy-dark" />
                <div className="h-[2px] w-6 bg-gold-warm" />
                <div className="h-[1px] w-24 bg-navy-dark/10" />
              </div>
            </div>

            {/* Paragraphs with high-fashion typographer size/weight ratio */}
            <div className="space-y-6 text-navy-dark/85 font-light leading-relaxed text-sm md:text-base max-w-2xl font-primary">
              {paragraphs.map((para: string, idx: number) => {
                if (idx === 0) {
                  return (
                    <p key={idx} className="text-lg font-secondary font-medium text-navy-dark italic leading-relaxed border-l-2 border-gold-warm pl-4 py-1">
                      {para}
                    </p>
                  );
                }
                return <p key={idx}>{para}</p>;
              })}
              <p className="text-xs tracking-wider uppercase opacity-75 font-semibold text-navy-dark flex items-center space-x-2">
                <span>Monte Carlo</span>
                <span className="text-gold-warm">•</span>
                <span>London</span>
                <span className="text-gold-warm">•</span>
                <span>Tokyo</span>
              </p>

              {isHomepage && story && (
                <div className="pt-4">
                  <Link
                    to={`/story/${story.slug}`}
                    className="inline-flex items-center space-x-2 px-6 py-3 border border-navy-dark text-navy-dark hover:bg-navy-dark hover:text-white font-primary text-xs tracking-widest uppercase font-semibold transition-all duration-300 rounded-sm"
                  >
                    <span>Discover Narrative</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Additional Editorial citation block mimicking print publication */}
            <div className="border-t border-navy-dark/10 pt-6 mt-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-navy-dark/40">Editorial Source</p>
                <p className="text-xs font-secondary font-semibold text-navy-dark">Aesthetic Integrity Reports, Vol. 14</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest text-navy-dark/40">Status Code</p>
                <p className="text-xs font-mono font-medium text-gold-warm">CERTIFIED MASTERCLASS</p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
