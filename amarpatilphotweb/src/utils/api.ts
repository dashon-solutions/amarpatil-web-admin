/**
 * API service for connecting the frontend with the CRM CMS backend.
 */

const API_BASE = (import.meta as any).env.VITE_API_URL || "https://photo-crm-bbla.onrender.com/api";

export async function fetchFromAPI(endpoint: string, options?: RequestInit) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, options);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

// Banners API
export async function getBanners() {
  return fetchFromAPI("/cms/banner?public=true");
}

// Categories API
export async function getCategories() {
  return fetchFromAPI("/cms/category?public=true");
}

// Galleries API
export async function getGalleries() {
  return fetchFromAPI("/cms/gallery?public=true");
}

// Stories API
export async function getStories() {
  return fetchFromAPI("/cms/story?public=true");
}

// Testimonials API
export async function getTestimonials() {
  return fetchFromAPI("/cms/testimonial?public=true");
}

// About US API
export async function getAbout() {
  return fetchFromAPI("/cms/about");
}

// Site Settings API (Singleton)
export async function getSiteSettings() {
  return fetchFromAPI("/cms/site-settings");
}

// Submit a lead (from Contact Form)
export interface LeadInput {
  name: string;
  phone: string;
  email?: string;
  message?: string;
  source?: string;
}

export async function createLead(leadData: LeadInput) {
  return fetchFromAPI("/leads", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...leadData,
      source: leadData.source || "contact_form",
    }),
  });
}

// Team Members API
export async function getTeam() {
  return fetchFromAPI("/team?public=true");
}
