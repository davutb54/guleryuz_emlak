import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import ListingForm, { type ListingFormData } from "@/components/admin/listing-form";
import { Link } from "@/i18n/navigation";
import { ChevronLeft } from "lucide-react";

export default async function DuzenlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, session] = await Promise.all([params, auth()]);

  const listing = await db.listing.findUnique({
    where: { id },
    select: {
      id: true,
      agentId: true,
      category: true,
      type: true,
      status: true,
      titleTr: true,
      titleEn: true,
      descriptionTr: true,
      descriptionEn: true,
      price: true,
      currency: true,
      city: true,
      district: true,
      neighborhood: true,
      address: true,
      latitude: true,
      longitude: true,
      area: true,
      netArea: true,
      rooms: true,
      bathrooms: true,
      buildingAge: true,
      floor: true,
      totalFloors: true,
      heating: true,
      furnished: true,
      hasBalcony: true,
      hasElevator: true,
      hasParking: true,
      hasSecurity: true,
      hasPool: true,
      inSite: true,
      facade: true,
      creditEligible: true,
      deedStatus: true,
      zoningStatus: true,
      kaks: true,
      taks: true,
      islandNumber: true,
      parcelNumber: true,
      ceilingHeight: true,
      storefrontWidth: true,
      virtualTourUrl: true,
      sahibindenUrl: true,
      featured: true,
      images: {
        orderBy: { order: "asc" },
        select: { url: true, type: true, isPrimary: true, order: true },
      },
    },
  });

  if (!listing) notFound();

  if (session?.user?.role === "AGENT" && listing.agentId !== session.user.id) {
    notFound();
  }

  const { images, agentId: _agentId, ...listingData } = listing;

  const formData: ListingFormData = {
    ...listingData,
    price: listingData.price.toNumber(),
  };

  // Mevcut görseller → UploadedImage formatına çevir
  const initialImages = images.map((img) => ({
    url: img.url,
    type: (img.type as "image" | "video") ?? "image",
    thumbnail: img.type === "video" ? null : img.url.replace(".webp", "_thumb.webp"),
    isPrimary: img.isPrimary,
    order: img.order,
  }));

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/ilanlar"
          className="flex items-center gap-1 text-silver-500 hover:text-cream-100 text-sm transition-colors"
        >
          <ChevronLeft size={16} strokeWidth={1.5} />
          İlanlara Dön
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="font-display text-display-md text-cream-50">İlanı Düzenle</h1>
        <p className="text-silver-500 text-sm mt-1 line-clamp-1">{listing.titleTr}</p>
      </div>

      <ListingForm listing={formData} initialImages={initialImages} />
    </div>
  );
}
