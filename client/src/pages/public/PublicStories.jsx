import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import axiosInstance from "../../utils/axiosInstance";

export default function PublicStories() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const { data } = await axiosInstance.get("/cms/story?public=true");
        setStories(data);
      } catch (err) {
        console.error("Failed to fetch stories", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStories();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-32 bg-luxury-bg flex items-center justify-center font-serif text-2xl tracking-widest text-luxury-ink/60 uppercase">
        Loading Archive...
      </div>
    );
  }

  return (
    <div className="pt-32 min-h-screen pb-32 bg-luxury-surface">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
        <div className="mb-24">
          <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-luxury-gold mb-6 block">
            The Complete Archive
          </span>
          <h1 className="text-6xl md:text-8xl font-serif tracking-tighter leading-[0.9]">
            STORIES & <br /> <span className="italic text-luxury-crimson">EDITORIALS</span>
          </h1>
        </div>

        {stories.length === 0 ? (
          <div className="py-24 text-center font-serif text-2xl text-luxury-ink/40">
            No stories currently available.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {stories.map((story, index) => (
              <Link to={`/story/${story.slug}`} key={story._id} className="group cursor-pointer block">
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (index % 3) * 0.1, duration: 0.8 }}
                >
                  <div className="overflow-hidden rounded-2xl aspect-[4/5] mb-6 bg-black/5 shadow-lg">
                    <img 
                      src={story.mainImage} 
                      alt={story.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                    />
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] uppercase tracking-[0.3em] text-luxury-blue font-bold mb-2 block">
                        {story.shortDescription || "Editorial"}
                      </span>
                      <h3 className="text-2xl font-serif text-luxury-ink group-hover:text-luxury-crimson transition-colors">
                        {story.title}
                      </h3>
                    </div>
                    <span className="text-sm font-serif italic text-luxury-ink/30">
                      {(index + 1).toString().padStart(2, '0')}
                    </span>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
