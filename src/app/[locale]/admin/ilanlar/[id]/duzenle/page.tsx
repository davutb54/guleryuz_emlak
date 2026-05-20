import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import ListingForm, { type ListingFormData } from "@/components/admin/listing-form";
import { Link } from "@/i18n/navigation";
import { ChevronLeft } from "lucide-react";

export default async function DuzenlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const listing = await db.listing.findUnique({
    where: { id },
    select: {
      id: true,
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
      featured: true,
    },
  });

  if (!listing) notFound();

  // Prisma Decimal → number (Client Component'e geçmeden önce serialize et)
  const formData: ListingFormData = {
    ...listing,
    price: listing.price.toNumber(),
  };

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

      <ListingForm listing={formData} />
    </div>
  );
}
