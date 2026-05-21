"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { contactSchema } from "@/lib/validations/contact";
import { checkRateLimit } from "@/lib/rate-limit";

type ActionResult = { success: true } | { success: false; error: string };

async function getAdminUser() {
  const session = await auth();
  if (!session?.user) return null;
  if (!["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) return null;
  return session.user;
}

export async function submitContact(raw: unknown) {
  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = checkRateLimit(`contact:${ip}`, 3, 60 * 60 * 1000);
  if (!rl.allowed) {
    return {
      error: "Çok fazla mesaj gönderildi. Lütfen bir saat sonra tekrar deneyin.",
    };
  }

  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz form verisi." };
  }

  const { name, email, phone, subject, message } = parsed.data;

  await db.contactMessage.create({
    data: {
      name,
      email: email || "",
      phone: phone || null,
      subject: subject || null,
      message,
    },
  });

  return { success: true };
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
