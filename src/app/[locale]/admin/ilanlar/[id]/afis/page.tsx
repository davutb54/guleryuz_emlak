import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import AfisPrintClient from "./afis-print-client";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://guleryuzgayrimenkul.com";

export default async function AfisPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const [{ id, locale }, session] = await Promise.all([params, auth()]);

  const user = session?.user;
  if (!user || !["AGENT", "ADMIN", "SUPER_ADMIN"].includes(user.role)) {
    notFound();
  }

  const listing = await db.listing.findUnique({
    where: { id },
    include: {
      images: { orderBy: { order: "asc" } },
      agent: { select: { name: true, phone: true, email: true, avatar: true } },
    },
  });

  if (!listing) notFound();

  const publicUrl = `${BASE_URL}/${locale}/ilan/${listing.slug}`;

  const image = listing.images[0]?.url ? `${BASE_URL}${listing.images[0].url}` : null;

  const serializedListing = {
    ...listing,
    price: Number(listing.price),
    createdAt: listing.createdAt.toISOString(),
    updatedAt: listing.updatedAt.toISOString(),
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 print:p-0 print:bg-white flex justify-center">
      <AfisPrintClient listing={serializedListing} publicUrl={publicUrl} baseUrl={BASE_URL} />
    </div>
  );
}
