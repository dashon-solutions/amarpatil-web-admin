import ContactForm from "../components/ContactForm";
import PageHero from "../components/PageHero";

export default function ContactPage() {
  return (
    <div className="bg-white min-h-screen">
      <PageHero
        title="Bespoke Inquiries"
        slogan="COMMISSION A MASTERPIECE"
        subtitle="CONTACT US"
        description="Available for global commissions, architectural documentation, and private acquisitions."
        bgImage="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1800&q=85"
      />
      <ContactForm />
    </div>
  );
}
