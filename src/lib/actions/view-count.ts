"use server";

import { db } from "@/lib/db";

export async function incrementViewCount(listingId: string) {
  await db.listing.update({
    where: { id: listingId },
    data: { viewCount: { increment: 1 } },
  });
}
