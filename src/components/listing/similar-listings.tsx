import {
  getSimilarListings,
  type SimilarListingParams,
} from "@/lib/similar-listings";
import ListingCard from "@/components/listing/listing-card";

// getSimilarListings price: number → ListingCard price: { toNumber(): number }
function toCardPrice(price: number): { toNumber(): number } {
  return { toNumber: () => price };
}

export default async function SimilarListings(params: SimilarListingParams) {
  const similar = await getSimilarListings(params);

  if (similar.length === 0) return null;

  return (
    <section className="mt-16">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600 mb-1">
          Güleryüz Gayrimenkul
        </p>
        <h2 className="font-display text-display-sm text-cream-50">
          Benzer İlanlar
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {similar.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={{
              ...listing,
              price: toCardPrice(listing.price),
            }}
          />
        ))}
      </div>
    </section>
  );
}
