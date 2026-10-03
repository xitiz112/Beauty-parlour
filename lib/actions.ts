"use server";

import { redirect } from "next/navigation";
import { AppointmentStatus, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { CredentialsSignin } from "next-auth";
import { auth, signIn, signOut } from "@/auth";
import { bool, DEFAULT_HOURS, int, revalidateSite, text, uniqueCategorySlug, uniqueStylistSlug } from "./admin";
import { prisma } from "./prisma";
import { bookSlot } from "./slots";
import { parseDatetimeLocal, parseKathmanduDateTime, timeToMinutes } from "./time";

export type ActionState = {
  error?: string;
  success?: string;
};

const BLOCKING: AppointmentStatus[] = ["pending", "confirmed"];
const STATUSES: AppointmentStatus[] = ["pending", "confirmed", "cancelled", "completed", "no_show"];

function mediaUrls(formData: FormData) {
  try {
    const value: unknown = JSON.parse(text(formData, "mediaUrls") || "[]");
    if (!Array.isArray(value)) return [];
    return [...new Set(value.filter((url): url is string => {
      if (typeof url !== "string" || url.length > 2048) return false;
      try {
        const parsed = new URL(url);
        return parsed.protocol === "https:" || parsed.protocol === "http:";
      } catch {
        return false;
      }
    }))].slice(0, 50);
  } catch {
    return [];
  }
}

export async function createBooking(_: ActionState, formData: FormData): Promise<ActionState> {
  const guestName = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const notes = String(formData.get("notes") || "").trim();
  const serviceId = String(formData.get("serviceId") || "");
  const stylistId = String(formData.get("stylistId") || "");
  const startsAtRaw = String(formData.get("startsAt") || "");

  if (!guestName || !phone || !serviceId || !stylistId || !startsAtRaw) {
    return { error: "Name, phone, treatment, stylist, and a time slot are required." };
  }

  try {
    await bookSlot({
      guestName,
      phone,
      email,
      notes,
      serviceId,
      stylistId,
      startsAt: new Date(startsAtRaw),
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not book that slot." };
  }

  return { success: "Request received. We will confirm by phone or WhatsApp." };
}

export async function loginAdmin(_: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Enter your desk email and password." };
  }

  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch (error) {
    if (error instanceof CredentialsSignin && error.code === "too-many-attempts") {
      return { error: "Too many failed attempts. Try again in a few minutes." };
    }
    return { error: "Those desk details are not right." };
  }

  redirect("/admin");
}

export async function logoutAdmin() {
  await signOut({ redirectTo: "/admin/login" });
}

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }
  return session;
}

function fail(error: unknown, fallback: string) {
  return { error: error instanceof Error ? error.message : fallback };
}

async function nextSort(model: { count: () => Promise<number> }) {
  return (await model.count()) + 1;
}

export async function saveAppointment(_: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const id = text(formData, "id");
  const guestName = text(formData, "guestName");
  const phone = text(formData, "phone");
  const email = text(formData, "email");
  const notes = text(formData, "notes");
  const serviceId = text(formData, "serviceId");
  const stylistId = text(formData, "stylistId");
  const date = text(formData, "date");
  const time = text(formData, "time");
  const statusRaw = text(formData, "status") as AppointmentStatus;
  const status = STATUSES.includes(statusRaw) ? statusRaw : "pending";
  const startsAt = parseKathmanduDateTime(date, time);
  const attachedMedia = mediaUrls(formData);

  if (!guestName || !phone || !serviceId || !stylistId || !startsAt) {
    return { error: "Guest name, phone, treatment, stylist, date, and time are required." };
  }

  try {
    await bookSlot({
      guestName,
      phone,
      email,
      notes,
      serviceId,
      stylistId,
      startsAt,
      status,
      allowPast: true,
      requirePublished: false,
      excludeAppointmentId: id || undefined,
      mediaUrls: attachedMedia,
    });
  } catch (error) {
    return fail(error, "Could not save that booking.");
  }

  revalidateSite();
  redirect(`/admin?date=${date}`);
}

export async function deleteAppointment(_: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = text(formData, "id");
  if (!id) return { error: "Missing appointment." };

  try {
    await prisma.appointment.delete({ where: { id } });
  } catch (error) {
    return fail(error, "Could not delete that appointment.");
  }

  revalidateSite();
  const date = text(formData, "date");
  if (date) redirect(`/admin?date=${encodeURIComponent(date)}`);
  return { success: "Appointment deleted." };
}

