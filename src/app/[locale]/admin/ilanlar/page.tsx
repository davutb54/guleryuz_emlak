import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Link } from "@/i18n/navigation";
import { Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";
import ListingTable from "@/components/admin/listing-bulk-actions";

const PAGE_SIZE = 50;

const STATUS_OPTIONS = [
  { value: "", label: "Tüm Durumlar" },
  { value: "ACTIVE",   label: "Aktif" },
  { value: "DRAFT",    label: "Taslak" },
  { value: "PENDING",  label: "Beklemede" },
  { value: "SOLD",     label: "Satıldı" },
  { value: "RENTED",   label: "Kiralandı" },
  { value: "ARCHIVED", label: "Arşivlendi" },
];

const CATEGORY_OPTIONS = [
  { value: "",       label: "Tüm Kategoriler" },
  { value: "HOUSE",  label: "Ev/Daire" },
  { value: "LAND",   label: "Arsa" },
  { value: "FIELD",  label: "Tarla" },
  { value: "SHOP",   label: "Dükkan" },
];

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    q?: string;
    status?: string;
    kategori?: string;
    sayfa?: string;
  }>;
}

export default async function AdminIlanlarPage({ searchParams }: Props) {
  const session = await auth();
  const isAgent = session?.user?.role === "AGENT";

  const { q = "", status = "", kategori = "", sayfa = "1" } = await searchParams;
  const page = Math.max(1, parseInt(sayfa, 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const agents = await db.user.findMany({
    where: { role: { in: ["AGENT", "ADMIN", "SUPER_ADMIN"] } },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const where: Record<string, unknown> = {};
  if (isAgent) where.agentId = session!.user.id;
  if (status) where.status = status;
  if (kategori) where.category = kategori;
  if (q) {
    where.OR = [
      { titleTr: { contains: q } },
      { district: { contains: q } },
    ];
  }

  const [rawListings, total] = await Promise.all([
    db.listing.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
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
    }),
    db.listing.count({ where }),
  ]);

  const listings = rawListings.map((l) => ({ ...l, price: Number(l.price) }));
  const totalPages = Math.ceil(total / PAGE_SIZE);

  function buildUrl(p: number) {
    const params = new URLSearchParams();
    if (p > 1) params.set("sayfa", String(p));
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    if (kategori) params.set("kategori", kategori);
    const qs = params.toString();
    return `/admin/ilanlar${qs ? `?${qs}` : ""}`;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-display-md text-cream-50">İlanlar</h1>
          <p className="text-silver-500 text-sm mt-1">{total} ilan</p>
        </div>
        <Link
          href="/admin/ilanlar/yeni"
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gold-500 text-navy-900 text-sm font-semibold hover:bg-gold-400 transition-colors"
        >
          <Plus size={16} strokeWidth={2} />
          Yeni İlan
        </Link>
      </div>

      {/* Filtre çubuğu */}
      <form method="GET" className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-silver-500 pointer-events-none" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Başlık veya ilçe ara..."
            className="w-full h-10 pl-9 pr-4 bg-navy-800 border border-[var(--border-subtle)] rounded-xl text-sm text-cream-100 placeholder-silver-600 focus:outline-none focus:border-gold-500/60"
          />
        </div>
        <select
          name="status"
          defaultValue={status}
          className="h-10 px-3 bg-navy-800 border border-[var(--border-subtle)] rounded-xl text-sm text-cream-100 focus:outline-none focus:border-gold-500/60 [&>option]:bg-navy-800"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select
          name="kategori"
          defaultValue={kategori}
          className="h-10 px-3 bg-navy-800 border border-[var(--border-subtle)] rounded-xl text-sm text-cream-100 focus:outline-none focus:border-gold-500/60 [&>option]:bg-navy-800"
        >
          {CATEGORY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <button
          type="submit"
          className="h-10 px-5 rounded-xl bg-gold-500 text-navy-900 text-sm font-semibold hover:bg-gold-400 transition-colors"
        >
          Filtrele
        </button>
        {(q || status || kategori) && (
          <Link
            href="/admin/ilanlar"
            className="h-10 px-4 flex items-center rounded-xl border border-[var(--border-subtle)] text-silver-400 text-sm hover:text-cream-100 transition-colors"
          >
            Temizle
          </Link>
        )}
      </form>

      {listings.length === 0 ? (
        <div className="bg-navy-850 border border-[var(--border-subtle)] rounded-xl p-12 text-center">
          <p className="text-silver-500 mb-4">
            {q || status || kategori ? "Filtreyle eşleşen ilan bulunamadı." : "Henüz ilan yok."}
          </p>
          <Link
            href="/admin/ilanlar/yeni"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-500 text-navy-900 text-sm font-semibold"
          >
            <Plus size={14} /> İlk İlanı Ekle
          </Link>
        </div>
      ) : (
        <>
          <ListingTable listings={listings} />

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <span className="text-xs text-silver-500">
                Sayfa {page} / {totalPages} ({total} ilan)
              </span>
              <div className="flex items-center gap-2">
                {page > 1 && (
                  <Link href={buildUrl(page - 1)}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg border border-[var(--border-subtle)] text-silver-400 text-sm hover:text-cream-100 transition-colors">
                    <ChevronLeft size={14} /> Önceki
                  </Link>
                )}
                {page < totalPages && (
                  <Link href={buildUrl(page + 1)}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg border border-[var(--border-subtle)] text-silver-400 text-sm hover:text-cream-100 transition-colors">
                    Sonraki <ChevronRight size={14} />
                  </Link>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
