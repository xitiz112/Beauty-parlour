import type { SectionContent } from "@prisma/client";
import { prisma } from "./prisma";
import { HOME_SECTIONS } from "./site-defaults";

export async function getStudio() {
  const studio = await prisma.studioSetting.findUnique({ where: { id: "studio" } });
  if (!studio) {
    throw new Error("Studio settings are missing. Run prisma db seed.");
  }
  return studio;
}

// Published header/footer links and social icons, in display order.
export async function getLayoutContent() {
  const [navLinks, socialLinks] = await Promise.all([
    prisma.navLink.findMany({ where: { published: true }, orderBy: [{ sortOrder: "asc" }, { label: "asc" }] }),
    prisma.socialLink.findMany({ where: { published: true }, orderBy: [{ sortOrder: "asc" }, { label: "asc" }] }),
  ]);
  return {
    headerLinks: navLinks.filter((link) => link.location === "header"),
    exploreLinks: navLinks.filter((link) => link.location === "footer_explore"),
    legalLinks: navLinks.filter((link) => link.location === "footer_legal"),
    socialLinks,
  };
}

export type LayoutContent = Awaited<ReturnType<typeof getLayoutContent>>;

// Lightweight lists for the site-wide booking popup.
export async function getBookingOptions() {
  const [categories, stylists] = await Promise.all([
    prisma.serviceCategory.findMany({
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        slug: true,
        name: true,
        services: { where: { published: true }, orderBy: { sortOrder: "asc" }, select: { id: true, name: true } },
      },
    }),
    prisma.stylist.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, role: true },
    }),
  ]);
  return { categories, stylists };
}

// Every homepage section, falling back to the starting copy if its row is missing.
export async function getSections() {
  const rows = await prisma.sectionContent.findMany();
  const byKey = new Map(rows.map((row) => [row.key, row]));
  return Object.fromEntries(
    HOME_SECTIONS.map((section) => {
      const row = byKey.get(section.key);
      const fallback: SectionContent = {
        key: section.key,
        eyebrow: section.values.eyebrow ?? "",
        title: section.values.title ?? "",
        body: section.values.body ?? "",
        details: section.values.details ?? "",
        ctaLabel: section.values.ctaLabel ?? "",
        secondaryCtaLabel: section.values.secondaryCtaLabel ?? "",
        visible: true,
      };
      return [section.key, row ?? fallback];
    }),
  ) as Record<string, SectionContent>;
}

export async function getPublicCatalog() {
  const [studio, categories, stylists, reviews, gallery, offer, signatures, instagram, sections, heroSlides, trustItems, ritualPicks] = await Promise.all([
    getStudio(),
    prisma.serviceCategory.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        services: {
          where: { published: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    }),
    prisma.stylist.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
      include: {
        services: { include: { service: true } },
      },
    }),
    prisma.review.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.galleryItem.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.offer.findFirst({
      where: { active: true },
      orderBy: { expiresAt: "desc" },
    }),
    prisma.signature.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.instagramPost.findMany({ orderBy: { sortOrder: "asc" } }),
    getSections(),
    prisma.heroSlide.findMany({ where: { published: true }, orderBy: { sortOrder: "asc" } }),
    prisma.trustItem.findMany({ where: { published: true }, orderBy: { sortOrder: "asc" } }),
    prisma.ritualPick.findMany({
      where: { published: true, service: { published: true } },
      orderBy: { sortOrder: "asc" },
      include: { service: { include: { category: true } } },
    }),
  ]);

  return {
    studio,
    categories,
    stylists,
    reviews,
    gallery,
    offer,
    signatures,
    instagram,
    sections,
    heroSlides,
    trustItems,
    ritualPicks,
  };
}
