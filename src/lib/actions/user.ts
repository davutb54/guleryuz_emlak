"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { auditLog } from "@/lib/audit";
import { hashPassword, verifyPassword } from "@/lib/password";
import { z } from "zod";

type ActionResult = { success: true } | { success: false; error: string };

const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN"] as const;

async function getAdminUser() {
  const session = await auth();
  if (!session?.user) return null;
  if (!(ADMIN_ROLES as readonly string[]).includes(session.user.role)) return null;
  return session.user;
}

const roleSchema = z.object({
  role: z.enum(["USER", "AGENT", "ADMIN"]),
});

export async function changeUserRole(
  targetId: string,
  raw: unknown
): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { success: false, error: "Yetkisiz erişim" };

  const parsed = roleSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: "Geçersiz rol" };

  const target = await db.user.findUnique({
    where: { id: targetId },
    select: { role: true, email: true },
  });
  if (!target) return { success: false, error: "Kullanıcı bulunamadı" };

  // SUPER_ADMIN rolü değiştirilemez
  if (target.role === "SUPER_ADMIN") return { success: false, error: "SUPER_ADMIN rolü değiştirilemez" };

  // ADMIN rolünü sadece SUPER_ADMIN atayabilir
  if (parsed.data.role === "ADMIN" && admin.role !== "SUPER_ADMIN") {
    return { success: false, error: "Admin rolü atamak için SUPER_ADMIN yetkisi gerekir" };
  }

  await db.user.update({ where: { id: targetId }, data: { role: parsed.data.role } });

  await auditLog(admin.id, "user.role_change", "User", targetId, {
    from: target.role,
    to: parsed.data.role,
    email: target.email,
  });

  revalidatePath("/admin/kullanicilar");
  return { success: true };
}

const titleSchema = z.object({
  title: z.string().max(100).optional().or(z.literal("")),
});

const TITLE_ELIGIBLE_ROLES = ["AGENT", "ADMIN", "SUPER_ADMIN"] as const;

export async function updateUserTitle(
  targetId: string,
  raw: unknown
): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { success: false, error: "Yetkisiz erişim" };

  const parsed = titleSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Geçersiz veri" };

  const target = await db.user.findUnique({
    where: { id: targetId },
    select: { role: true },
  });
  if (!target) return { success: false, error: "Kullanıcı bulunamadı" };
  if (!(TITLE_ELIGIBLE_ROLES as readonly string[]).includes(target.role)) {
    return { success: false, error: "Ünvan yalnızca yetkili kullanıcılara atanabilir" };
  }

  await db.user.update({
    where: { id: targetId },
    data: { title: parsed.data.title || null },
  });

  await auditLog(admin.id, "user.title_update", "User", targetId);
  revalidatePath("/admin/kullanicilar");
  revalidatePath("/hakkimizda");
  return { success: true };
}

const selfProfileSchema = z.object({
  name: z.string().min(2, "Ad en az 2 karakter olmalı").max(100),
  phone: z.string().max(30).optional().or(z.literal("")),
  avatar: z.string().min(1).optional().or(z.literal("")),
});

export async function updateSelfProfile(raw: unknown): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Giriş yapmanız gerekiyor" };

  const parsed = selfProfileSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Geçersiz veri" };

  await db.user.update({
    where: { id: session.user.id },
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      avatar: parsed.data.avatar || null,
    },
  });

  revalidatePath("/profil");
  revalidatePath("/hakkimizda");
  return { success: true };
}

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Mevcut şifre gerekli"),
  newPassword: z.string().min(8, "Yeni şifre en az 8 karakter olmalı"),
});

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Giriş yapmanız gerekiyor" };

  const parsed = changePasswordSchema.safeParse({ currentPassword, newPassword });
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Geçersiz veri" };

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  });
  if (!user) return { success: false, error: "Kullanıcı bulunamadı" };

  if (!user.passwordHash) {
    return { success: false, error: "Bu hesap sosyal girişle oluşturulmuş, şifre değiştirilemez" };
  }

  const isValid = await verifyPassword(currentPassword, user.passwordHash);
  if (!isValid) return { success: false, error: "Mevcut şifre yanlış" };

  const newHash = await hashPassword(newPassword);
  await db.user.update({
    where: { id: session.user.id },
    data: { passwordHash: newHash },
  });

  await auditLog(session.user.id, "password.change", "User", session.user.id);
  return { success: true };
}

export async function toggleBanUser(targetId: string): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { success: false, error: "Yetkisiz erişim" };

  const target = await db.user.findUnique({
    where: { id: targetId },
    select: { banned: true, role: true, email: true },
  });
  if (!target) return { success: false, error: "Kullanıcı bulunamadı" };

  if (target.role === "SUPER_ADMIN" || target.role === "ADMIN") {
    return { success: false, error: "Admin kullanıcılar banlanamaz" };
  }

  const newBanned = !target.banned;
  await db.user.update({ where: { id: targetId }, data: { banned: newBanned } });

  await auditLog(admin.id, newBanned ? "user.ban" : "user.unban", "User", targetId, {
    email: target.email,
  });

  revalidatePath("/admin/kullanicilar");
  return { success: true };
}
