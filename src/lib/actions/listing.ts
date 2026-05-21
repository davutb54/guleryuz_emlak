"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  listingCreateSchema,
  listingUpdateSchema,
  listingStatusSchema,
} from "@/lib/validations/listing";
import {
  generateUniqueSlug,
  generateUniqueSlugExcluding,
} from "@/lib/slug";
import { auditLog } from "@/lib/audit";

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

async function getAuthorizedUser() {
  const session = await auth();
  if (!session?.user) return null;
  if (!["AGENT", "ADMIN", "SUPER_ADMIN"].includes(session.user.role))
    return null;
  return session.user;
}

export async function createListing(
  raw: unknown
): Promise<ActionResult<{ id: string; slug: string }>> {
  const user = await getAuthorizedUser();
  if (!user) return { success: false, error: "Yetkisiz erişim" };

  const parsed = listingCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Geçersiz veri",
    };
  }

  const slug = await generateUniqueSlug(
    parsed.data.titleTr,
    parsed.data.district,
    parsed.data.rooms
  );

  const listing = await db.listing.create({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: { ...(parsed.data as any), slug, agentId: user.id },
    select: { id: true, slug: true },
  });

  await auditLog(user.id, "listing.create", "Listing", listing.id, {
    title: parsed.data.titleTr,
    slug: listing.slug,
  });

  revalidatePath("/", "layout");
  return { success: true, data: listing };
}

export async function updateListing(
  id: string,
  raw: unknown
): Promise<ActionResult> {
  const user = await getAuthorizedUser();
  if (!user) return { success: false, error: "Yetkisiz erişim" };

  const existing = await db.listing.findUnique({
    where: { id },
    select: { slug: true, titleTr: true, district: true, rooms: true },
  });
  if (!existing) return { success: false, error: "İlan bulunamadı" };

  const parsed = listingUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Geçersiz veri",
    };
  }

  let slug = existing.slug;
  if (parsed.data.titleTr || parsed.data.district) {
    slug = await generateUniqueSlugExcluding(
      parsed.data.titleTr ?? existing.titleTr,
      parsed.data.district ?? existing.district,
      id,
      parsed.data.rooms !== undefined ? parsed.data.rooms : existing.rooms
    );
  }

  await db.listing.update({
    where: { id },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: { ...(parsed.data as any), slug },
  });

  await auditLog(user.id, "listing.update", "Listing", id, {
    title: parsed.data.titleTr ?? existing.titleTr,
  });

  revalidatePath("/", "layout");
  return { success: true };
}

export async function deleteListing(id: string): Promise<ActionResult> {
  const user = await getAuthorizedUser();
  if (!user) return { success: false, error: "Yetkisiz erişim" };

  const listing = await db.listing.findUnique({
    where: { id },
    select: { titleTr: true, slug: true },
  });

  await db.listing.delete({ where: { id } });

  await auditLog(user.id, "listing.delete", "Listing", id, {
    title: listing?.titleTr,
    slug: listing?.slug,
  });

  revalidatePath("/", "layout");
  return { success: true };
}

export async function saveListingImages(
  listingId: string,
  images: { url: string; type?: string; isPrimary: boolean; order: number }[]
): Promise<ActionResult> {
  const user = await getAuthorizedUser();
  if (!user) return { success: false, error: "Yetkisiz erişim" };

  // Mevcut görselleri sil, yenilerini ekle
  await db.listingImage.deleteMany({ where: { listingId } });

  if (images.length > 0) {
    await db.listingImage.createMany({
      data: images.map((img) => ({
        listingId,
        url: img.url,
        type: img.type ?? "image",
        isPrimary: img.isPrimary,
        order: img.order,
        alt: null,
      })),
    });
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function changeListingStatus(
  id: string,
  raw: unknown
): Promise<ActionResult> {
  const user = await getAuthorizedUser();
  if (!user) return { success: false, error: "Yetkisiz erişim" };

  const parsed = listingStatusSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: "Geçersiz durum" };

  await db.listing.update({
    where: { id },
    data: { status: parsed.data.status },
  });

  await auditLog(user.id, "listing.status_change", "Listing", id, {
    status: parsed.data.status,
  });

  revalidatePath("/", "layout");
  return { success: true };
}

export async function toggleFeatured(id: string): Promise<ActionResult> {
  const user = await getAuthorizedUser();
  if (!user) return { success: false, error: "Yetkisiz erişim" };

  const listing = await db.listing.findUnique({ where: { id }, select: { featured: true, titleTr: true } });
  if (!listing) return { success: false, error: "İlan bulunamadı" };

  await db.listing.update({ where: { id }, data: { featured: !listing.featured } });

  await auditLog(user.id, "listing.toggle_featured", "Listing", id, {
    featured: !listing.featured,
    title: listing.titleTr,
  });

  revalidatePath("/", "layout");
  return { success: true };
}

export async function bulkListingAction(raw: unknown): Promise<ActionResult> {
  const user = await getAuthorizedUser();
  if (!user) return { success: false, error: "Yetkisiz erişim" };

  const { z } = await import("zod");
  const schema = z.object({
    ids: z.array(z.string().min(1)).min(1),
    action: z.enum(["activate", "archive", "delete"]),
  });
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return { success: false, error: "Geçersiz veri" };

  const { ids, action } = parsed.data;

  if (action === "delete") {
    await db.listing.deleteMany({ where: { id: { in: ids } } });
  } else {
    const status = action === "activate" ? "ACTIVE" : "ARCHIVED";
    await db.listing.updateMany({ where: { id: { in: ids } }, data: { status } });
  }

  await auditLog(user.id, `listing.bulk_${action}`, "Listing", null, { ids, count: ids.length });

  revalidatePath("/", "layout");
  return { success: true };
}
