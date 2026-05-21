"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { searchAlertCreateSchema } from "@/lib/validations/search-alert";
import { revalidatePath } from "next/cache";

export async function createSearchAlert(raw: unknown) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Giriş yapmanız gerekiyor." };
  }

  const parsed = searchAlertCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz veri." };
  }

  const existing = await db.searchAlert.count({ where: { userId: session.user.id } });
  if (existing >= 10) {
    return { error: "En fazla 10 arama alarmı oluşturabilirsiniz." };
  }

  await db.searchAlert.create({
    data: {
      userId: session.user.id,
      name: parsed.data.name,
      filters: JSON.stringify(parsed.data.filters),
      frequency: parsed.data.frequency,
      active: true,
    },
  });

  revalidatePath("/profil");
  return { success: true };
}

export async function deleteSearchAlert(alertId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Yetkisiz." };

  await db.searchAlert.deleteMany({
    where: { id: alertId, userId: session.user.id },
  });

  revalidatePath("/profil");
  return { success: true };
}

export async function toggleSearchAlert(alertId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Yetkisiz." };

  const alert = await db.searchAlert.findFirst({
    where: { id: alertId, userId: session.user.id },
    select: { active: true },
  });
  if (!alert) return { error: "Alarm bulunamadı." };

  await db.searchAlert.update({
    where: { id: alertId },
    data: { active: !alert.active },
  });

  revalidatePath("/profil");
  return { success: true };
}
