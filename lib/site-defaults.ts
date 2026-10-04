import type { NavLocation } from "@prisma/client";

// Starting header/footer links for a fresh database (mirrors the header_footer_cms migration).
export const DEFAULT_NAV_LINKS: Array<{ location: NavLocation; label: string; href: string; opensBooking?: boolean }> = [
  { location: "header", label: "Home", href: "/#home" },
  { location: "header", label: "Our Menu", href: "/#services" },
  { location: "header", label: "Packages", href: "/#signature" },
  { location: "header", label: "About", href: "/#about" },
  { location: "header", label: "Gallery", href: "/#gallery" },
  { location: "header", label: "Availability", href: "/#contact" },
  { location: "footer_explore", label: "Our Menu", href: "/#services" },
  { location: "footer_explore", label: "Packages", href: "/#signature" },
  { location: "footer_explore", label: "Availability", href: "/#contact" },
  { location: "footer_explore", label: "Gallery", href: "/#gallery" },
  { location: "footer_explore", label: "Request appointment", href: "/#contact", opensBooking: true },
  { location: "footer_legal", label: "Privacy Policy", href: "/privacy" },
  { location: "footer_legal", label: "Terms of Service", href: "/cancellation" },
];

export const SOCIAL_PLATFORMS = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "tiktok", label: "TikTok" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "youtube", label: "YouTube" },
  { value: "x", label: "X (Twitter)" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "website", label: "Other website" },
] as const;

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number]["value"];

// --- Homepage sections (Admin → Homepage) ---

export type SectionField = "eyebrow" | "title" | "body" | "details" | "ctaLabel" | "secondaryCtaLabel";

export type SectionDefaults = {
  key: string;
  name: string;
  fields: Partial<Record<SectionField, string>>;
  values: Partial<Record<SectionField, string>>;
};

// `fields` lists what the admin form shows for each section (with its label); `values` is the starting copy.
export const HOME_SECTIONS: SectionDefaults[] = [
  {
    key: "hero",
    name: "Hero",
    fields: { title: "Heading", body: "Intro text", ctaLabel: "Booking button", secondaryCtaLabel: "Second button" },
    values: {
      title: "Beauty, at a gentler pace.",
      body: "Thoughtful hair, skin, nail, and bridal care in a calm Jhamsikhel studio—personalized for you and made to feel good long after you leave.",
      ctaLabel: "Request an appointment",
      secondaryCtaLabel: "Explore services",
    },
  },
  {
    key: "services",
    name: "Our Menu",
    fields: { eyebrow: "Small label", title: "Heading", body: "Intro text" },
    values: {
      eyebrow: "Menu",
      title: "Find your kind of care.",
      body: "A considered selection of hair, skin, makeup, nail, bridal, and package services, with starting prices shown on each card.",
    },
  },
  {
    key: "rituals",
    name: "Featured rituals",
    fields: { eyebrow: "Small label", title: "Heading", ctaLabel: "Booking link label" },
    values: { eyebrow: "04 / Curated menu", title: "Featured Botanical Rituals", ctaLabel: "Book this ritual" },
  },
  {
    key: "signature",
    name: "Packages",
    fields: { eyebrow: "Small label", title: "Heading", details: "Checklist heading", ctaLabel: "Booking button" },
    values: {
      eyebrow: "This season",
      title: "Our popular packages.",
      details: "Included in this treatment",
      ctaLabel: "Book now",
    },
  },
  {
    key: "about",
    name: "About",
    fields: { eyebrow: "Small label", title: "Heading", body: "Second paragraph", ctaLabel: "Booking button" },
    values: {
      eyebrow: "About us",
      title: "A smaller room, on purpose.",
      body: "Anisha Basnet started Liora in Jhamsikhel after years of working rooms that booked too tightly. Color, bridal, skin, and nails share one quiet floor, and every tool is sanitized between guests. We take time with color so it still looks like you on a Tuesday. If a look will not grow out kindly, we say so before the first foil goes in.",
      ctaLabel: "Book an appointment",
    },
  },
  {
    key: "gallery",
    name: "Gallery",
    fields: { eyebrow: "Small label", title: "Heading" },
    values: { eyebrow: "Our work", title: "Looks from the studio." },
  },
  {
    key: "team",
    name: "Team",
    fields: { eyebrow: "Small label", title: "Heading" },
    values: { eyebrow: "Our team", title: "Meet the people behind the chair." },
  },
  {
    key: "reviews",
    name: "Reviews",
    fields: { eyebrow: "Small label (Google score is added after it)", title: "Heading" },
    values: { eyebrow: "Reviews", title: "What guests remember." },
  },
  {
    key: "contact",
    name: "Contact",
    fields: { eyebrow: "Small label", title: "Heading", body: "Intro text", details: "Opening hours (one line each)" },
    values: {
      eyebrow: "The sanctuary",
      title: "Visit Liora",
      body: "Find us in the heart of Jhamsikhel. Step inside, take a breath, and let us make a little space for you.",
      details: "Sunday–Friday · 10:00 AM – 7:00 PM\nSaturday · 9:00 AM – 6:00 PM",
    },
  },
  {
    key: "instagram",
    name: "Instagram",
    fields: { eyebrow: "Small label", title: "Heading (blank = Instagram handle)", ctaLabel: "Follow button" },
    values: { eyebrow: "Instagram", title: "", ctaLabel: "Follow" },
  },
];

