import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";

export default function StoryDetails() {
  const { slug } = useParams();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Lightbox State
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const { data } = await axiosInstance.get(`/cms/story/${slug}`);
        setStory(data);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchStory();
  }, [slug]);

  const openLightbox = (index) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  
  const nextImage = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev + 1) % story.galleryImages.length);
  };
  
  const prevImage = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev - 1 + story.galleryImages.length) % story.galleryImages.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-32 bg-luxury-bg flex items-center justify-center font-serif text-2xl tracking-widest text-luxury-ink/60 uppercase">
        Loading...
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="min-h-screen pt-32 pb-32 bg-luxury-bg flex flex-col items-center justify-center">
        <h1 className="text-4xl md:text-6xl font-serif text-luxury-ink mb-8">Story Not Found</h1>
        <Link to="/" className="text-luxury-crimson hover:text-luxury-dark uppercase tracking-widest text-xs font-bold transition-colors flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-luxury-bg min-h-screen pb-32">
      
      {/* 1. HERO SECTION */}
      <section className="relative h-[80vh] flex flex-col justify-end overflow-hidden px-6 md:px-12 pb-12">
        <motion.div initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.5 }} className="absolute inset-0 z-0">
          <img src={story.mainImage} alt={story.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-luxury-dark via-luxury-dark/40 to-transparent"></div>
        </motion.div>

        <div className="relative z-10 max-w-screen-2xl mx-auto w-full">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mb-8">
            <Link to="/#stories" className="text-white/60 hover:text-white flex items-center gap-2 uppercase tracking-widest text-[10px] font-bold transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Collection
            </Link>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="text-6xl md:text-8xl lg:text-[10rem] font-serif text-white tracking-tighter leading-[0.85] mb-6">
            {story.title}
          </motion.h1>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="flex flex-col md:flex-row gap-6 md:gap-12 items-start md:items-center">
            <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-luxury-gold">
              {story.shortDescription}
            </span>
            <div className="hidden md:block h-[1px] w-24 bg-white/20"></div>
          </motion.div>
        </div>
      </section>

      {/* 2. CONTENT SECTION */}
      {(story.description || story.sideImage) && (
        <section className="py-24 md:py-32 px-6 md:px-12 max-w-screen-2xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
            {story.description && (
              <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="lg:col-span-6 space-y-8">
                <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-luxury-crimson mb-8 block">The Narrative</span>
                <div className="whitespace-pre-wrap text-xl md:text-2xl text-luxury-ink/70 font-light leading-relaxed font-serif">
                  {story.description}
                </div>
              </motion.div>
            )}
            
            {story.sideImage && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="lg:col-span-6 relative aspect-[3/4] overflow-hidden rounded-[2rem] shadow-2xl">
                <img src={story.sideImage} alt="Story Detail" className="w-full h-full object-cover" />
              </motion.div>
            )}
          </div>
        </section>
      )}

      {/* 3. GALLERY GRID */}
      {story.galleryImages && story.galleryImages.length > 0 && (
        <section className="py-24 px-6 md:px-12 bg-luxury-surface border-t border-luxury-dark/5">
          <div className="max-w-screen-2xl mx-auto">
            <div className="mb-24 flex flex-col md:flex-row justify-between items-end gap-12">
              <div>
                <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-luxury-gold mb-4 block">Visual Archive</span>
                <h2 className="text-6xl md:text-8xl font-serif italic-small tracking-tighter">THE <br /> GALLERY</h2>
              </div>
            </div>

            <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 space-y-8">
              {story.galleryImages.map((img, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: (idx % 5) * 0.1 }}
                  className="break-inside-avoid relative group rounded-2xl overflow-hidden cursor-pointer shadow-lg"
                  onClick={() => openLightbox(idx)}
                >
                  <img src={img} alt={`${story.title} - ${idx}`} className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                  <div className="absolute inset-0 bg-luxury-dark/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Maximize2 className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-300" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-luxury-dark/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8"
            onClick={closeLightbox}
          >
            <button className="absolute top-6 right-6 md:top-10 md:right-10 text-white/50 hover:text-luxury-crimson transition-colors z-50" onClick={closeLightbox}>
              <X className="w-8 h-8 md:w-10 md:h-10" />
            </button>
            
            <button className="absolute left-4 sm:left-10 top-1/2 -translate-y-1/2 text-white/50 hover:text-luxury-gold p-2 z-50 transition-colors" onClick={prevImage}>
              <ChevronLeft className="w-10 h-10 md:w-16 md:h-16" />
            </button>

            <motion.img 
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              src={story.galleryImages[lightboxIndex]} 
              alt="Fullscreen Preview" 
              className="max-w-full max-h-[85vh] object-contain shadow-2xl select-none"
              onClick={(e) => e.stopPropagation()}
            />

            <button className="absolute right-4 sm:right-10 top-1/2 -translate-y-1/2 text-white/50 hover:text-luxury-gold p-2 z-50 transition-colors" onClick={nextImage}>
              <ChevronRight className="w-10 h-10 md:w-16 md:h-16" />
            </button>

            <div className="absolute bottom-10 left-0 right-0 text-center">
              <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/60">
                {lightboxIndex + 1} <span className="mx-2 opacity-30">/</span> {story.galleryImages.length}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