export async function updateAppointmentStatus(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  const statusRaw = text(formData, "status") as AppointmentStatus;
  const date = text(formData, "date");
  const params = new URLSearchParams();
  if (date) params.set("date", date);
  const back = params.size ? `/admin?${params}` : "/admin";

  if (!id || !STATUSES.includes(statusRaw)) {
    params.set("error", "Missing booking or status.");
    redirect(`/admin?${params}`);
  }

  const row = await prisma.appointment.findUnique({ where: { id } });
  if (!row) {
    params.set("error", "That booking is gone.");
    redirect(`/admin?${params}`);
  }

  if (BLOCKING.includes(statusRaw)) {
    const clash = await prisma.appointment.findFirst({
      where: {
        stylistId: row.stylistId,
        status: { in: BLOCKING },
        id: { not: id },
        startsAt: { lt: row.endsAt },
        endsAt: { gt: row.startsAt },
      },
    });
    if (clash) {
      params.set("error", "That chair already has a pending or confirmed booking in this time.");
      redirect(`/admin?${params}`);
    }
  }

  await prisma.appointment.update({ where: { id }, data: { status: statusRaw } });
  revalidateSite();
  redirect(back);
}

export async function saveServiceCategory(_: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = text(formData, "id");
  const name = text(formData, "name");
  const teaser = text(formData, "teaser");
  const image = text(formData, "image");
  const fromPrice = int(formData, "fromPrice");
  const sortOrder = int(formData, "sortOrder");
  const featured = bool(formData, "featured");
  const slugInput = text(formData, "slug");
  const attachedMedia = mediaUrls(formData);

  if (!name || !teaser || !image) {
    return { error: "Name, teaser, and image are required." };
  }
  if (fromPrice < 0) {
    return { error: "From-price cannot be negative." };
  }

  try {
    if (id) {
      const slug = slugInput ? await uniqueCategorySlug(slugInput, id) : undefined;
      await prisma.serviceCategory.update({
        where: { id },
        data: { name, teaser, image, mediaUrls: attachedMedia, fromPrice, sortOrder, featured, ...(slug ? { slug } : {}) },
      });
    } else {
      await prisma.serviceCategory.create({
        data: {
          name,
          teaser,
          image,
          mediaUrls: attachedMedia,
          fromPrice,
          sortOrder: sortOrder || (await nextSort(prisma.serviceCategory)),
          featured,
          slug: await uniqueCategorySlug(slugInput || name),
        },
      });
    }
  } catch (error) {
    return fail(error, "Could not save that category.");
  }

  revalidateSite();
  return { success: id ? "Category saved." : "Category added." };
}

export async function deleteServiceCategory(_: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = text(formData, "id");
  if (!id) return { error: "Missing category." };

  const services = await prisma.service.count({ where: { categoryId: id } });
  if (services > 0) {
    return { error: "This category still has treatments. Move or delete them first." };
  }

  await prisma.serviceCategory.delete({ where: { id } });
  revalidateSite();
  return { success: "Category deleted." };
}

export async function saveService(_: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = text(formData, "id");
  const categoryId = text(formData, "categoryId");
  const name = text(formData, "name");
  const description = text(formData, "description");
  const image = text(formData, "image");
  const durationMinutes = int(formData, "durationMinutes");
  const price = int(formData, "price");
  const sortOrder = int(formData, "sortOrder");
  const published = bool(formData, "published");
  const attachedMedia = mediaUrls(formData);

  if (!categoryId || !name) {
    return { error: "Category and name are required." };
  }
  if (durationMinutes <= 0) {
    return { error: "Duration must be at least 1 minute." };
  }
  if (price < 0) {
    return { error: "Price cannot be negative." };
  }

  const category = await prisma.serviceCategory.findUnique({ where: { id: categoryId } });
  if (!category) return { error: "That category does not exist." };

  try {
    if (id) {
      await prisma.service.update({
        where: { id },
        data: { categoryId, name, description: description || null, image: image || null, mediaUrls: attachedMedia, durationMinutes, price, sortOrder, published },
      });
    } else {
      await prisma.service.create({
        data: {
          categoryId,
          name,
          description: description || null,
          image: image || null,
          mediaUrls: attachedMedia,
          durationMinutes,
          price,
          sortOrder: sortOrder || (await prisma.service.count({ where: { categoryId } })) + 1,
          published,
        },
      });
    }
  } catch (error) {
    return fail(error, "Could not save that treatment.");
  }

  revalidateSite();
  return { success: id ? "Treatment saved." : "Treatment added." };
}

