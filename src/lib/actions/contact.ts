"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

type ActionResult = { success: true } | { success: false; error: string };

async function getAdminUser() {
  const session = await auth();
  if (!session?.user) return null;
  if (!["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) return null;
  return session.user;
}

export async function markMessageRead(id: string): Promise<void> {
  const admin = await getAdminUser();
  if (!admin) return;
  await db.contactMessage.update({ where: { id }, data: { read: true } });
  revalidatePath("/admin/iletisim");
}

export async function deleteMessage(id: string): Promise<void> {
  const admin = await getAdminUser();
  if (!admin) return;
  await db.contactMessage.delete({ where: { id } });
  revalidatePath("/admin/iletisim");
}
