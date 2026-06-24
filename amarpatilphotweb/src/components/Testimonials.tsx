import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Quote, Star } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { TESTIMONIALS_DATA } from "../data";
import { getTestimonials } from "../utils/api";
import { formatHeading } from "../utils/text";

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTestimonials()
      .then((data) => {
        const activeTestimonials = data.filter((t: any) => t.isActive);
        setTestimonials(activeTestimonials);
      })
      .catch((err) => console.error("Error loading testimonials:", err))
      .finally(() => setLoading(false));
  }, []);

  const items = testimonials.length > 0
    ? testimonials.map((t: any) => ({
        id: t._id,
        quote: t.message,
        clientName: t.name,
        companyName: "Bespoke Collector",
        role: "Verified Client",
        imageUrl: t.image || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&h=400&q=85",
        date: "Aesthetic Review",
        rating: t.rating || 5
      }))
    : TESTIMONIALS_DATA.map(t => ({ ...t, rating: 5 }));

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length);
  };

  const current = items[currentIndex];

  if (!current) {
    return null;
  }

  return (
    <section id="testimonials" className="py-24 md:py-32 bg-white relative overflow-hidden border-t border-b border-navy-dark/5">
      {/* Absolute Decorative Golden Quote Mark Backdrop */}
      <div className="absolute right-12 top-10 text-gold-warm/5 select-none pointer-events-none hidden lg:block">
        <Quote className="w-96 h-96 transform rotate-180" />
      </div>

      <div className="max-w-4xl mx-auto px-6 md:px-12 text-center relative z-10">
        
        {/* Section Heading */}
        <div className="space-y-4 mb-16">
          <span className="text-gold-warm tracking-[0.3em] text-[10px] uppercase font-bold block">
            VISIONARY VOICES
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-secondary font-black tracking-tight text-navy-dark">
            {formatHeading("Words From Our Clients")}
          </h2>
          <div className="h-[2px] w-12 bg-navy-dark mx-auto" />
        </div>

        {/* Carousel Slide Area wrapped in AnimatePresence for flawless transitions */}
        <div className="relative min-h-[380px] md:min-h-[300px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              id={`testimonial-slide-${current.id}`}
              key={current.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5 }}
              className="bg-white border border-navy-dark/10 p-8 md:p-12 shadow-xl hover:shadow-2xl hover:border-gold-warm/40 group duration-500 rounded-sm relative w-full"
            >
              {/* Gold Quote icon top-left inside card */}
              <div className="absolute top-6 left-6 text-gold-warm opacity-20 group-hover:opacity-40 duration-500">
                <Quote className="w-10 h-10 transform scale-x-[-1]" />
              </div>

              {/* Star Rating */}
              <div className="flex justify-center gap-1 mb-2 mt-4">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={`w-4.5 h-4.5 ${
                      i < current.rating
                        ? "fill-gold-warm text-gold-warm"
                        : "text-navy-dark/10"
                    }`}
                  />
                ))}
              </div>

              {/* Client narrative quote */}
              <blockquote className="font-secondary text-lg md:text-xl text-navy-dark/95 leading-relaxed font-medium italic mb-8">
                “{current.quote}”
              </blockquote>

              {/* Author portrait name and credentials */}
              <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4">
                <div className="relative">
                  <div className="absolute inset-0 border border-gold-warm rounded-full transform scale-105" />
                  <img
                    src={current.imageUrl}
                    alt={`${current.clientName} Portrait`}
                    className="w-14 h-14 rounded-full object-cover filter grayscale hover:grayscale-0 duration-500 shadow-md"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="text-center md:text-left">
                  <p className="font-secondary text-md font-bold text-navy-dark tracking-wide">
                    {current.clientName}
                  </p>
                  <p className="font-primary text-[10px] tracking-widest text-gold-warm uppercase font-bold mt-0.5">
                    {current.role} <span className="text-navy-dark/30 mx-1">•</span> {current.companyName}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Interactive Controls & Status Circles */}
        <div className="flex items-center justify-between mt-8 max-w-xs mx-auto">
          {/* Prev Arrow */}
          <button
            id="testimonial-prev-trigger"
            onClick={handlePrev}
            className="p-3 bg-white border border-navy-dark/15 text-navy-dark hover:border-gold-warm hover:text-gold-warm rounded-full duration-300 shadow-xs cursor-pointer focus:outline-hidden"
            aria-label="Previous testimonial"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Slide Indicator Dots */}
          <div className="flex space-x-2">
            {items.map((item, index) => (
              <button
                id={`testimonial-dot-${index}`}
                key={item.id}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex ? "w-6 bg-gold-warm" : "w-2 bg-navy-dark/20"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Next Arrow */}
          <button
            id="testimonial-next-trigger"
            onClick={handleNext}
            className="p-3 bg-white border border-navy-dark/15 text-navy-dark hover:border-gold-warm hover:text-gold-warm rounded-full duration-300 shadow-xs cursor-pointer focus:outline-hidden"
            aria-label="Next testimonial"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
}
