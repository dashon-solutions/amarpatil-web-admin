import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { getStories } from "../utils/api";
import { ArrowRight, BookOpen } from "lucide-react";
import PageHero from "../components/PageHero";

export default function StoriesPage() {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroImage, setHeroImage] = useState<string>("https://images.unsplash.com/photo-1490971588422-52f6262a237a?auto=format&fit=crop&w=1800&q=85");

  useEffect(() => {
    getStories()
      .then((data) => {
        const activeStories = data.filter((s: any) => s.isActive);
        setStories(activeStories);
        if (activeStories.length > 0) {
          const randomIndex = Math.floor(Math.random() * activeStories.length);
          setHeroImage(activeStories[randomIndex].mainImage);
        }
      })
      .catch((err) => console.error("Error loading stories list:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white min-h-screen">
      <PageHero
        title="Visual Chronicles"
        slogan="NARRATIVE VISUAL JOURNALISM"
        subtitle="EDITORIAL STORIES"
        description="Step inside the behind-the-scenes journals, design notes, and creative journeys of historic spaces."
        bgImage={heroImage}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-24">
        {loading ? (
          <div className="text-center py-20 text-navy-dark/40 font-bold uppercase tracking-widest animate-pulse">
            Curating Stories...
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-navy-dark/15 rounded-xs">
            <p className="font-secondary text-lg text-navy-dark italic">No stories have been published yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {stories.map((story, index) => (
              <motion.div
                key={story._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group flex flex-col justify-between"
              >
                <Link to={`/story/${story.slug}`} className="block relative overflow-hidden aspect-3/4 bg-navy-dark/5 shadow-md border border-navy-dark/5">
                  <div className="absolute inset-0 bg-navy-dark/0 group-hover:bg-navy-dark/15 transition-all duration-500 z-10 flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-3 group-hover:translate-y-0 z-20 bg-white/95 backdrop-blur-xs text-navy-dark font-primary text-[10px] tracking-widest uppercase font-semibold px-4 py-2 flex items-center space-x-2 border border-navy-dark/10">
                      <BookOpen className="w-3 h-3 text-gold-warm" />
                      <span>Open Narrative</span>
                    </span>
                  </div>
                  <img
                    src={story.mainImage}
                    alt={story.title}
                    className="w-full h-full object-cover transform duration-1000 ease-out group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                </Link>
                <div className="pt-6 space-y-3">
                  <h3 className="font-secondary text-xl font-bold text-navy-dark group-hover:text-gold-warm duration-300">
                    <Link to={`/story/${story.slug}`}>{story.title}</Link>
                  </h3>
                  <p className="text-navy-dark/70 text-xs sm:text-sm font-primary line-clamp-3 font-light leading-relaxed">
                    {story.shortDescription}
                  </p>
                  <div className="pt-2">
                    <Link
                      to={`/story/${story.slug}`}
                      className="inline-flex items-center space-x-2 text-[10px] uppercase tracking-widest font-bold text-gold-warm hover:text-navy-dark transition-colors duration-300"
                    >
                      <span>Read Story</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
