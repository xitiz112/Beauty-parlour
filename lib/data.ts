import { prisma } from "./prisma";

export async function getStudio() {
  const studio = await prisma.studioSetting.findUnique({ where: { id: "studio" } });
  if (!studio) {
    throw new Error("Studio settings are missing. Run prisma db seed.");
  }
  return studio;
}

export async function getPublicCatalog() {
  const [studio, categories, stylists, reviews, gallery, offer, signatures, instagram] = await Promise.all([
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
  ]);

  const featuredGuestReview = {
    id: "featured-guest-review",
    guestName: "Anuja",
    service: "Classic manicure",
    rating: 5,
    quote: "The team made me feel welcome from the moment I arrived. My manicure was thoughtful, precise, and still looked lovely days later.",
    published: true,
    sortOrder: 4,
  };
  const publicReviews = reviews.length < 4 ? [...reviews, featuredGuestReview] : reviews;

  return { studio, categories, stylists, reviews: publicReviews, gallery, offer, signatures, instagram };
}
