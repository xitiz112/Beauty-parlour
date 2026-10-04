-- Homepage content managed from the admin dashboard.

-- AlterTable
ALTER TABLE "Signature" ADD COLUMN     "inclusions" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "SectionContent" (
    "key" TEXT NOT NULL,
    "eyebrow" TEXT NOT NULL DEFAULT '',
    "title" TEXT NOT NULL DEFAULT '',
    "body" TEXT NOT NULL DEFAULT '',
    "details" TEXT NOT NULL DEFAULT '',
    "ctaLabel" TEXT NOT NULL DEFAULT '',
    "secondaryCtaLabel" TEXT NOT NULL DEFAULT '',
    "visible" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "SectionContent_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "HeroSlide" (
    "id" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "alt" TEXT NOT NULL,
    "mediaUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "HeroSlide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrustItem" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "suffix" TEXT NOT NULL DEFAULT '',
    "label" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TrustItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RitualPick" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "RitualPick_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RitualPick" ADD CONSTRAINT "RitualPick_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Starting content: what the homepage showed before this migration.
INSERT INTO "SectionContent" ("key", "eyebrow", "title", "body", "details", "ctaLabel", "secondaryCtaLabel") VALUES
  ('hero', '', 'Beauty, at a gentler pace.', 'Thoughtful hair, skin, nail, and bridal care in a calm Jhamsikhel studio—personalized for you and made to feel good long after you leave.', '', 'Request an appointment', 'Explore services'),
  ('services', 'Menu', 'Find your kind of care.', 'A considered selection of hair, skin, makeup, nail, bridal, and package services, with starting prices shown on each card.', '', '', ''),
  ('rituals', '04 / Curated menu', 'Featured Botanical Rituals', '', '', 'Book this ritual', ''),
  ('signature', 'This season', 'Our popular packages.', '', 'Included in this treatment', 'Book now', ''),
  ('about', 'About us', 'A smaller room, on purpose.', 'Anisha Basnet started Liora in Jhamsikhel after years of working rooms that booked too tightly. Color, bridal, skin, and nails share one quiet floor, and every tool is sanitized between guests. We take time with color so it still looks like you on a Tuesday. If a look will not grow out kindly, we say so before the first foil goes in.', '', 'Book an appointment', ''),
  ('gallery', 'Our work', 'Looks from the studio.', '', '', '', ''),
  ('team', 'Our team', 'Meet the people behind the chair.', '', '', '', ''),
  ('reviews', 'Reviews', 'What guests remember.', '', '', '', ''),
  ('contact', 'The sanctuary', 'Visit Liora', 'Find us in the heart of Jhamsikhel. Step inside, take a breath, and let us make a little space for you.', 'Sunday–Friday · 10:00 AM – 7:00 PM
Saturday · 9:00 AM – 6:00 PM', '', ''),
  ('instagram', 'Instagram', '', '', '', 'Follow', '');

-- The about copy used the owner's name from Settings.
UPDATE "SectionContent" SET "body" = replace("body", 'Anisha Basnet', s."ownerName") FROM "StudioSetting" s WHERE "SectionContent"."key" = 'about';

-- Hero slides: the Settings hero image first, then the four fixed photos.
INSERT INTO "HeroSlide" ("id", "image", "alt", "sortOrder")
SELECT gen_random_uuid()::text, "heroImage", 'Warm salon interior with styling chairs and soft lighting', 1 FROM "StudioSetting" WHERE "heroImage" <> '';
INSERT INTO "HeroSlide" ("id", "image", "alt", "sortOrder") VALUES
  (gen_random_uuid()::text, 'https://images.pexels.com/photos/3997989/pexels-photo-3997989.jpeg?auto=compress&cs=tinysrgb&w=2000', 'Lived-in balayage and gloss', 2),
  (gen_random_uuid()::text, 'https://images.pexels.com/photos/3065171/pexels-photo-3065171.jpeg?auto=compress&cs=tinysrgb&w=2000', 'Smooth keratin finish', 3),
  (gen_random_uuid()::text, 'https://images.pexels.com/photos/853427/pexels-photo-853427.jpeg?auto=compress&cs=tinysrgb&w=2000', 'Soft bridal glam', 4),
  (gen_random_uuid()::text, 'https://images.pexels.com/photos/3762875/pexels-photo-3762875.jpeg?auto=compress&cs=tinysrgb&w=2000', 'Quiet facial treatment', 5);

INSERT INTO "TrustItem" ("id", "value", "suffix", "label", "sortOrder") VALUES
  (gen_random_uuid()::text, '8', '+', 'Years in Jhamsikhel', 1),
  (gen_random_uuid()::text, '400', '+', 'Brides styled', 2),
  (gen_random_uuid()::text, 'Keratin & color', '', 'Signature strength', 3),
  (gen_random_uuid()::text, 'Sanitized tools', '', 'Every single chair', 4);

-- Featured rituals point at existing services (skipped if a service no longer exists).
INSERT INTO "RitualPick" ("id", "serviceId", "note", "detail", "sortOrder")
SELECT gen_random_uuid()::text, sv."id", 'Herbal-inspired hair and scalp care', 'A restorative scalp-focused service with a finish tailored to your hair’s needs.', 1
FROM "Service" sv JOIN "ServiceCategory" c ON c."id" = sv."categoryId"
WHERE c."slug" = 'hair' AND sv."name" = 'Treatment & scalp care'
LIMIT 1;
INSERT INTO "RitualPick" ("id", "serviceId", "note", "detail", "sortOrder")
SELECT gen_random_uuid()::text, sv."id", 'Deeply hydrating facial', 'A hydrating facial ritual paced to your skin, leaving time for a calm, considered finish.', 2
FROM "Service" sv JOIN "ServiceCategory" c ON c."id" = sv."categoryId"
WHERE c."slug" = 'skin' AND sv."name" = 'Hydra glow'
LIMIT 1;
INSERT INTO "RitualPick" ("id", "serviceId", "note", "detail", "sortOrder")
SELECT gen_random_uuid()::text, sv."id", 'Dimensional color and conditioning gloss', 'Hand-painted color and a gloss chosen to keep the result soft, shiny, and easy to grow out.', 3
FROM "Service" sv JOIN "ServiceCategory" c ON c."id" = sv."categoryId"
WHERE c."slug" = 'hair' AND sv."name" = 'Lived-in balayage + gloss'
LIMIT 1;
INSERT INTO "RitualPick" ("id", "serviceId", "note", "detail", "sortOrder")
SELECT gen_random_uuid()::text, sv."id", 'Advanced facial therapy', 'A thoughtful cleanse, targeted care, and hydration, adjusted to your skin on the day.', 4
FROM "Service" sv JOIN "ServiceCategory" c ON c."id" = sv."categoryId"
WHERE c."slug" = 'skin' AND sv."name" = 'Glass-skin facial'
LIMIT 1;

-- Package checklists that were written into the page.
UPDATE "Signature" SET "inclusions" = ARRAY['Personalized color consultation', 'Hand-painted balayage', 'Gloss and conditioning finish']::TEXT[] WHERE "treatmentName" = 'Lived-in balayage + gloss';
UPDATE "Signature" SET "inclusions" = ARRAY['Skin consultation', 'Gentle cleanse and targeted care', 'Deep hydration and finishing']::TEXT[] WHERE "treatmentName" = 'Glass-skin facial';
UPDATE "Signature" SET "inclusions" = ARRAY['Daylight look consultation', 'Hair and makeup trial', 'First drape and reference photos']::TEXT[] WHERE "treatmentName" = 'Bridal trial';

-- The site used to pad the reviews carousel with this review when there were fewer than four.
-- Store it as a normal review so it can be edited or deleted under Admin → Reviews.
INSERT INTO "Review" ("id", "guestName", "service", "rating", "quote", "published", "sortOrder")
SELECT gen_random_uuid()::text, 'Anuja', 'Classic manicure', 5,
  'The team made me feel welcome from the moment I arrived. My manicure was thoughtful, precise, and still looked lovely days later.',
  true, 4
WHERE (SELECT count(*) FROM "Review" WHERE "published") < 4
  AND NOT EXISTS (SELECT 1 FROM "Review" WHERE "guestName" = 'Anuja' AND "service" = 'Classic manicure');
