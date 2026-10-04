import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  DEFAULT_HERO_SLIDES,
  DEFAULT_NAV_LINKS,
  DEFAULT_RITUAL_PICKS,
  DEFAULT_SIGNATURE_INCLUSIONS,
  DEFAULT_TRUST_ITEMS,
  HOME_SECTIONS,
} from "../lib/site-defaults";
import { slugify } from "../lib/time";

const prisma = new PrismaClient();

const STUDIO_HOURS = [
  { dayOfWeek: 0, startMin: 10 * 60, endMin: 19 * 60 },
  { dayOfWeek: 1, startMin: 10 * 60, endMin: 19 * 60 },
  { dayOfWeek: 2, startMin: 10 * 60, endMin: 19 * 60 },
  { dayOfWeek: 3, startMin: 10 * 60, endMin: 19 * 60 },
  { dayOfWeek: 4, startMin: 10 * 60, endMin: 19 * 60 },
  { dayOfWeek: 5, startMin: 10 * 60, endMin: 19 * 60 },
  { dayOfWeek: 6, startMin: 9 * 60, endMin: 18 * 60 },
];

async function main() {
  if (process.env.SEED_TARGET === "production") {
    if (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD === "liora-desk") {
      throw new Error("Set a unique ADMIN_PASSWORD before seeding production.");
    }

    const existingRows = await Promise.all([
      prisma.appointment.count(),
      prisma.stylistService.count(),
      prisma.workingHour.count(),
      prisma.service.count(),
      prisma.serviceCategory.count(),
      prisma.stylist.count(),
      prisma.review.count(),
      prisma.galleryItem.count(),
      prisma.offer.count(),
      prisma.signature.count(),
      prisma.instagramPost.count(),
      prisma.studioSetting.count(),
      prisma.adminUser.count(),
      prisma.navLink.count(),
      prisma.socialLink.count(),
      prisma.sectionContent.count(),
      prisma.heroSlide.count(),
      prisma.trustItem.count(),
    ]);

    if (existingRows.some((count) => count > 0)) {
      throw new Error("Refusing to seed production: the database is not empty.");
    }
  }

  await prisma.ritualPick.deleteMany();
  await prisma.sectionContent.deleteMany();
  await prisma.heroSlide.deleteMany();
  await prisma.trustItem.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.stylistService.deleteMany();
  await prisma.workingHour.deleteMany();
  await prisma.service.deleteMany();
  await prisma.serviceCategory.deleteMany();
  await prisma.stylist.deleteMany();
  await prisma.review.deleteMany();
  await prisma.galleryItem.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.signature.deleteMany();
  await prisma.instagramPost.deleteMany();
  await prisma.studioSetting.deleteMany();
  await prisma.navLink.deleteMany();
  await prisma.socialLink.deleteMany();
  await prisma.adminUser.deleteMany();

  const categories = await Promise.all(
    [
      {
        slug: "hair",
        name: "Hair",
        teaser: "Cuts, lived-in color, keratin, and styling that still looks like you.",
        fromPrice: 1200,
        image: "https://images.pexels.com/photos/3992874/pexels-photo-3992874.jpeg?auto=compress&cs=tinysrgb&w=900",
        featured: false,
        sortOrder: 1,
        services: [
          { name: "Consultation cut", durationMinutes: 45, price: 1200 },
          { name: "Blow-dry & style", durationMinutes: 45, price: 1500 },
          { name: "Lived-in balayage + gloss", durationMinutes: 180, price: 8500 },
          { name: "Full color / root touch-up", durationMinutes: 120, price: 4500 },
          { name: "Keratin smooth", durationMinutes: 180, price: 9000 },
          { name: "Treatment & scalp care", durationMinutes: 60, price: 2800 },
        ],
      },
      {
        slug: "skin",
        name: "Skin",
        teaser: "Facials and glow work paced to your skin, not a menu clock.",
        fromPrice: 2500,
        image: "https://images.pexels.com/photos/3764013/pexels-photo-3764013.jpeg?auto=compress&cs=tinysrgb&w=900",
        featured: false,
        sortOrder: 2,
        services: [
          { name: "Classic cleanup", durationMinutes: 60, price: 2500 },
          { name: "Glass-skin facial", durationMinutes: 75, price: 4200 },
          { name: "Hydra glow", durationMinutes: 75, price: 5000 },
          { name: "Acne-calm treatment", durationMinutes: 60, price: 3800 },
          { name: "Brightening peel", durationMinutes: 60, price: 4800 },
        ],
      },
      {
        slug: "makeup",
        name: "Makeup",
        teaser: "Party, engagement, and editorial looks that photograph softly.",
        fromPrice: 3500,
        image: "https://images.pexels.com/photos/457701/pexels-photo-457701.jpeg?auto=compress&cs=tinysrgb&w=900",
        featured: false,
        sortOrder: 3,
        services: [
          { name: "Party makeup", durationMinutes: 75, price: 3500 },
          { name: "Engagement makeup", durationMinutes: 90, price: 6500 },
          { name: "Editorial / shoot", durationMinutes: 120, price: 8000 },
          { name: "Makeup lesson", durationMinutes: 90, price: 4500 },
        ],
      },
      {
        slug: "nails",
        name: "Nails",
        teaser: "Clean manicures, pedicures, and art that lasts past the weekend.",
        fromPrice: 1800,
        image: "https://images.pexels.com/photos/3997391/pexels-photo-3997391.jpeg?auto=compress&cs=tinysrgb&w=900",
        featured: false,
        sortOrder: 4,
        services: [
          { name: "Classic manicure", durationMinutes: 45, price: 1800 },
          { name: "Gel manicure", durationMinutes: 60, price: 2400 },
          { name: "Pedicure", durationMinutes: 60, price: 2200 },
          { name: "Nail art add-on", durationMinutes: 30, price: 400 },
        ],
      },
      {
        slug: "bridal",
        name: "Bridal",
        teaser: "Bride, family, trial, and draping — one team through the wedding week.",
        fromPrice: 25000,
        image: "https://images.pexels.com/photos/853427/pexels-photo-853427.jpeg?auto=compress&cs=tinysrgb&w=1200",
        featured: true,
        sortOrder: 5,
        services: [
          { name: "Bridal trial", durationMinutes: 120, price: 7500 },
          { name: "Bride — wedding day", durationMinutes: 180, price: 25000 },
          { name: "Family & bridesmaids", durationMinutes: 75, price: 4500 },
          { name: "Saree / lehenga draping", durationMinutes: 45, price: 2500 },
        ],
      },
      {
        slug: "packages",
        name: "Packages",
        teaser: "Glow Day, pre-wedding prep, and memberships for regulars.",
        fromPrice: 8500,
        image: "https://images.pexels.com/photos/3738345/pexels-photo-3738345.jpeg?auto=compress&cs=tinysrgb&w=900",
        featured: false,
        sortOrder: 6,
        services: [
          { name: "Glow Day", durationMinutes: 150, price: 8500, description: "Facial, blow-dry, manicure" },
          { name: "Pre-wedding week", durationMinutes: 240, price: 18000 },
          { name: "First-visit facial + blow-dry", durationMinutes: 120, price: 5200 },
          { name: "Studio membership enquiry", durationMinutes: 30, price: 0 },
        ],
      },
    ].map((category) =>
      prisma.serviceCategory.create({
        data: {
          slug: category.slug,
          name: category.name,
          teaser: category.teaser,
          fromPrice: category.fromPrice,
          image: category.image,
          featured: category.featured,
          sortOrder: category.sortOrder,
          services: {
            create: category.services.map((service, index) => ({
              name: service.name,
              durationMinutes: service.durationMinutes,
              price: service.price,
              description: "description" in service ? service.description : null,
              sortOrder: index + 1,
            })),
          },
        },
        include: { services: true },
      }),
    ),
  );

  const serviceByName = new Map(categories.flatMap((category) => category.services.map((service) => [service.name, service])));

  const team = [
    {
      name: "Anisha Basnet",
      role: "Creative director",
      specialty: "Lived-in colour that grows out kindly.",
      image: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=700",
      services: ["Consultation cut", "Lived-in balayage + gloss", "Full color / root touch-up", "Bridal trial", "Bride — wedding day", "Pre-wedding week"],
    },
    {
      name: "Priya Sharma",
      role: "Senior stylist",
      specialty: "Precision cuts and quiet blow-dries.",
      image: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=700",
      services: ["Consultation cut", "Blow-dry & style", "Full color / root touch-up", "First-visit facial + blow-dry", "Glow Day"],
    },
    {
      name: "Reena Maharjan",
      role: "Bridal artist",
      specialty: "Soft-glam bridal that lasts the pheri.",
      image: "https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=700",
      services: ["Party makeup", "Engagement makeup", "Editorial / shoot", "Makeup lesson", "Bridal trial", "Bride — wedding day", "Family & bridesmaids", "Saree / lehenga draping"],
    },
    {
      name: "Sneha Karki",
      role: "Skin therapist",
      specialty: "Glow facials for city skin.",
      image: "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=700",
      services: ["Classic cleanup", "Glass-skin facial", "Hydra glow", "Acne-calm treatment", "Brightening peel", "Glow Day", "First-visit facial + blow-dry"],
    },
    {
      name: "Maya Thapa",
      role: "Nail artist",
      specialty: "Clean shapes and lasting art.",
      image: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=700",
      services: ["Classic manicure", "Gel manicure", "Pedicure", "Nail art add-on", "Glow Day"],
    },
    {
      name: "Kiran Adhikari",
      role: "Treatment specialist",
      specialty: "Keratin and scalp recovery.",
      image: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=700",
      services: ["Keratin smooth", "Treatment & scalp care", "Studio membership enquiry", "Pre-wedding week"],
    },
  ];

  for (const [index, member] of team.entries()) {
    const stylist = await prisma.stylist.create({
      data: {
        name: member.name,
        slug: slugify(member.name),
        role: member.role,
        specialty: member.specialty,
        image: member.image,
        sortOrder: index + 1,
        hours: { create: STUDIO_HOURS },
      },
    });

    await prisma.stylistService.createMany({
      data: member.services
        .map((name) => serviceByName.get(name))
        .filter((service): service is NonNullable<typeof service> => Boolean(service))
        .map((service) => ({ stylistId: stylist.id, serviceId: service.id })),
    });
  }

  await prisma.review.createMany({
    data: [
      {
        guestName: "Shristi",
        service: "Bride — soft glam",
        rating: 5,
        quote: "The color lasted through the wedding week. Reena kept the makeup soft enough for the morning pheri and still camera-ready at night.",
        sortOrder: 1,
      },
      {
        guestName: "Niharika",
        service: "Balayage + gloss",
        rating: 5,
        quote: "Anisha talked me out of going two shades lighter. The grow-out still looks intentional six weeks later.",
        sortOrder: 2,
      },
      {
        guestName: "Pooja",
        service: "Glass-skin facial",
        rating: 5,
        quote: "Sneha did not over-extract. My skin looked rested the next morning, not red. I booked the next one before I left.",
        sortOrder: 3,
      },
      {
        guestName: "Anuja",
        service: "Classic manicure",
        rating: 5,
        quote: "The team made me feel welcome from the moment I arrived. My manicure was thoughtful, precise, and still looked lovely days later.",
        sortOrder: 4,
      },
    ],
  });

  await prisma.galleryItem.createMany({
    data: [
      { caption: "Balayage + gloss", image: "https://images.pexels.com/photos/3997989/pexels-photo-3997989.jpeg?auto=compress&cs=tinysrgb&w=900", sortOrder: 1 },
      { caption: "Bride — soft glam", image: "https://images.pexels.com/photos/853427/pexels-photo-853427.jpeg?auto=compress&cs=tinysrgb&w=900", sortOrder: 2 },
      { caption: "Precision bob", image: "https://images.pexels.com/photos/3992870/pexels-photo-3992870.jpeg?auto=compress&cs=tinysrgb&w=900", sortOrder: 3 },
      { caption: "Glass-skin facial", image: "https://images.pexels.com/photos/3764013/pexels-photo-3764013.jpeg?auto=compress&cs=tinysrgb&w=900", sortOrder: 4 },
      { caption: "Gel manicure — nude", image: "https://images.pexels.com/photos/3997391/pexels-photo-3997391.jpeg?auto=compress&cs=tinysrgb&w=900", sortOrder: 5 },
      { caption: "Engagement makeup", image: "https://images.pexels.com/photos/457701/pexels-photo-457701.jpeg?auto=compress&cs=tinysrgb&w=900", sortOrder: 6 },
      { caption: "Keratin smooth", image: "https://images.pexels.com/photos/3065171/pexels-photo-3065171.jpeg?auto=compress&cs=tinysrgb&w=900", sortOrder: 7 },
      { caption: "Party waves", image: "https://images.pexels.com/photos/3997981/pexels-photo-3997981.jpeg?auto=compress&cs=tinysrgb&w=900", sortOrder: 8 },
      { caption: "Pedicure + art", image: "https://images.pexels.com/photos/3997376/pexels-photo-3997376.jpeg?auto=compress&cs=tinysrgb&w=900", sortOrder: 9 },
      { caption: "Family bridal glam", image: "https://images.pexels.com/photos/6724348/pexels-photo-6724348.jpeg?auto=compress&cs=tinysrgb&w=900", sortOrder: 10 },
      { caption: "Root touch-up", image: "https://images.pexels.com/photos/3992874/pexels-photo-3992874.jpeg?auto=compress&cs=tinysrgb&w=900", sortOrder: 11 },
      { caption: "Glow Day package", image: "https://images.pexels.com/photos/3738345/pexels-photo-3738345.jpeg?auto=compress&cs=tinysrgb&w=900", sortOrder: 12 },
    ],
  });

  await prisma.offer.create({
    data: {
      title: "Bridal trials through November 2026",
      detail: "Book a wedding-week package before 30 November and the trial is included. Weekday mornings only.",
      cta: "Reserve a trial",
      eyebrow: "Offer · through 30 November 2026",
      expiresAt: new Date("2026-11-30T18:00:00+05:45"),
    },
  });

  await prisma.signature.createMany({
    data: [
      {
        name: "Lived-in balayage + gloss",
        story: "We paint color so the grow-out stays soft. Gloss at the end keeps it shiny without looking freshly done.",
        fromPrice: 8500,
        image: "https://images.pexels.com/photos/3997989/pexels-photo-3997989.jpeg?auto=compress&cs=tinysrgb&w=1100",
        categorySlug: "hair",
        treatmentName: "Lived-in balayage + gloss",
        sortOrder: 1,
      },
      {
        name: "Glass-skin facial",
        story: "A quiet 75 minutes: cleanse, extract only what needs it, then hydrate until the skin looks rested, not tight.",
        fromPrice: 4200,
        image: "https://images.pexels.com/photos/3762875/pexels-photo-3762875.jpeg?auto=compress&cs=tinysrgb&w=1100",
        categorySlug: "skin",
        treatmentName: "Glass-skin facial",
        sortOrder: 2,
      },
      {
        name: "Soft-glam bridal trial",
        story: "We try the look in daylight so you can see it the way guests will. Hair, skin, and draping sit in the same chair.",
        fromPrice: 7500,
        image: "https://images.pexels.com/photos/3997981/pexels-photo-3997981.jpeg?auto=compress&cs=tinysrgb&w=1100",
        categorySlug: "bridal",
        treatmentName: "Bridal trial",
        sortOrder: 3,
      },
    ],
  });

  await prisma.instagramPost.createMany({
    data: [
      { image: "https://images.pexels.com/photos/3738345/pexels-photo-3738345.jpeg?auto=compress&cs=tinysrgb&w=600", alt: "Studio product shelf", sortOrder: 1 },
      { image: "https://images.pexels.com/photos/457701/pexels-photo-457701.jpeg?auto=compress&cs=tinysrgb&w=600", alt: "Makeup flat lay", sortOrder: 2 },
      { image: "https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=600", alt: "Hair tools on linen", sortOrder: 3 },
      { image: "https://images.pexels.com/photos/3997981/pexels-photo-3997981.jpeg?auto=compress&cs=tinysrgb&w=600", alt: "Soft makeup look", sortOrder: 4 },
      { image: "https://images.pexels.com/photos/3997989/pexels-photo-3997989.jpeg?auto=compress&cs=tinysrgb&w=600", alt: "Color result", sortOrder: 5 },
      { image: "https://images.pexels.com/photos/3997391/pexels-photo-3997391.jpeg?auto=compress&cs=tinysrgb&w=600", alt: "Nail detail", sortOrder: 6 },
    ],
  });

  await prisma.studioSetting.create({
    data: {
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
      mapsEmbed: "https://maps.google.com/maps?q=Jhamsikhel%20Road%20Lalitpur%20Nepal&t=&z=16&ie=UTF8&iwloc=&output=embed",
      parking: "Street parking on Jhamsikhel Road. Patan Dhoka buses stop a short walk away.",
      walkIns: "Walk-ins welcome when chairs are free.",
      confirmNote: "We will confirm by phone or WhatsApp within a few hours.",
      aboutWords:
        "Liora is a small studio in Jhamsikhel for people who want their hair and skin to look like them — just clearer. Anisha Basnet opened the room so color, bridal, and facials could happen without rushing the chair. We take time with color so it still looks like you on a Tuesday. The space is quiet, the tools are sanitized between every guest, and we would rather do fewer appointments well.",
      aboutImage: "https://images.pexels.com/photos/3065209/pexels-photo-3065209.jpeg?auto=compress&cs=tinysrgb&w=1200",
      heroImage: "https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=2000",
      googleScore: "4.9",
      googleCount: "210+",
      ownerName: "Anisha Basnet",
      ownerRole: "Creative director",
    },
  });

  const studioRow = await prisma.studioSetting.findUniqueOrThrow({ where: { id: "studio" } });

  await prisma.sectionContent.createMany({
    data: HOME_SECTIONS.map((section) => ({
      key: section.key,
      ...section.values,
      body: (section.values.body ?? "").replace("Anisha Basnet", studioRow.ownerName),
    })),
  });

  await prisma.heroSlide.createMany({
    data: [
      { image: studioRow.heroImage, alt: "Warm salon interior with styling chairs and soft lighting" },
      ...DEFAULT_HERO_SLIDES,
    ].map((slide, index) => ({ ...slide, sortOrder: index + 1 })),
  });

  await prisma.trustItem.createMany({
    data: DEFAULT_TRUST_ITEMS.map((item, index) => ({ ...item, sortOrder: index + 1 })),
  });

  for (const [index, pick] of DEFAULT_RITUAL_PICKS.entries()) {
    const service = await prisma.service.findFirst({
      where: { name: pick.serviceName, category: { slug: pick.categorySlug } },
      select: { id: true },
    });
    if (service) {
      await prisma.ritualPick.create({
        data: { serviceId: service.id, note: pick.note, detail: pick.detail, sortOrder: index + 1 },
      });
    }
  }

  for (const [treatmentName, inclusions] of Object.entries(DEFAULT_SIGNATURE_INCLUSIONS)) {
    await prisma.signature.updateMany({ where: { treatmentName }, data: { inclusions } });
  }

  await prisma.navLink.createMany({
    data: DEFAULT_NAV_LINKS.map((link) => ({
      ...link,
      sortOrder: DEFAULT_NAV_LINKS.filter((other) => other.location === link.location).indexOf(link) + 1,
    })),
  });

  await prisma.socialLink.createMany({
    data: [
      { platform: "instagram", label: "Instagram", href: "https://www.instagram.com/liorastudio.np", sortOrder: 1 },
      { platform: "facebook", label: "Facebook", href: "https://www.facebook.com/liorastudio", sortOrder: 2 },
      { platform: "tiktok", label: "TikTok", href: "https://www.tiktok.com/@liorastudio.np", sortOrder: 3 },
      { platform: "whatsapp", label: "WhatsApp", href: "https://wa.me/9779801234567", sortOrder: 4 },
    ],
  });

  const password = process.env.ADMIN_PASSWORD || "liora-desk";
  await prisma.adminUser.create({
    data: {
      email: (process.env.ADMIN_EMAIL || "desk@liorastudio.com").toLowerCase(),
      name: process.env.ADMIN_NAME || "Studio desk",
      passwordHash: await bcrypt.hash(password, 10),
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