export async function deleteService(_: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = text(formData, "id");
  if (!id) return { error: "Missing treatment." };

  const appointments = await prisma.appointment.count({ where: { serviceId: id } });
  if (appointments > 0) {
    await prisma.service.update({ where: { id }, data: { published: false } });
    revalidateSite();
    return { error: "This treatment has appointments, so it was unpublished instead of deleted." };
  }

  await prisma.service.delete({ where: { id } });
  revalidateSite();
  return { success: "Treatment deleted." };
}

async function syncStylistServices(stylistId: string, formData: FormData) {
  const requested = formData.getAll("serviceIds").map((value) => String(value)).filter(Boolean);
  const services = requested.length
    ? await prisma.service.findMany({ where: { id: { in: requested } }, select: { id: true } })
    : [];
  const serviceIds = services.map((row) => row.id);
  const existing = await prisma.stylistService.findMany({ where: { stylistId }, select: { serviceId: true } });
  const existingIds = new Set(existing.map((row) => row.serviceId));

  await prisma.$transaction(async (tx) => {
    await tx.stylistService.deleteMany({
      where: {
        stylistId,
        ...(serviceIds.length ? { serviceId: { notIn: serviceIds } } : {}),
      },
    });

    const additions = serviceIds.filter((serviceId) => !existingIds.has(serviceId));
    if (additions.length) {
      await tx.stylistService.createMany({
        data: additions.map((serviceId) => ({ stylistId, serviceId })),
        skipDuplicates: true,
      });
    }
  });
}

export async function saveStylist(_: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = text(formData, "id");
  const name = text(formData, "name");
  const role = text(formData, "role");
  const specialty = text(formData, "specialty");
  const image = text(formData, "image");
  const slugInput = text(formData, "slug");
  const sortOrder = int(formData, "sortOrder");
  const published = bool(formData, "published");
  const attachedMedia = mediaUrls(formData);

  if (!name || !role || !specialty || !image) {
    return { error: "Name, role, specialty, and image are required." };
  }

  try {
    if (id) {
      const slug = slugInput ? await uniqueStylistSlug(slugInput, id) : undefined;
      await prisma.stylist.update({
        where: { id },
        data: { name, role, specialty, image, mediaUrls: attachedMedia, sortOrder, published, ...(slug ? { slug } : {}) },
      });
      await syncStylistServices(id, formData);
    } else {
      const stylist = await prisma.stylist.create({
        data: {
          name,
          role,
          specialty,
          image,
          mediaUrls: attachedMedia,
          published,
          sortOrder: sortOrder || (await nextSort(prisma.stylist)),
          slug: await uniqueStylistSlug(slugInput || name),
          hours: { create: DEFAULT_HOURS },
        },
      });
      await syncStylistServices(stylist.id, formData);
    }
  } catch (error) {
    return fail(error, "Could not save that stylist.");
  }

  revalidateSite();
  return { success: id ? "Stylist saved." : "Stylist added." };
}

export async function deleteStylist(_: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = text(formData, "id");
  if (!id) return { error: "Missing stylist." };

  const blocking = await prisma.appointment.count({
    where: { stylistId: id, status: { in: BLOCKING } },
  });
  if (blocking > 0) {
    return { error: "This stylist has pending or confirmed bookings. Unpublish them instead." };
  }

  const history = await prisma.appointment.count({ where: { stylistId: id } });
  if (history > 0) {
    await prisma.stylist.update({ where: { id }, data: { published: false } });
    revalidateSite();
    return { error: "This stylist has past appointments, so they were unpublished instead of deleted." };
  }

  await prisma.stylist.delete({ where: { id } });
  revalidateSite();
  return { success: "Stylist deleted." };
}

