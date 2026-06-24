import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { getStories } from "../utils/api";
import { ArrowLeft, ZoomIn, X, ChevronLeft, ChevronRight } from "lucide-react";
import PageHero from "../components/PageHero";
import { formatHeading } from "../utils/text";

export default function StoryDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [story, setStory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

  useEffect(() => {
    getStories()
      .then((storiesList) => {
        const found = storiesList.find((s: any) => s.slug === slug);
        setStory(found);
      })
      .catch((err) => console.error("Error loading story details:", err))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="bg-white min-h-screen pt-32 pb-24 flex items-center justify-center">
        <div className="text-navy-dark/40 font-bold uppercase tracking-widest animate-pulse">
          Opening Narrative...
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="bg-white min-h-screen pt-32 pb-24 flex flex-col items-center justify-center space-y-6">
        <p className="font-secondary text-xl text-navy-dark italic">This story does not exist in our archives.</p>
        <Link to="/stories" className="px-6 py-3 bg-navy-dark text-white text-xs uppercase tracking-widest font-semibold hover:bg-gold-warm transition-colors duration-300">
          Return to Stories
        </Link>
      </div>
    );
  }

  const paragraphs = story.description
    ? story.description.split("\n\n").filter(Boolean)
    : [];

  const galleryList = story.galleryImages || [];

  const openLightbox = (index: number) => {
    setActiveImageIndex(index);
  };

  const closeLightbox = () => {
    setActiveImageIndex(null);
  };

  const showNext = (e: any) => {
    e.stopPropagation();
    if (activeImageIndex !== null) {
      setActiveImageIndex((activeImageIndex + 1) % galleryList.length);
    }
  };

  const showPrev = (e: any) => {
    e.stopPropagation();
    if (activeImageIndex !== null) {
      setActiveImageIndex((activeImageIndex - 1 + galleryList.length) % galleryList.length);
    }
  };

  const activeImage = activeImageIndex !== null ? galleryList[activeImageIndex] : null;

  return (
    <div className="bg-white min-h-screen">
      <PageHero
        title={story.title}
        slogan="VISUAL NARRATIVE ARCHIVES"
        subtitle={story.category?.name || "FEATURED STORY"}
        description={story.shortDescription}
        bgImage={story.mainImage}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-24">
        {/* Back navigation link */}
        <div className="mb-12">
          <Link
            to="/stories"
            className="inline-flex items-center space-x-2 text-[10px] uppercase tracking-widest font-bold text-navy-dark/65 hover:text-gold-warm transition-colors duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Stories</span>
          </Link>
        </div>

        {/* Story Text Description & Editorial Side Image */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-24">
          <div className={`space-y-6 text-navy-dark/85 font-light leading-relaxed text-sm md:text-base font-primary ${story.sideImage ? "lg:col-span-8" : "lg:col-span-12 max-w-3xl mx-auto"}`}>
            {paragraphs.map((para: string, idx: number) => {
              if (idx === 0) {
                return (
                  <p key={idx} className="text-xl sm:text-2xl font-secondary font-medium text-navy-dark italic leading-relaxed border-l-4 border-gold-warm pl-6 py-2 mb-8">
                    {para}
                  </p>
                );
              }
              return <p key={idx}>{para}</p>;
            })}
          </div>

          {story.sideImage && (
            <div className="lg:col-span-4 aspect-3/4 overflow-hidden shadow-xl border border-navy-dark/5 bg-navy-dark/5 rounded-xs">
              <img
                src={story.sideImage}
                alt="Secondary narrative view"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          )}
        </div>

        {/* Story Gallery Section */}
        {galleryList.length > 0 && (
          <div className="space-y-12">
            <div className="space-y-4 text-center md:text-left border-b border-navy-dark/10 pb-6 mb-10">
              <span className="text-gold-warm tracking-[0.3em] text-[10px] uppercase font-bold block">
                CURATED EXHIBITS
              </span>
              <h2 className="text-2xl sm:text-3xl font-secondary font-bold text-navy-dark">
                {formatHeading("Story Gallery")}
              </h2>
            </div>

            <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-5 gap-6 [column-fill:_balance]">
              {galleryList.map((imgUrl: string, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="break-inside-avoid mb-6 group relative cursor-pointer overflow-hidden shadow-md bg-navy-dark/5 border border-navy-dark/5 rounded-xs transition-shadow hover:shadow-lg"
                  onClick={() => openLightbox(index)}
                >
                  <div className="absolute inset-0 bg-navy-dark/0 group-hover:bg-navy-dark/15 transition-all duration-500 z-10 flex items-center justify-center">
                    <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <img
                    src={imgUrl}
                    alt={`Gallery ${index}`}
                    className="w-full h-auto block transform duration-1000 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox for Gallery Viewer */}
      <AnimatePresence>
        {activeImageIndex !== null && activeImage && (
          <motion.div
            id="story-lightbox-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-navy-dark/95 z-55 flex flex-col justify-between p-6 md:p-10 backdrop-blur-md"
            onClick={closeLightbox}
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between pointer-events-auto h-12 w-full max-w-7xl mx-auto z-10">
              <div className="flex flex-col text-left">
                <span className="font-secondary text-md md:text-lg font-bold text-white tracking-widest uppercase">
                  ATELIER NARRATIVE
                </span>
                <span className="font-primary text-[9px] tracking-widest text-gold-warm uppercase">
                  Image {activeImageIndex + 1} of {galleryList.length}
                </span>
              </div>
              <button
                onClick={closeLightbox}
                className="p-3 bg-white/10 hover:bg-white/20 transition-all rounded-full text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Middle Image Showcase */}
            <div className="relative flex-1 flex items-center justify-center max-w-5xl mx-auto w-full">
              <button
                onClick={showPrev}
                className="absolute left-4 z-20 p-4 bg-white/5 hover:bg-white/20 text-white transition-all rounded-full cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <motion.div
                key={activeImage}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="relative max-h-[70vh] max-w-full drop-shadow-2xl border-[5px] border-white/5"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={activeImage}
                  alt={`Exhibit ${activeImageIndex}`}
                  className="max-h-[68vh] w-auto max-w-full object-contain mx-auto"
                  referrerPolicy="no-referrer"
                />
              </motion.div>

              <button
                onClick={showNext}
                className="absolute right-4 z-20 p-4 bg-white/5 hover:bg-white/20 text-white transition-all rounded-full cursor-pointer"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Bottom Bar Padding */}
            <div className="h-10 w-full" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
