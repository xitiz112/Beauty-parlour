-- Header & footer content managed from the admin dashboard.

-- CreateEnum
CREATE TYPE "NavLocation" AS ENUM ('header', 'footer_explore', 'footer_legal');

-- AlterTable
ALTER TABLE "StudioSetting"
  ADD COLUMN "logoSubtitle" TEXT NOT NULL DEFAULT 'Beauty Studio',
  ADD COLUMN "headerCtaLabel" TEXT NOT NULL DEFAULT 'Book an appointment',
  ADD COLUMN "showHeaderPhone" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "footerVisitTitle" TEXT NOT NULL DEFAULT 'Visit',
  ADD COLUMN "footerExploreTitle" TEXT NOT NULL DEFAULT 'Explore',
  ADD COLUMN "footerSocialTitle" TEXT NOT NULL DEFAULT 'Follow us',
  ADD COLUMN "copyrightText" TEXT NOT NULL DEFAULT 'All rights reserved.';

-- CreateTable
CREATE TABLE "NavLink" (
    "id" TEXT NOT NULL,
    "location" "NavLocation" NOT NULL,
    "label" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "newTab" BOOLEAN NOT NULL DEFAULT false,
    "opensBooking" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "NavLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialLink" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "SocialLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NavLink_location_sortOrder_idx" ON "NavLink"("location", "sortOrder");

-- Carry over the links the site showed before this migration.
INSERT INTO "NavLink" ("id", "location", "label", "href", "sortOrder", "opensBooking") VALUES
  (gen_random_uuid()::text, 'header', 'Home', '/#home', 1, false),
  (gen_random_uuid()::text, 'header', 'Our Menu', '/#services', 2, false),
  (gen_random_uuid()::text, 'header', 'Packages', '/#signature', 3, false),
  (gen_random_uuid()::text, 'header', 'About', '/#about', 4, false),
  (gen_random_uuid()::text, 'header', 'Gallery', '/#gallery', 5, false),
  (gen_random_uuid()::text, 'header', 'Availability', '/#contact', 6, false),
  (gen_random_uuid()::text, 'footer_explore', 'Our Menu', '/#services', 1, false),
  (gen_random_uuid()::text, 'footer_explore', 'Packages', '/#signature', 2, false),
  (gen_random_uuid()::text, 'footer_explore', 'Availability', '/#contact', 3, false),
  (gen_random_uuid()::text, 'footer_explore', 'Gallery', '/#gallery', 4, false),
  (gen_random_uuid()::text, 'footer_explore', 'Request appointment', '/#contact', 5, true),
  (gen_random_uuid()::text, 'footer_legal', 'Privacy Policy', '/privacy', 1, false),
  (gen_random_uuid()::text, 'footer_legal', 'Terms of Service', '/cancellation', 2, false);

INSERT INTO "SocialLink" ("id", "platform", "label", "href", "sortOrder")
SELECT gen_random_uuid()::text, 'instagram', 'Instagram', "instagramHref", 1 FROM "StudioSetting" WHERE "instagramHref" <> ''
UNION ALL
SELECT gen_random_uuid()::text, 'facebook', 'Facebook', "facebookHref", 2 FROM "StudioSetting" WHERE "facebookHref" <> ''
UNION ALL
SELECT gen_random_uuid()::text, 'tiktok', 'TikTok', 'https://www.tiktok.com/@liorastudio.np', 3 FROM "StudioSetting"
UNION ALL
SELECT gen_random_uuid()::text, 'whatsapp', 'WhatsApp', "whatsappHref", 4 FROM "StudioSetting" WHERE "whatsappHref" <> '';
