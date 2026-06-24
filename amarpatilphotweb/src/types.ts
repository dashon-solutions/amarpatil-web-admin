/**
 * Types and interfaces for the Luxury Editorial Website
 */

export interface NavItem {
  label: string;
  href: string;
}

export interface StorySegment {
  title: string;
  subtitle: string;
  paragraphs: string[];
  imageUrl: string;
  imageAlt: string;
}

export interface Accolade {
  id: string;
  org: string;
  awardName: string;
  year: string;
  logoSvg?: string; // Optional custom minimal brand logo representation
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  imageAlt: string;
  year: string;
  dimensions?: string;
  location?: string;
}

export interface StatCard {
  value: string;
  label: string;
  description: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  clientName: string;
  companyName: string;
  role: string;
  imageUrl: string;
  date: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}
