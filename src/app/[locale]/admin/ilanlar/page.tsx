import { db } from "@/lib/db";
import { Link } from "@/i18n/navigation";
import { Plus, Pencil, Eye } from "lucide-react";
import DeleteListingButton from "@/components/admin/delete-listing-button";
import ListingStatusSelect from "@/components/admin/listing-status-select";

const STATUS_LABELS: Record<string, { label: string; class: string }> = {
  DRAFT: { label: "Taslak", class: "bg-silver-500/15 text-silver-400" },
  PENDING: { label: "Beklemede", class: "bg-amber-400/15 text-amber-400" },
  ACTIVE: { label: "Aktif", class: "bg-green-400/15 text-green-400" },
  SOLD: { label: "Satıldı", class: "bg-blue-400/15 text-blue-400" },
  RENTED: { label: "Kiralandı", class: "bg-purple-400/15 text-purple-400" },
  ARCHIVED: { label: "Arşivlendi", class: "bg-navy-600/60 text-silver-500" },
};

const CATEGORY_LABELS: Record<string, string> = {
  HOUSE: "Ev/Daire",
  LAND: "Arsa",
  FIELD: "Tarla",
  SHOP: "Dükkan",
};

const TYPE_LABELS: Record<string, string> = {
  SALE: "Satılık",
  RENT: "Kiralık",
};

function formatPrice(price: { toNumber(): number }, currency: string) {
  const num = price.toNumber();
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(num);
}

export default async function AdminIlanlarPage() {
  const listings = await db.listing.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      titleTr: true,
      category: true,
      type: true,
      status: true,
      price: true,
      currency: true,
      district: true,
      featured: true,
      createdAt: true,
      agent: { select: { name: true } },
    },
  });

  return (
    <div>
      {/* Başlık */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-display-md text-cream-50">İlanlar</h1>
          <p className="text-silver-500 text-sm mt-1">{listings.length} ilan</p>
        </div>
        <Link
          href="/admin/ilanlar/yeni"
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gold-500 text-navy-900 text-sm font-semibold hover:bg-gold-400 transition-colors"
        >
          <Plus size={16} strokeWidth={2} />
          Yeni İlan
        </Link>
      </div>

      {/* Tablo */}
      {listings.length === 0 ? (
        <div className="bg-navy-850 border border-[var(--border-subtle)] rounded-xl p-12 text-center">
          <p className="text-silver-500 mb-4">Henüz ilan yok.</p>
          <Link
            href="/admin/ilanlar/yeni"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-500 text-navy-900 text-sm font-semibold"
          >
            <Plus size={14} />
            İlk İlanı Ekle
          </Link>
        </div>
      ) : (
        <div className="bg-navy-850 border border-[var(--border-subtle)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-divider)]">
                  {["İlan Başlığı", "Kategori", "Fiyat", "İlçe", "Durum", "Agent", "İşlem"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-silver-400 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {listings.map((listing, i) => {
                  const status = STATUS_LABELS[listing.status] ?? STATUS_LABELS.DRAFT;
                  return (
                    <tr
                      key={listing.id}
                      className={`border-b border-[var(--border-divider)] hover:bg-navy-800/60 transition-colors ${
                        i === listings.length - 1 ? "border-0" : ""
                      }`}
                    >
                      {/* Başlık */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {listing.featured && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gold-500/15 text-gold-500 font-semibold uppercase">
                              Öne Çıkan
                            </span>
                          )}
                          <span className="text-cream-100 font-medium line-clamp-1 max-w-[220px]">
                            {listing.titleTr}
                          </span>
                        </div>
                      </td>

                      {/* Kategori */}
                      <td className="px-4 py-3 text-silver-400 whitespace-nowrap">
                        {CATEGORY_LABELS[listing.category]} /{" "}
                        {TYPE_LABELS[listing.type]}
                      </td>

                      {/* Fiyat */}
                      <td className="px-4 py-3 text-cream-100 font-medium tabular-nums whitespace-nowrap">
                        {formatPrice(listing.price, listing.currency)}
                      </td>

                      {/* İlçe */}
                      <td className="px-4 py-3 text-silver-400">
                        {listing.district}
                      </td>

                      {/* Durum */}
                      <td className="px-4 py-3">
                        <ListingStatusSelect
                          id={listing.id}
                          currentStatus={listing.status}
                        />
                      </td>

                      {/* Agent */}
                      <td className="px-4 py-3 text-silver-500 text-xs">
                        {listing.agent.name}
                      </td>

                      {/* İşlem */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Link
                            href={`/ilan/${listing.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-md text-silver-500 hover:text-cream-100 hover:bg-white/5 transition-colors"
                            title="Önizle"
                          >
                            <Eye size={15} strokeWidth={1.5} />
                          </Link>
                          <Link
                            href={`/admin/ilanlar/${listing.id}/duzenle`}
                            className="p-1.5 rounded-md text-silver-500 hover:text-gold-400 hover:bg-gold-500/8 transition-colors"
                            title="Düzenle"
                          >
                            <Pencil size={15} strokeWidth={1.5} />
                          </Link>
                          <DeleteListingButton id={listing.id} title={listing.titleTr} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
