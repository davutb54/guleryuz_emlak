"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { auditLog } from "@/lib/audit";
import { z } from "zod";

type ActionResult = { success: true } | { success: false; error: string };

async function getAdminUser() {
  const session = await auth();
  if (!session?.user) return null;
  if (!["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) return null;
  return session.user;
}

const galleryCreateSchema = z.object({
  type: z.enum(["image", "video"]),
  url: z.string().min(1, "URL gerekli"),
  thumbnail: z.string().optional().nullable(),
  titleTr: z.string().max(200).optional().nullable(),
  category: z.enum(["achievement", "event", "office", "team", ""]).optional().nullable(),
});

export async function createGalleryItem(raw: unknown): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { success: false, error: "Yetkisiz erişim" };

  const parsed = galleryCreateSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Geçersiz veri" };

  const maxOrder = await db.galleryItem.aggregate({ _max: { order: true } });
  const nextOrder = (maxOrder._max.order ?? 0) + 1;

  const item = await db.galleryItem.create({
    data: {
      type: parsed.data.type,
      url: parsed.data.url,
      thumbnail: parsed.data.thumbnail ?? null,
      titleTr: parsed.data.titleTr ?? null,
      category: parsed.data.category || null,
      order: nextOrder,
    },
  });

  await auditLog(admin.id, "gallery.create", "GalleryItem", item.id, { type: item.type });
  revalidatePath("/", "layout");
  return { success: true };
}

export async function deleteGalleryItem(id: string): Promise<void> {
  const admin = await getAdminUser();
  if (!admin) return;

  await db.galleryItem.delete({ where: { id } });
  await auditLog(admin.id, "gallery.delete", "GalleryItem", id);
  revalidatePath("/", "layout");
}

export async function moveGalleryItem(id: string, direction: "up" | "down"): Promise<void> {
  const admin = await getAdminUser();
  if (!admin) return;

  const current = await db.galleryItem.findUnique({ where: { id }, select: { order: true } });
  if (!current) return;

  const neighbor = await db.galleryItem.findFirst({
    where: direction === "up" ? { order: { lt: current.order } } : { order: { gt: current.order } },
    orderBy: { order: direction === "up" ? "desc" : "asc" },
    select: { id: true, order: true },
  });

  if (!neighbor) return;

  await db.galleryItem.update({ where: { id }, data: { order: neighbor.order } });
  await db.galleryItem.update({ where: { id: neighbor.id }, data: { order: current.order } });
  revalidatePath("/", "layout");
}
