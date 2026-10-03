import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { slugify } from "./time";

export const PUBLIC_PATHS = ["/"] as const;

export const ADMIN_PATHS = [
  "/admin",
  "/admin/services",
  "/admin/team",
  "/admin/gallery",
  "/admin/reviews",
  "/admin/content",
  "/admin/users",
  "/admin/settings",
] as const;

export function revalidateSite() {
  for (const path of [...PUBLIC_PATHS, ...ADMIN_PATHS]) {
    revalidatePath(path);
  }
}

export function text(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

export function bool(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

export function int(formData: FormData, key: string, fallback = 0) {
  const value = Number(formData.get(key));
  return Number.isFinite(value) ? value : fallback;
}

export async function uniqueSlug(
  value: string,
  exists: (slug: string) => Promise<{ id: string } | null>,
  excludeId?: string,
) {
  const base = slugify(value) || "item";
  let slug = base;
  let n = 2;
  while (true) {
    const row = await exists(slug);
    if (!row || row.id === excludeId) return slug;
    slug = `${base}-${n++}`;
  }
}

export async function uniqueCategorySlug(name: string, excludeId?: string) {
  return uniqueSlug(name, (slug) => prisma.serviceCategory.findUnique({ where: { slug }, select: { id: true } }), excludeId);
}

export async function uniqueStylistSlug(name: string, excludeId?: string) {
  return uniqueSlug(name, (slug) => prisma.stylist.findUnique({ where: { slug }, select: { id: true } }), excludeId);
}

export const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const DEFAULT_HOURS = [
  { dayOfWeek: 0, startMin: 10 * 60, endMin: 19 * 60 },
  { dayOfWeek: 1, startMin: 10 * 60, endMin: 19 * 60 },
  { dayOfWeek: 2, startMin: 10 * 60, endMin: 19 * 60 },
  { dayOfWeek: 3, startMin: 10 * 60, endMin: 19 * 60 },
  { dayOfWeek: 4, startMin: 10 * 60, endMin: 19 * 60 },
  { dayOfWeek: 5, startMin: 10 * 60, endMin: 19 * 60 },
  { dayOfWeek: 6, startMin: 9 * 60, endMin: 18 * 60 },
];
