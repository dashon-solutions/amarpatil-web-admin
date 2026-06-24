import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";

export default function Home() {
  const [data, setData] = useState({
    siteSettings: null,
    banners: [],
    categories: [],
    featuredGalleries: [],
    stories: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        const [
          settingsRes, bannerRes, catRes, galRes, storyRes, aboutRes
        ] = await Promise.all([
          axiosInstance.get("/cms/site-settings"),
          axiosInstance.get("/cms/banner?public=true"),
          axiosInstance.get("/cms/category?public=true"),
          axiosInstance.get("/cms/gallery?public=true&isFeatured=true"),
          axiosInstance.get("/cms/story?public=true"),
          axiosInstance.get("/cms/about")
        ]);

        setData({
          siteSettings: settingsRes.data,
          banners: bannerRes.data || [],
          categories: catRes.data || [],
          featuredGalleries: galRes.data || [],
          stories: storyRes.data || [],
          about: aboutRes.data || null,
        });
      } catch (err) {
        console.error("Error fetching site data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPublicData();
  }, []);

  const heroBanner = data.banners.length > 0 ? data.banners[0] : null;
  const heroImage = heroBanner?.mainImage || "https://picsum.photos/seed/fashion-hero/1200/1600";
  const heroDescription = heroBanner?.description || data.siteSettings?.meta?.description || "Redefining the art of photography through cinematic composition. Featured in Vogue & Muse.";
  const philosophyQuote = data.about?.title || "\"WE DON'T JUST OBSERVE LIFE. WE CREATE IT.\"";

  return (
    <div className="pt-24 md:pt-32">
      {/* Hero Section */}
      <section className="px-6 md:px-12 py-8 md:py-24 relative overflow-hidden">
        <div className="max-w-screen-2xl mx-auto flex flex-col-reverse lg:grid lg:grid-cols-12 gap-12 lg:items-center">
          <div className="lg:col-span-8 z-10 transition-all">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <span className="text-[9px] md:text-[10px] uppercase tracking-[0.5em] font-bold text-luxury-gold mb-6 md:mb-8 block">
                {heroBanner?.subtitle || "Visual Storyteller — Based in NY"}
              </span>
              <h1 className="text-dynamic font-serif select-none mb-8 md:mb-12">
                CAPTURING <br />
                <span className="text-luxury-crimson">MOMENTS</span> <br />
                <span className="inline-block md:block">THAT TELL</span> <br />
                <span className="text-editorial text-luxury-blue md:pl-24">STORIES</span>
              </h1>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="flex flex-col md:flex-row gap-8 md:gap-12 items-start md:items-center mt-8 md:mt-12"
            >
              <Link to="/portfolio" className="flex items-center gap-4 group cursor-pointer active:scale-95 transition-transform">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full border border-luxury-dark/10 flex items-center justify-center group-hover:bg-luxury-dark group-hover:text-white transition-all duration-500">
                  <Play className="w-4 h-4 md:w-5 md:h-5 fill-current" />
                </div>
                <span className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-bold">Watch Showreel</span>
              </Link>
              <p className="max-w-xs text-[13px] md:text-sm text-luxury-ink/60 leading-relaxed font-light">
                {heroDescription}
              </p>
            </motion.div>
          </div>

          <div className="lg:col-span-4 relative mb-8 lg:mb-0">
            <motion.div
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="relative aspect-[3/4] overflow-hidden rounded-[1.5rem] md:rounded-[2rem] shadow-2xl"
            >
              <motion.img 
                src={heroImage} 
                alt="High Fashion Editorial"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-luxury-dark/40 to-transparent" />
            </motion.div>
            
            {/* Decal - Scaled for mobile */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-6 -left-6 md:-bottom-10 md:-left-10 w-24 h-24 md:w-40 md:h-40 border border-luxury-gold/30 rounded-full flex items-center justify-center pointer-events-none bg-luxury-bg/20 backdrop-blur-sm z-20"
            >
              <span className="text-[6px] md:text-[8px] uppercase tracking-[0.2em] font-serif text-luxury-gold text-center px-4">
                AUTHENTIC • LUXURY • CINEMATIC
              </span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Section (Asymmetrical Grid) */}
      <section className="py-32 px-6 md:px-12 bg-luxury-surface">
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-12">
            <div>
              <h2 className="text-6xl md:text-8xl font-serif leading-[0.9] mb-8">
                THE <br /> COLLECTION
              </h2>
              <p className="text-sm text-luxury-ink/60 uppercase tracking-widest">
                Selected Works
              </p>
            </div>
            <Link to="/portfolio" className="flex items-center gap-4 pb-4 border-b border-luxury-dark group">
              <span className="text-sm uppercase tracking-widest">Explore All Stories</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            {/* Project 1 */}
            <Link to={data.stories[0] ? `/story/${data.stories[0].slug}` : "/portfolio"} className="md:col-span-7 group cursor-pointer block">
              <motion.div 
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 100 }}
                viewport={{ once: true }}
              >
                <div className="overflow-hidden rounded-xl aspect-[16/9] mb-8 bg-black/5">
                  <img 
                    src={data.stories[0]?.mainImage || "https://picsum.photos/seed/editorial-1/1600/900"} 
                    alt="Velvet Dream" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                  />
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-luxury-gold font-bold mb-2 block">
                      {data.stories[0]?.shortDescription || "Editorial — Milan"}
                    </span>
                    <h3 className="text-3xl font-serif">{data.stories[0]?.title || "Velvet Dream"}</h3>
                  </div>
                  <span className="text-xl font-serif italic text-luxury-ink/20">01</span>
                </div>
              </motion.div>
            </Link>

            {/* Project 2 */}
            <Link to={data.stories[1] ? `/story/${data.stories[1].slug}` : "/portfolio"} className="md:col-span-5 pt-24 group cursor-pointer block">
              <motion.div 
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 100 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <div className="overflow-hidden rounded-xl aspect-[3/4] mb-8 bg-black/5">
                  <img 
                    src={data.stories[1]?.mainImage || "https://picsum.photos/seed/editorial-2/1200/1600"} 
                    alt="Noir Elegance" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                  />
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-luxury-blue font-bold mb-2 block">
                      {data.stories[1]?.shortDescription || "Campaign — Paris"}
                    </span>
                    <h3 className="text-3xl font-serif">{data.stories[1]?.title || "Noir Elegance"}</h3>
                  </div>
                  <span className="text-xl font-serif italic text-luxury-ink/20">02</span>
                </div>
              </motion.div>
            </Link>

             {/* Project 3 */}
             <Link to={data.stories[2] ? `/story/${data.stories[2].slug}` : "/portfolio"} className="md:col-span-4 group cursor-pointer block">
              <motion.div 
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 100 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <div className="overflow-hidden rounded-xl aspect-[4/5] mb-8 bg-black/5">
                  <img 
                    src={data.stories[2]?.mainImage || "https://picsum.photos/seed/editorial-3/1200/1500"} 
                    alt="Azure Horizon" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                  />
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-luxury-crimson font-bold mb-2 block">
                      {data.stories[2]?.shortDescription || "Concept — London"}
                    </span>
                    <h3 className="text-3xl font-serif">{data.stories[2]?.title || "Azure Horizon"}</h3>
                  </div>
                  <span className="text-xl font-serif italic text-luxury-ink/20">03</span>
                </div>
              </motion.div>
            </Link>

            {/* Project 4 */}
            <Link to={data.stories[3] ? `/story/${data.stories[3].slug}` : "/portfolio"} className="md:col-span-8 group cursor-pointer block">
              <motion.div 
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 100 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <div className="overflow-hidden rounded-xl aspect-[21/9] mb-8 bg-black/5">
                  <img 
                    src={data.stories[3]?.mainImage || "https://picsum.photos/seed/editorial-4/1920/820"} 
                    alt="The Glass House" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                  />
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-luxury-gold font-bold mb-2 block">
                      {data.stories[3]?.shortDescription || "Architecture — NY"}
                    </span>
                    <h3 className="text-3xl font-serif">{data.stories[3]?.title || "The Glass House"}</h3>
                  </div>
                  <span className="text-xl font-serif italic text-luxury-ink/20">04</span>
                </div>
              </motion.div>
            </Link>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-48 px-6 md:px-12 bg-luxury-dark text-white text-center overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <motion.div
             whileInView={{ opacity: 1, scale: 1 }}
             initial={{ opacity: 0, scale: 0.9 }}
             transition={{ duration: 1 }}
             viewport={{ once: true }}
          >
            <h3 className="text-[6vw] md:text-[4vw] font-serif leading-tight mb-12 uppercase">
              {philosophyQuote}
            </h3>
            <p className="text-white/40 uppercase tracking-[0.4em] text-xs mb-16">
              The Creative Philosophy of {data.siteSettings?.businessName || "Aurelius Studio"}
            </p>
            <div className="h-20 w-[1px] bg-luxury-gold mx-auto" />
          </motion.div>
        </div>
      </section>
    </div>
  );
}
