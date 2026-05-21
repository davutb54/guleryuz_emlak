import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ results: [], total: 0 });

  const type = req.nextUrl.searchParams.get("type") ?? "";
  const category = req.nextUrl.searchParams.get("category") ?? "";

  const where: Record<string, unknown> = {
    status: "ACTIVE",
    OR: [
      { titleTr: { contains: q } },
      { descriptionTr: { contains: q } },
      { district: { contains: q } },
      { neighborhood: { contains: q } },
    ],
  };

  if (type) where.type = type;
  if (category) where.category = category;

  const [listings, total] = await Promise.all([
    db.listing.findMany({
      where,
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      take: 5,
      select: {
        slug: true,
        titleTr: true,
        district: true,
        type: true,
        category: true,
        price: true,
        currency: true,
        images: {
          where: { isPrimary: true },
          select: { url: true },
          take: 1,
        },
      },
    }),
    db.listing.count({ where }),
  ]);

  return NextResponse.json({
    results: listings.map((r) => ({ ...r, price: r.price.toNumber() })),
    total,
  });
}
