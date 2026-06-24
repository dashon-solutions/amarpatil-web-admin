import Hero from "../components/Hero";
import Story from "../components/Story";
import Accolades from "../components/Accolades";
import PremiumBanner from "../components/PremiumBanner";
import Gallery from "../components/Gallery";
import AboutUs from "../components/AboutUs";
import Testimonials from "../components/Testimonials";
import ContactForm from "../components/ContactForm";

export default function Home() {
  return (
    <div id="home-view">
      <Hero />
      <Story isHomepage={true} />
      {/* <Accolades /> */}
      <PremiumBanner />
      <Gallery isHomepage={true} />
      <AboutUs />
      <Testimonials />
      <ContactForm />
    </div>
  );
}
