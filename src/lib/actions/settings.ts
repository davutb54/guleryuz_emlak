"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { auditLog } from "@/lib/audit";
import { z } from "zod";

type ActionResult = { success: true } | { success: false; error: string };

const settingsSchema = z.object({
  contactEmail: z.string().email("Geçerli bir e-posta girin"),
  contactPhone: z.string().min(1, "Telefon gerekli"),
  address: z.string().min(1, "Adres gerekli"),
  workingHours: z.string().min(1, "Çalışma saatleri gerekli"),
  aboutTr: z.string().max(5000).optional().nullable(),
  kvkkText: z.string().max(20000).optional().nullable(),
  privacyText: z.string().max(20000).optional().nullable(),
  termsText: z.string().max(20000).optional().nullable(),
  contactLat: z.coerce.number().optional().nullable().or(z.literal("")),
  contactLng: z.coerce.number().optional().nullable().or(z.literal("")),
  officePhoto: z.string().optional().nullable().or(z.literal("")),
  statYear: z.string().max(20).optional().nullable().or(z.literal("")),
  statTransactions: z.string().max(20).optional().nullable().or(z.literal("")),
  statCustomers: z.string().max(20).optional().nullable().or(z.literal("")),
  statSatisfaction: z.string().max(20).optional().nullable().or(z.literal("")),
  // Sosyal linkler ayrı field'lar olarak gelir
  socialInstagram: z.string().url().optional().nullable().or(z.literal("")),
  socialFacebook: z.string().url().optional().nullable().or(z.literal("")),
  socialYoutube: z.string().url().optional().nullable().or(z.literal("")),
  socialWhatsapp: z.string().optional().nullable().or(z.literal("")),
  socialX: z.string().url().optional().nullable().or(z.literal("")),
});

export async function updateSiteSettings(raw: unknown): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return { success: false, error: "Yetkisiz erişim" };
  }

  const parsed = settingsSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Geçersiz veri" };
  }

  const { socialInstagram, socialFacebook, socialYoutube, socialWhatsapp, socialX, kvkkText, privacyText, termsText, contactLat, contactLng, officePhoto, statYear, statTransactions, statCustomers, statSatisfaction, ...rest } = parsed.data;

  const socialLinks = JSON.stringify({
    instagram: socialInstagram || null,
    facebook: socialFacebook || null,
    youtube: socialYoutube || null,
    whatsapp: socialWhatsapp || null,
    x: socialX || null,
  });

  const locationData = {
    contactLat: typeof contactLat === "number" ? contactLat : null,
    contactLng: typeof contactLng === "number" ? contactLng : null,
  };

  const extraData = {
    officePhoto: officePhoto || null,
    statYear: statYear || null,
    statTransactions: statTransactions || null,
    statCustomers: statCustomers || null,
    statSatisfaction: statSatisfaction || null,
  };

  await db.siteSettings.upsert({
    where: { id: 1 },
    update: { ...rest, ...locationData, ...extraData, socialLinks, kvkkText: kvkkText || null, privacyText: privacyText || null, termsText: termsText || null },
    create: { id: 1, ...rest, ...locationData, ...extraData, socialLinks, kvkkText: kvkkText || null, privacyText: privacyText || null, termsText: termsText || null },
  });

  await auditLog(session.user.id, "settings.update", "SiteSettings", "1");
  revalidatePath("/", "layout");
  return { success: true };
}