export async function saveWorkingHour(_: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = text(formData, "id");
  const stylistId = text(formData, "stylistId");
  const dayOfWeek = int(formData, "dayOfWeek", -1);
  const startMin = timeToMinutes(text(formData, "startMin") || "0");
  const endMin = timeToMinutes(text(formData, "endMin") || "0");
  const attachedMedia = mediaUrls(formData);

  if (dayOfWeek < 0 || dayOfWeek > 6) {
    return { error: "Choose a weekday." };
  }
  if (!Number.isFinite(startMin) || !Number.isFinite(endMin) || startMin >= endMin) {
    return { error: "End time must be after start time." };
  }

  try {
    if (id) {
      await prisma.workingHour.update({
        where: { id },
        data: { dayOfWeek, startMin, endMin, mediaUrls: attachedMedia },
      });
    } else {
      if (!stylistId) return { error: "Missing stylist." };
      await prisma.workingHour.create({
        data: { stylistId, dayOfWeek, startMin, endMin, mediaUrls: attachedMedia },
      });
    }
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return { error: "That stylist already has hours for this day." };
    }
    return fail(error, "Could not save those hours.");
  }

  revalidateSite();
  return { success: "Hours saved." };
}

export async function saveStylistServiceMedia(_: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const stylistId = text(formData, "stylistId");
  const serviceId = text(formData, "serviceId");
  if (!stylistId || !serviceId) return { error: "A stylist and service are required." };

  const link = await prisma.stylistService.findUnique({
    where: { stylistId_serviceId: { stylistId, serviceId } },
  });
  if (!link) return { error: "Assign the treatment to this stylist before adding portfolio media." };

  await prisma.stylistService.update({
    where: { stylistId_serviceId: { stylistId, serviceId } },
    data: { mediaUrls: mediaUrls(formData) },
  });
  revalidateSite();
  return { success: "Treatment portfolio media saved." };
}

export async function deleteWorkingHour(_: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = text(formData, "id");
  if (!id) return { error: "Missing hours." };
  await prisma.workingHour.delete({ where: { id } });
  revalidateSite();
  return { success: "Hours removed." };
}

export async function saveGalleryItem(_: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = text(formData, "id");
  const caption = text(formData, "caption");
  const image = text(formData, "image");
  const sortOrder = int(formData, "sortOrder");
  const published = bool(formData, "published");
  const attachedMedia = mediaUrls(formData);

  if (!caption || !image) {
    return { error: "Caption and image are required." };
  }

  if (id) {
    await prisma.galleryItem.update({
      where: { id },
      data: { caption, image, mediaUrls: attachedMedia, sortOrder, published },
    });
  } else {
    await prisma.galleryItem.create({
      data: {
        caption,
        image,
        mediaUrls: attachedMedia,
        published,
        sortOrder: sortOrder || (await nextSort(prisma.galleryItem)),
      },
    });
  }

  revalidateSite();
  return { success: id ? "Look saved." : "Look added." };
}

export async function deleteGalleryItem(_: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = text(formData, "id");
  if (!id) return { error: "Missing look." };
  await prisma.galleryItem.delete({ where: { id } });
  revalidateSite();
  return { success: "Look deleted." };
}

export async function saveReview(_: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = text(formData, "id");
  const guestName = text(formData, "guestName");
  const service = text(formData, "service");
  const quote = text(formData, "quote");
  const rating = int(formData, "rating", 5);
  const sortOrder = int(formData, "sortOrder");
  const published = bool(formData, "published");
  const attachedMedia = mediaUrls(formData);

  if (!guestName || !service || !quote) {
    return { error: "Guest, service, and quote are required." };
  }
  if (rating < 1 || rating > 5) {
    return { error: "Rating must be between 1 and 5." };
  }

  if (id) {
    await prisma.review.update({
      where: { id },
      data: { guestName, service, quote, rating, mediaUrls: attachedMedia, sortOrder, published },
    });
  } else {
    await prisma.review.create({
      data: {
        guestName,
        service,
        quote,
        mediaUrls: attachedMedia,
        rating,
        published,
        sortOrder: sortOrder || (await nextSort(prisma.review)),
      },
    });
  }

  revalidateSite();
  return { success: id ? "Review saved." : "Review added." };
}

export async function deleteReview(_: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = text(formData, "id");
  if (!id) return { error: "Missing review." };
  await prisma.review.delete({ where: { id } });
  revalidateSite();
  return { success: "Review deleted." };
}

