import { NavItem, StorySegment, Accolade, GalleryItem, StatCard, Testimonial } from "./types";

export const NAVIGATION_ITEMS: NavItem[] = [
  { label: "Home", href: "#home" },
  { label: "Story", href: "#story" },
  { label: "Gallery", href: "#gallery" },
  { label: "About Us", href: "#about" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Contact Us", href: "#contact" }
];

export const STORY_DATA: StorySegment = {
  title: "Our Story",
  subtitle: "& Legacy",
  paragraphs: [
    "Established at the convergence of classic craftsmanship and avant-garde luxury, our studio has spent over two decades redefining the language of bespoke experiences. We believe that true luxury is not merely seen—it is felt down to the finest, quietest detail.",
    "Driven by a dedication to timeless elegance, we curate spaces, objects, and visual journeys for visionary families and award-winning global brands. Every canvas we touch is layered with architectural honesty and modern aesthetic relevance, preserving heritage while drafting the future.",
    "With a footprint spanning Monaco, London, and Tokyo, our bespoke creations remain deeply personal, prioritizing the beauty of form, the fidelity of material, and the luxury of unhurried, purposeful design."
  ],
  imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85",
  imageAlt: "High-end luxury haute couture textile and elegant drape design with gold accents"
};

export const ACCOLADES_DATA: Accolade[] = [
  {
    id: "acc-1",
    org: "Maison de l'Esthétique",
    awardName: "International Design Grand Prix",
    year: "2025"
  },
  {
    id: "acc-2",
    org: "The Editorial Society",
    awardName: "Best Visual Narrative Excellence",
    year: "2025"
  },
  {
    id: "acc-3",
    org: "Architectural Guild",
    awardName: "Honorary Legacy Craftsmanship Seal",
    year: "2024"
  },
  {
    id: "acc-4",
    org: "Vogue Creative Index",
    awardName: "Pinnacle Brand Curator of the Year",
    year: "2024"
  }
];

export const GALLERY_DATA: GalleryItem[] = [
  {
    id: "gal-1",
    title: "Celestial Silhouette",
    category: "Haute Couture",
    imageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1100&q=85",
    imageAlt: "Bespoke high fashion garment drape with intricate golden threading",
    year: "2025",
    dimensions: "Tailored to Fit",
    location: "Maison Paris"
  },
  {
    id: "gal-2",
    title: "The Obsidian Pavilion",
    category: "Architecture",
    imageUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1100&q=85",
    imageAlt: "Minimal luxury desert estate architectural detail with reflecting black waters",
    year: "2025",
    dimensions: "1,200 sq. m.",
    location: "Monaco Coast"
  },
  {
    id: "gal-3",
    title: "Chronos Atelier Desk",
    category: "Craftsmanship",
    imageUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1100&q=85",
    imageAlt: "Master watchmaker and fine jewel crafting workstation with brass tools",
    year: "2024",
    dimensions: "Artisanal Edition",
    location: "Swiss Valleys"
  },
  {
    id: "gal-4",
    title: "Amulet in Gold",
    category: "Rare Objects",
    imageUrl: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1100&q=85",
    imageAlt: "Exquisite rare gold accessory showcasing structured geometry",
    year: "2024",
    dimensions: "24k Limited",
    location: "Tokyo Exhibition"
  },
  {
    id: "gal-5",
    title: "The Ivory Lounge",
    category: "Bespoke Interiors",
    imageUrl: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1100&q=85",
    imageAlt: "Modern minimal sculptural living lounge interior featuring raw oak and warm plaster walls",
    year: "2024",
    dimensions: "Penthouse Suite",
    location: "London Belgravia"
  },
  {
    id: "gal-6",
    title: "Gilded Botanicals",
    category: "Organic Artistry",
    imageUrl: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1100&q=85",
    imageAlt: "Stunning golden organic botanical study with micro texture overlay",
    year: "2025",
    dimensions: "120 x 180 cm",
    location: "Milano Gallery"
  }
];

export const STAT_CARDS: StatCard[] = [
  {
    value: "8+",
    label: "Years of Heritage",
    description: "Delivering exceptional creativity and premium design services since 2018."
  },
  {
    value: "500+",
    label: "Wedding Projects",
    description: "Successfully planned, designed, and executed memorable wedding celebrations."
  },
  {
    value: "50+",
    label: "Commercial Projects",
    description: "Creative solutions delivered for commercial spaces, brands, and business events."
  },
  {
    value: "300+",
    label: "Model Shoots",
    description: "Professional fashion, portfolio, and commercial model shoots with premium production quality."
  }
];

export const TESTIMONIALS_DATA: Testimonial[] = [
  {
    id: "test-1",
    quote: "Their team understands a layer of nuance that simply does not exist anywhere else. Every material choice, color transition, and typography pairing on our global relaunch exuded pure editorial prestige. They have earned our absolute confidence.",
    clientName: "Eleanor Vance",
    companyName: "Studio Vance",
    role: "Principal Architect",
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&h=400&q=85",
    date: "October 2025"
  },
  {
    id: "test-2",
    quote: "Working with them was a masterclass in quiet elegance. The final design of our flagship pavilion completely sidesteps the standard noisy trends, opting instead for a minimal layout that elevates our collections to works of art. Truly extraordinary.",
    clientName: "Alexander Thorne",
    companyName: "Maison Thorne",
    role: "Creative Director",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=85",
    date: "January 2026"
  },
  {
    id: "test-3",
    quote: "A sublime synthesis of form and precision. They created an experience of unhurried luxury that has set the gold standard for how our brand presents itself to the world. Their design doesn't shout; it commands and inspires.",
    clientName: "Seraphine Laurent",
    companyName: "Laurent & Co.",
    role: "Founder & CEO",
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=85",
    date: "May 2026"
  }
];
