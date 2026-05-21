"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function toggleFavorite(listingId: string): Promise<{ favorited: boolean }> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Giriş yapmanız gerekiyor.");
  }

  const userId = session.user.id;

  const existing = await db.favorite.findUnique({
    where: { userId_listingId: { userId, listingId } },
  });

  if (existing) {
    await db.favorite.delete({ where: { id: existing.id } });
    revalidatePath("/");
    return { favorited: false };
  }

  await db.favorite.create({ data: { userId, listingId } });
  revalidatePath("/");
  return { favorited: true };
}