export async function saveOffer(_: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = text(formData, "id");
  const title = text(formData, "title");
  const detail = text(formData, "detail");
  const cta = text(formData, "cta");
  const eyebrow = text(formData, "eyebrow");
  const expiresRaw = text(formData, "expiresAt");
  const active = bool(formData, "active");
  const attachedMedia = mediaUrls(formData);
  const expiresAt = expiresRaw ? parseDatetimeLocal(expiresRaw) : null;

  if (!title || !detail || !cta) {
    return { error: "Title, detail, and button label are required." };
  }
  if (expiresRaw && !expiresAt) {
    return { error: "Expiry date is not valid." };
  }

  if (id) {
    await prisma.offer.update({
      where: { id },
      data: { title, detail, cta, mediaUrls: attachedMedia, eyebrow: eyebrow || null, expiresAt, active },
    });
  } else {
    await prisma.offer.create({
      data: { title, detail, cta, mediaUrls: attachedMedia, eyebrow: eyebrow || null, expiresAt, active },
    });
  }

  revalidateSite();
  return { success: id ? "Offer saved." : "Offer added." };
}

export async function deleteOffer(_: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = text(formData, "id");
  if (!id) return { error: "Missing offer." };
  await prisma.offer.delete({ where: { id } });
  revalidateSite();
  return { success: "Offer deleted." };
}

export async function saveSignature(_: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = text(formData, "id");
  const name = text(formData, "name");
  const story = text(formData, "story");
  const image = text(formData, "image");
  const categorySlug = text(formData, "categorySlug");
  const treatmentName = text(formData, "treatmentName");
  const fromPrice = int(formData, "fromPrice");
  const sortOrder = int(formData, "sortOrder");
  const attachedMedia = mediaUrls(formData);

  if (!name || !story || !image || !categorySlug || !treatmentName) {
    return { error: "Name, story, image, category, and treatment name are required." };
  }
  if (fromPrice < 0) {
    return { error: "From-price cannot be negative." };
  }

  const category = await prisma.serviceCategory.findUnique({
    where: { slug: categorySlug },
    include: { services: true },
  });
  if (!category) {
    return { error: "categorySlug must match an existing service category." };
  }
  const treatment = category.services.find((service) => service.name === treatmentName);
  if (!treatment) {
    return { error: "treatmentName must match a treatment in that category so booking prefill still works." };
  }

  if (id) {
    await prisma.signature.update({
      where: { id },
      data: { name, story, image, mediaUrls: attachedMedia, categorySlug, treatmentName, fromPrice, sortOrder },
    });
  } else {
    await prisma.signature.create({
      data: {
        name,
        story,
        image,
        mediaUrls: attachedMedia,
        categorySlug,
        treatmentName,
        fromPrice,
        sortOrder: sortOrder || (await nextSort(prisma.signature)),
      },
    });
  }

  revalidateSite();
  return { success: id ? "Signature saved." : "Signature added." };
}

export async function deleteSignature(_: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = text(formData, "id");
  if (!id) return { error: "Missing signature." };
  await prisma.signature.delete({ where: { id } });
  revalidateSite();
  return { success: "Signature deleted." };
}

export async function saveInstagramPost(_: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = text(formData, "id");
  const image = text(formData, "image");
  const alt = text(formData, "alt");
  const sortOrder = int(formData, "sortOrder");
  const attachedMedia = mediaUrls(formData);

  if (!image || !alt) {
    return { error: "Image and alt text are required." };
  }

  if (id) {
    await prisma.instagramPost.update({
      where: { id },
      data: { image, alt, mediaUrls: attachedMedia, sortOrder },
    });
  } else {
    await prisma.instagramPost.create({
      data: { image, alt, mediaUrls: attachedMedia, sortOrder: sortOrder || (await nextSort(prisma.instagramPost)) },
    });
  }

  revalidateSite();
  return { success: id ? "Post saved." : "Post added." };
}

export async function deleteInstagramPost(_: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = text(formData, "id");
  if (!id) return { error: "Missing post." };
  await prisma.instagramPost.delete({ where: { id } });
  revalidateSite();
  return { success: "Post deleted." };
}

export async function updateStudioSetting(_: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const fields = [
    "name",
    "shortName",
    "tagline",
    "city",
    "neighborhood",
    "address",
    "landmark",
    "phone",
    "phoneHref",
    "whatsapp",
    "whatsappHref",
    "email",
    "instagram",
    "instagramHref",
    "facebookHref",
    "mapsEmbed",
    "parking",
    "walkIns",
    "confirmNote",
    "aboutWords",
    "aboutImage",
    "heroImage",
    "googleScore",
    "googleCount",
    "ownerName",
    "ownerRole",
  ] as const;

  const data: Prisma.StudioSettingUpdateInput = { mediaUrls: mediaUrls(formData) };
  for (const key of fields) {
    const value = text(formData, key);
    if (!value) {
      return { error: `${key} is required.` };
    }
    data[key] = value;
  }

  await prisma.studioSetting.update({
    where: { id: "studio" },
    data,
  });
  revalidateSite();
  return { success: "Studio details saved." };
}

