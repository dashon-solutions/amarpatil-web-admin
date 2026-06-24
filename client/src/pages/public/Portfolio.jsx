import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";

export default function Portfolio() {
  const [galleries, setGalleries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [galRes, catRes] = await Promise.all([
          axiosInstance.get("/cms/gallery?public=true"),
          axiosInstance.get("/cms/category?public=true")
        ]);
        
        // Add pseudo-size for masonry layout
        const enhancedGalleries = (galRes.data || []).map((g, idx) => ({
          ...g,
          size: idx % 4 === 0 ? "wide" : idx % 3 === 0 ? "tall" : "square"
        }));
        
        setGalleries(enhancedGalleries);
        setCategories([{ name: "All", _id: "all" }, ...(catRes.data || [])]);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const filteredProjects = galleries.filter(p => filter === "All" || p.category?.name === filter || p.category === filter);

  return (
    <div className="pt-32 min-h-screen px-6 md:px-12 pb-32">
      <div className="max-w-screen-2xl mx-auto">
        <header className="mb-24 flex flex-col md:flex-row justify-between items-end gap-12">
          <div>
            <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-luxury-gold mb-4 block">Our Work</span>
            <h1 className="text-8xl md:text-9xl font-serif italic-small tracking-tighter">THE <br /> GALLERY</h1>
          </div>
          
          <div className="flex flex-wrap gap-4 md:gap-8 border-b border-luxury-dark/10 pb-4">
            {categories.map(cat => (
              <button
                key={cat._id}
                onClick={() => setFilter(cat.name)}
                className={`text-[10px] uppercase tracking-[0.2em] font-bold transition-all ${
                  filter === cat.name ? "text-luxury-crimson" : "text-luxury-ink/40 hover:text-luxury-ink"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </header>

        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 md:gap-12 auto-rows-[200px]"
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project) => (
              <motion.div
                key={project._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className={`group relative overflow-hidden rounded-2xl cursor-pointer shadow-xl ${
                  project.size === "tall" ? "lg:col-span-4 lg:row-span-3" : 
                  project.size === "wide" ? "lg:col-span-8 lg:row-span-2" : 
                  "lg:col-span-4 lg:row-span-2"
                }`}
              >
                <img 
                  src={project.image} 
                  alt={project.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-luxury-dark/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-luxury-gold font-bold mb-2">
                    {project.category?.name || "Portfolio"}
                  </span>
                  <h3 className="text-3xl font-serif text-white">{project.title}</h3>
                  <div className="h-[1px] w-0 group-hover:w-full bg-luxury-blue mt-4 transition-all duration-500" />
                </div>
              </motion.div>
            ))}
            {filteredProjects.length === 0 && (
              <div className="col-span-full text-center py-20 text-luxury-ink/40">
                No galleries found.
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
