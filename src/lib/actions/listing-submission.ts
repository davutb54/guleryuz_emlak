"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { auditLog } from "@/lib/audit";
import { generateUniqueSlug } from "@/lib/slug";
import { listingSubmissionSchema } from "@/lib/validations/listing-submission";

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

async function getAdminUser() {
  const session = await auth();
  if (!session?.user) return null;
  if (!["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) return null;
  return session.user;
}

// Herkese açık: kullanıcı ilan talebi oluşturur
export async function submitListingRequest(
  raw: unknown
): Promise<ActionResult<{ id: string }>> {
  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  const rl = checkRateLimit(`listing-submit:${ip}`, 5, 60 * 60 * 1000);
  if (!rl.allowed) {
    return {
      success: false,
      error: "Çok fazla talep gönderildi. Lütfen bir saat sonra tekrar deneyin.",
    };
  }

  const parsed = listingSubmissionSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Geçersiz form verisi",
    };
  }

  const session = await auth();
  const userId = session?.user?.id ?? null;

  const submission = await db.listingSubmission.create({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: { ...(parsed.data as any), status: "PENDING", userId },
    select: { id: true },
  });

  revalidatePath("/admin/ilan-talepleri");
  return { success: true, data: { id: submission.id } };
}

// Admin: talebi onayla → gerçek ilan oluştur
export async function approveListingSubmission(
  submissionId: string
): Promise<ActionResult<{ slug: string }>> {
  const admin = await getAdminUser();
  if (!admin) return { success: false, error: "Yetkisiz erişim" };

  const submission = await db.listingSubmission.findUnique({
    where: { id: submissionId },
  });
  if (!submission) return { success: false, error: "Talep bulunamadı" };
  if (submission.status !== "PENDING")
    return { success: false, error: "Bu talep zaten işlenmiş" };

  const slug = await generateUniqueSlug(
    submission.titleTr,
    submission.district,
    submission.rooms ?? undefined
  );

  const listing = await db.listing.create({
    data: {
      slug,
      category: submission.category as never,
      type: submission.type as never,
      status: "ACTIVE",
      titleTr: submission.titleTr,
      descriptionTr: submission.descriptionTr ?? "",
      price: submission.price,
      currency: submission.currency,
      city: submission.city,
      district: submission.district,
      neighborhood: submission.neighborhood,
      address: submission.address,
      area: submission.area,
      netArea: submission.netArea,
      rooms: submission.rooms,
      bathrooms: submission.bathrooms,
      buildingAge: submission.buildingAge,
      floor: submission.floor,
      totalFloors: submission.totalFloors,
      heating: submission.heating,
      furnished: submission.furnished,
      hasBalcony: submission.hasBalcony,
      hasElevator: submission.hasElevator,
      hasParking: submission.hasParking,
      hasSecurity: submission.hasSecurity,
      hasPool: submission.hasPool,
      inSite: submission.inSite,
      facade: submission.facade,
      creditEligible: submission.creditEligible,
      deedStatus: submission.deedStatus,
      zoningStatus: submission.zoningStatus,
      islandNumber: submission.islandNumber,
      parcelNumber: submission.parcelNumber,
      agentId: admin.id,
    },
    select: { id: true, slug: true },
  });

  await db.listingSubmission.update({
    where: { id: submissionId },
    data: {
      status: "APPROVED",
      reviewedAt: new Date(),
      reviewedById: admin.id,
      listingId: listing.id,
    },
  });

  await auditLog(admin.id, "listing_submission.approve", "ListingSubmission", submissionId, {
    listingId: listing.id,
    slug: listing.slug,
    contactEmail: submission.contactEmail,
  });

  revalidatePath("/", "layout");
  return { success: true, data: { slug: listing.slug } };
}

// Admin: talebi reddet
export async function rejectListingSubmission(
  submissionId: string,
  note?: string
): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { success: false, error: "Yetkisiz erişim" };

  const submission = await db.listingSubmission.findUnique({
    where: { id: submissionId },
    select: { id: true, status: true, contactEmail: true },
  });
  if (!submission) return { success: false, error: "Talep bulunamadı" };
  if (submission.status !== "PENDING")
    return { success: false, error: "Bu talep zaten işlenmiş" };

  await db.listingSubmission.update({
    where: { id: submissionId },
    data: {
      status: "REJECTED",
      adminNote: note ?? null,
      reviewedAt: new Date(),
      reviewedById: admin.id,
    },
  });

  await auditLog(admin.id, "listing_submission.reject", "ListingSubmission", submissionId, {
    note,
    contactEmail: submission.contactEmail,
  });

  revalidatePath("/admin/ilan-talepleri");
  return { success: true };
}

// Admin: talebi sil
export async function deleteListingSubmission(
  submissionId: string
): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { success: false, error: "Yetkisiz erişim" };

  await db.listingSubmission.delete({ where: { id: submissionId } });

  await auditLog(admin.id, "listing_submission.delete", "ListingSubmission", submissionId, {});

  revalidatePath("/admin/ilan-talepleri");
  return { success: true };
}
