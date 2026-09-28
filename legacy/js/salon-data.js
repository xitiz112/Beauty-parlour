/**
 * Liora Beauty Studio — collected facts used across the site.
 * Appointments are request-based and confirmed manually by phone or WhatsApp.
 */
window.SALON = {
  name: "Liora Beauty Studio",
  shortName: "Liora",
  tagline: "Hair, skin, and bridal beauty in one calm studio.",
  city: "Lalitpur",
  neighborhood: "Jhamsikhel",
  address: "House 42, Jhamsikhel Road, Lalitpur 44600",
  landmark: "Two minutes from the 1905 roundabout, opposite Himalayan Java",
  phone: "+977 1-5452180",
  phoneHref: "tel:+97715452180",
  whatsapp: "+977 9801234567",
  whatsappHref: "https://wa.me/9779801234567",
  email: "hello@liorastudio.com",
  instagram: "@liorastudio.np",
  instagramHref: "https://www.instagram.com/liorastudio.np",
  facebookHref: "https://www.facebook.com/liorastudio",
  mapsQuery: "Jhamsikhel Road, Lalitpur, Nepal",
  mapsEmbed:
    "https://maps.google.com/maps?q=Jhamsikhel%20Road%20Lalitpur%20Nepal&t=&z=16&ie=UTF8&iwloc=&output=embed",
  parking: "Street parking on Jhamsikhel Road. Patan Dhoka buses stop a short walk away.",
  walkIns: "Walk-ins welcome when chairs are free.",
  confirmNote: "We will confirm by phone or WhatsApp within a few hours.",
  owner: {
    name: "Anisha Basnet",
    role: "Creative director",
  },
  hours: [
    { day: "Sunday", time: "10:00 AM – 7:00 PM" },
    { day: "Monday", time: "10:00 AM – 7:00 PM" },
    { day: "Tuesday", time: "10:00 AM – 7:00 PM" },
    { day: "Wednesday", time: "10:00 AM – 7:00 PM" },
    { day: "Thursday", time: "10:00 AM – 7:00 PM" },
    { day: "Friday", time: "10:00 AM – 7:00 PM" },
    { day: "Saturday", time: "9:00 AM – 6:00 PM" },
  ],
  todayNote: "Open today until 7pm",
  trust: [
    { value: "8", label: "Years in Jhamsikhel" },
    { value: "400+", label: "Brides styled" },
    { value: "Keratin & color", label: "Signature strength" },
    { value: "Sanitized tools", label: "Every single chair" },
  ],
  services: [
    {
      id: "hair",
      name: "Hair",
      teaser: "Cuts, lived-in color, keratin, and styling that still looks like you.",
      from: "Rs. 1,200",
      image:
        "https://images.pexels.com/photos/3992874/pexels-photo-3992874.jpeg?auto=compress&cs=tinysrgb&w=900",
      treatments: [
        "Consultation cut",
        "Blow-dry & style",
        "Lived-in balayage + gloss",
        "Full color / root touch-up",
        "Keratin smooth",
        "Treatment & scalp care",
      ],
    },
    {
      id: "skin",
      name: "Skin",
      teaser: "Facials and glow work paced to your skin, not a menu clock.",
      from: "Rs. 2,500",
      image:
        "https://images.pexels.com/photos/3764013/pexels-photo-3764013.jpeg?auto=compress&cs=tinysrgb&w=900",
      treatments: [
        "Classic cleanup",
        "Glass-skin facial",
        "Hydra glow",
        "Acne-calm treatment",
        "Brightening peel",
      ],
    },
    {
      id: "makeup",
      name: "Makeup",
      teaser: "Party, engagement, and editorial looks that photograph softly.",
      from: "Rs. 3,500",
      image:
        "https://images.pexels.com/photos/457701/pexels-photo-457701.jpeg?auto=compress&cs=tinysrgb&w=900",
      treatments: [
        "Party makeup",
        "Engagement makeup",
        "Editorial / shoot",
        "Makeup lesson",
      ],
    },
    {
      id: "nails",
      name: "Nails",
      teaser: "Clean manicures, pedicures, and art that lasts past the weekend.",
      from: "Rs. 1,800",
      image:
        "https://images.pexels.com/photos/3997391/pexels-photo-3997391.jpeg?auto=compress&cs=tinysrgb&w=900",
      treatments: [
        "Classic manicure",
        "Gel manicure",
        "Pedicure",
        "Nail art add-on",
      ],
    },
    {
      id: "bridal",
      name: "Bridal",
      teaser: "Bride, family, trial, and draping — one team through the wedding week.",
      from: "Rs. 25,000",
      featured: true,
      image:
        "https://images.pexels.com/photos/853427/pexels-photo-853427.jpeg?auto=compress&cs=tinysrgb&w=1200",
      treatments: [
        "Bridal trial",
        "Bride — wedding day",
        "Family & bridesmaids",
        "Saree / lehenga draping",
      ],
    },
    {
      id: "packages",
      name: "Packages",
      teaser: "Glow Day, pre-wedding prep, and memberships for regulars.",
      from: "Rs. 8,500",
      image:
        "https://images.pexels.com/photos/3738345/pexels-photo-3738345.jpeg?auto=compress&cs=tinysrgb&w=900",
      treatments: [
        "Glow Day",
        "Pre-wedding week",
        "First-visit facial + blow-dry",
        "Studio membership enquiry",
      ],
    },
  ],
  signatures: [
    {
      name: "Lived-in balayage + gloss",
      story:
        "We paint color so the grow-out stays soft. Gloss at the end keeps it shiny without looking freshly done.",
      from: "Rs. 8,500",
      image:
        "https://images.pexels.com/photos/3997989/pexels-photo-3997989.jpeg?auto=compress&cs=tinysrgb&w=1100",
    },
    {
      name: "Glass-skin facial",
      story:
        "A quiet 75 minutes: cleanse, extract only what needs it, then hydrate until the skin looks rested, not tight.",
      from: "Rs. 4,200",
      image:
        "https://images.pexels.com/photos/3762875/pexels-photo-3762875.jpeg?auto=compress&cs=tinysrgb&w=1100",
    },
    {
      name: "Soft-glam bridal trial",
      story:
        "We try the look in daylight so you can see it the way guests will. Hair, skin, and draping sit in the same chair.",
      from: "Rs. 7,500",
      image:
        "https://images.pexels.com/photos/3997981/pexels-photo-3997981.jpeg?auto=compress&cs=tinysrgb&w=1100",
    },
  ],
  offer: {
    title: "Bridal trials through November 2026",
    detail:
      "Book a wedding-week package before 30 November and the trial is included. Weekday mornings only.",
    cta: "Reserve a trial",
  },
  about: {
    words:
      "Liora is a small studio in Jhamsikhel for people who want their hair and skin to look like them — just clearer. Anisha Basnet opened the room so color, bridal, and facials could happen without rushing the chair. We take time with color so it still looks like you on a Tuesday. The space is quiet, the tools are sanitized between every guest, and we would rather do fewer appointments well.",
  },
  team: [
    {
      name: "Anisha Basnet",
      role: "Creative director",
      specialty: "Lived-in colour that grows out kindly.",
      image:
        "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=700",
    },
    {
      name: "Priya Sharma",
      role: "Senior stylist",
      specialty: "Precision cuts and quiet blow-dries.",
      image:
        "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=700",
    },
    {
      name: "Reena Maharjan",
      role: "Bridal artist",
      specialty: "Soft-glam bridal that lasts the pheri.",
      image:
        "https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=700",
    },
    {
      name: "Sneha Karki",
      role: "Skin therapist",
      specialty: "Glow facials for city skin.",
      image:
        "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=700",
    },
    {
      name: "Maya Thapa",
      role: "Nail artist",
      specialty: "Clean shapes and lasting art.",
      image:
        "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=700",
    },
    {
      name: "Kiran Adhikari",
      role: "Treatment specialist",
      specialty: "Keratin and scalp recovery.",
      image:
        "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=700",
    },
  ],
  reviews: [
    {
      name: "Shristi",
      service: "Bride — soft glam",
      rating: 5,
      quote:
        "The color lasted through the wedding week. Reena kept the makeup soft enough for the morning pheri and still camera-ready at night.",
    },
    {
      name: "Niharika",
      service: "Balayage + gloss",
      rating: 5,
      quote:
        "Anisha talked me out of going two shades lighter. The grow-out still looks intentional six weeks later.",
    },
    {
      name: "Pooja",
      service: "Glass-skin facial",
      rating: 5,
      quote:
        "Sneha did not over-extract. My skin looked rested the next morning, not red. I booked the next one before I left.",
    },
  ],
  googleScore: "4.9",
  googleCount: "210+",
  gallery: [
    {
      caption: "Balayage + gloss",
      image:
        "https://images.pexels.com/photos/3997989/pexels-photo-3997989.jpeg?auto=compress&cs=tinysrgb&w=900",
    },
    {
      caption: "Bride — soft glam",
      image:
        "https://images.pexels.com/photos/853427/pexels-photo-853427.jpeg?auto=compress&cs=tinysrgb&w=900",
    },
    {
      caption: "Precision bob",
      image:
        "https://images.pexels.com/photos/3992870/pexels-photo-3992870.jpeg?auto=compress&cs=tinysrgb&w=900",
    },
    {
      caption: "Glass-skin facial",
      image:
        "https://images.pexels.com/photos/3764013/pexels-photo-3764013.jpeg?auto=compress&cs=tinysrgb&w=900",
    },
    {
      caption: "Gel manicure — nude",
      image:
        "https://images.pexels.com/photos/3997391/pexels-photo-3997391.jpeg?auto=compress&cs=tinysrgb&w=900",
    },
    {
      caption: "Engagement makeup",
      image:
        "https://images.pexels.com/photos/457701/pexels-photo-457701.jpeg?auto=compress&cs=tinysrgb&w=900",
    },
    {
      caption: "Keratin smooth",
      image:
        "https://images.pexels.com/photos/3065171/pexels-photo-3065171.jpeg?auto=compress&cs=tinysrgb&w=900",
    },
    {
      caption: "Party waves",
      image:
        "https://images.pexels.com/photos/3997981/pexels-photo-3997981.jpeg?auto=compress&cs=tinysrgb&w=900",
    },
    {
      caption: "Pedicure + art",
      image:
        "https://images.pexels.com/photos/3997376/pexels-photo-3997376.jpeg?auto=compress&cs=tinysrgb&w=900",
    },
    {
      caption: "Family bridal glam",
      image:
        "https://images.pexels.com/photos/6724348/pexels-photo-6724348.jpeg?auto=compress&cs=tinysrgb&w=900",
    },
    {
      caption: "Root touch-up",
      image:
        "https://images.pexels.com/photos/3992874/pexels-photo-3992874.jpeg?auto=compress&cs=tinysrgb&w=900",
    },
    {
      caption: "Glow Day package",
      image:
        "https://images.pexels.com/photos/3738345/pexels-photo-3738345.jpeg?auto=compress&cs=tinysrgb&w=900",
    },
  ],
  instagramPosts: [
    "https://images.pexels.com/photos/3738345/pexels-photo-3738345.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/457701/pexels-photo-457701.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/3997981/pexels-photo-3997981.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/3997989/pexels-photo-3997989.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/3997391/pexels-photo-3997391.jpeg?auto=compress&cs=tinysrgb&w=600",
  ],
  timeWindows: ["Morning", "Afternoon", "Evening"],
  heroImage:
    "https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=2000",
  aboutImage:
    "https://images.pexels.com/photos/3065209/pexels-photo-3065209.jpeg?auto=compress&cs=tinysrgb&w=1200",
};
