"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { auditLog } from "@/lib/audit";
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
