import { useEffect, useState } from "react";
import Gallery from "../components/Gallery";
import PageHero from "../components/PageHero";
import { getGalleries } from "../utils/api";

export default function GalleryPage() {
  const [heroImage, setHeroImage] = useState<string>("https://images.unsplash.com/photo-1490971588422-52f6262a237a?auto=format&fit=crop&w=1800&q=85");

  useEffect(() => {
    getGalleries()
      .then((data) => {
        const activeItems = data.filter((g: any) => g.isActive);
        if (activeItems.length > 0) {
          const randomIndex = Math.floor(Math.random() * activeItems.length);
          setHeroImage(activeItems[randomIndex].image);
        }
      })
      .catch((err) => console.error("Error loading random gallery hero:", err));
  }, []);

  return (
    <div className="bg-white min-h-screen">
      <PageHero
        title="The Curated Collection"
        slogan="A PORTFOLIO OF RARIFIED PIECES"
        subtitle="FINE ART GALLERY"
        description="Explore our archive of signature spatial structures, couture silhouettes, and organic visuals."
        bgImage={heroImage}
      />
      <Gallery isHomepage={false} />
    </div>
  );
}