export async function updateDeskAccount(_: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireAdmin();
  const userId = session.user.id;
  const name = text(formData, "name");
  const email = text(formData, "email").toLowerCase();
  const currentPassword = text(formData, "currentPassword");
  const newPassword = text(formData, "newPassword");
  const confirmPassword = text(formData, "confirmPassword");

  if (!userId) {
    return { error: "Your desk session is missing. Sign in again." };
  }
  if (!name || !email) {
    return { error: "Name and email are required." };
  }

  const user = await prisma.adminUser.findUnique({ where: { id: userId } });
  if (!user) {
    return { error: "This desk user was not found." };
  }

  if (email !== user.email) {
    const taken = await prisma.adminUser.findUnique({ where: { email } });
    if (taken) return { error: "That email is already in use." };
  }

  const data: { name: string; email: string; passwordHash?: string; mediaUrls?: string[] } = {
    name,
    email,
    mediaUrls: mediaUrls(formData),
  };

  if (newPassword || confirmPassword) {
    if (!currentPassword) {
      return { error: "Enter your current password to change it." };
    }
    if (newPassword.length < 8) {
      return { error: "New password must be at least 8 characters." };
    }
    if (newPassword !== confirmPassword) {
      return { error: "New password and confirmation do not match." };
    }
    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) {
      return { error: "Current password is not right." };
    }
    data.passwordHash = await bcrypt.hash(newPassword, 10);
  }

  await prisma.adminUser.update({ where: { id: userId }, data });
  revalidateSite();
  return { success: newPassword ? "Desk details and password saved." : "Desk details saved." };
}

export async function saveAdminUser(_: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = text(formData, "id");
  const name = text(formData, "name");
  const email = text(formData, "email").toLowerCase();
  const password = text(formData, "password");
  const attachedMedia = mediaUrls(formData);

  if (!name || !email || !/^\S+@\S+\.\S+$/.test(email)) {
    return { error: "Enter a name and valid email address." };
  }
  if (!id && password.length < 12) {
    return { error: "New desk accounts need a password of at least 12 characters." };
  }
  if (password && password.length < 12) {
    return { error: "Passwords must be at least 12 characters." };
  }

  try {
    if (id) {
      const existing = await prisma.adminUser.findUnique({ where: { id } });
      if (!existing) return { error: "That desk account no longer exists." };
      if (email !== existing.email) {
        const duplicate = await prisma.adminUser.findUnique({ where: { email } });
        if (duplicate) return { error: "That email is already assigned to another desk account." };
      }
      await prisma.adminUser.update({
        where: { id },
        data: {
          name,
          email,
          mediaUrls: attachedMedia,
          ...(password ? { passwordHash: await bcrypt.hash(password, 12) } : {}),
        },
      });
    } else {
      await prisma.adminUser.create({
        data: { name, email, mediaUrls: attachedMedia, passwordHash: await bcrypt.hash(password, 12) },
      });
    }
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return { error: "That email is already assigned to another desk account." };
    }
    return fail(error, "Could not save the desk account.");
  }

  revalidateSite();
  return { success: id ? "Desk account saved." : "Desk account created." };
}

export async function deleteAdminUser(_: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireAdmin();
  const id = text(formData, "id");
  if (!id) return { error: "Missing desk account." };
  if (id === session.user.id) return { error: "You cannot delete the account you are currently using." };

  const count = await prisma.adminUser.count();
  if (count <= 1) return { error: "At least one desk account must remain." };

  try {
    await prisma.adminUser.delete({ where: { id } });
  } catch (error) {
    return fail(error, "Could not delete that desk account.");
  }

  revalidateSite();
  return { success: "Desk account deleted." };
}

export async function updateService(formData: FormData) {
  return saveService({}, formData);
}

export async function updateStylist(formData: FormData) {
  return saveStylist({}, formData);
}

export async function updateWorkingHour(formData: FormData) {
  return saveWorkingHour({}, formData);
}

export async function updateGalleryItem(formData: FormData) {
  return saveGalleryItem({}, formData);
}

export async function createGalleryItem(formData: FormData) {
  return saveGalleryItem({}, formData);
}

export async function updateReview(formData: FormData) {
  return saveReview({}, formData);
}

export async function createReview(formData: FormData) {
  return saveReview({}, formData);
}