export const DEFAULT_HERO_SLIDES = [
  { image: "https://images.pexels.com/photos/3997989/pexels-photo-3997989.jpeg?auto=compress&cs=tinysrgb&w=2000", alt: "Lived-in balayage and gloss" },
  { image: "https://images.pexels.com/photos/3065171/pexels-photo-3065171.jpeg?auto=compress&cs=tinysrgb&w=2000", alt: "Smooth keratin finish" },
  { image: "https://images.pexels.com/photos/853427/pexels-photo-853427.jpeg?auto=compress&cs=tinysrgb&w=2000", alt: "Soft bridal glam" },
  { image: "https://images.pexels.com/photos/3762875/pexels-photo-3762875.jpeg?auto=compress&cs=tinysrgb&w=2000", alt: "Quiet facial treatment" },
];

export const DEFAULT_TRUST_ITEMS = [
  { value: "8", suffix: "+", label: "Years in Jhamsikhel" },
  { value: "400", suffix: "+", label: "Brides styled" },
  { value: "Keratin & color", suffix: "", label: "Signature strength" },
  { value: "Sanitized tools", suffix: "", label: "Every single chair" },
];

export const DEFAULT_RITUAL_PICKS = [
  { categorySlug: "hair", serviceName: "Treatment & scalp care", note: "Herbal-inspired hair and scalp care", detail: "A restorative scalp-focused service with a finish tailored to your hair’s needs." },
  { categorySlug: "skin", serviceName: "Hydra glow", note: "Deeply hydrating facial", detail: "A hydrating facial ritual paced to your skin, leaving time for a calm, considered finish." },
  { categorySlug: "hair", serviceName: "Lived-in balayage + gloss", note: "Dimensional color and conditioning gloss", detail: "Hand-painted color and a gloss chosen to keep the result soft, shiny, and easy to grow out." },
  { categorySlug: "skin", serviceName: "Glass-skin facial", note: "Advanced facial therapy", detail: "A thoughtful cleanse, targeted care, and hydration, adjusted to your skin on the day." },
];

export const DEFAULT_SIGNATURE_INCLUSIONS: Record<string, string[]> = {
  "Lived-in balayage + gloss": ["Personalized color consultation", "Hand-painted balayage", "Gloss and conditioning finish"],
  "Glass-skin facial": ["Skin consultation", "Gentle cleanse and targeted care", "Deep hydration and finishing"],
  "Bridal trial": ["Daylight look consultation", "Hair and makeup trial", "First drape and reference photos"],
};
