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

  revalidatePath("/", "layout");
  return { success: true };
}

export async function deleteListing(id: string): Promise<ActionResult> {
  const user = await getAuthorizedUser();
  if (!user) return { success: false, error: "Yetkisiz erişim" };

  await db.listing.delete({ where: { id } });
  revalidatePath("/", "layout");
  return { success: true };
}

export async function saveListingImages(
  listingId: string,
  images: { url: string; isPrimary: boolean; order: number }[]
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

  revalidatePath("/", "layout");
  return { success: true };
}
