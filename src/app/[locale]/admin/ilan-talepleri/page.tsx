import { db } from "@/lib/db";
import { Link } from "@/i18n/navigation";
import { ChevronLeft, ChevronRight, Eye, CheckCircle, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 30;

const STATUS_OPTIONS = [
  { value: "", label: "Tüm Talepler" },
  { value: "PENDING", label: "Beklemede" },
  { value: "APPROVED", label: "Onaylandı" },
  { value: "REJECTED", label: "Reddedildi" },
];

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

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
        status === "PENDING" && "bg-yellow-500/15 text-yellow-400",
        status === "APPROVED" && "bg-green-500/15 text-green-400",
        status === "REJECTED" && "bg-red-500/15 text-red-400"
      )}
    >
      {status === "PENDING" && <Clock size={11} />}
      {status === "APPROVED" && <CheckCircle size={11} />}
      {status === "REJECTED" && <XCircle size={11} />}
      {status === "PENDING" ? "Beklemede" : status === "APPROVED" ? "Onaylandı" : "Reddedildi"}
    </span>
  );
}

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string; sayfa?: string }>;
}

export default async function IlanTalepleriPage({ searchParams }: Props) {
  const { status = "", sayfa = "1" } = await searchParams;
  const page = Math.max(1, parseInt(sayfa, 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  const [submissions, total] = await Promise.all([
    db.listingSubmission.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
    }),
    db.listingSubmission.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const pendingCount = await db.listingSubmission.count({ where: { status: "PENDING" } });

  function buildUrl(p: number) {
    const params = new URLSearchParams();
    if (p > 1) params.set("sayfa", String(p));
    if (status) params.set("status", status);
    const qs = params.toString();
    return `/admin/ilan-talepleri${qs ? `?${qs}` : ""}`;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-display-md text-cream-50">İlan Talepleri</h1>
            {pendingCount > 0 && (
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gold-500 text-navy-900 text-xs font-bold">
                {pendingCount}
              </span>
            )}
          </div>
          <p className="text-silver-500 text-sm mt-1">{total} talep</p>
        </div>
      </div>

      {/* Filtre */}
      <form method="GET" className="flex flex-wrap gap-3 mb-5">
        {STATUS_OPTIONS.map((o) => (
          <Link
            key={o.value}
            href={`/admin/ilan-talepleri${o.value ? `?status=${o.value}` : ""}`}
            className={cn(
              "h-9 px-4 flex items-center rounded-full text-sm font-medium transition-colors",
              status === o.value
                ? "bg-gold-500 text-navy-900"
                : "bg-navy-800 border border-[var(--border-subtle)] text-silver-400 hover:text-cream-100"
            )}
          >
            {o.label}
          </Link>
        ))}
      </form>

      {submissions.length === 0 ? (
        <div className="bg-navy-850 border border-[var(--border-subtle)] rounded-xl p-12 text-center">
          <p className="text-silver-500">
            {status ? "Bu durumda talep bulunamadı." : "Henüz ilan talebi yok."}
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-[var(--border-subtle)] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-navy-800 border-b border-[var(--border-subtle)]">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-silver-400 uppercase tracking-wider">İlan Başlığı</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-silver-400 uppercase tracking-wider hidden md:table-cell">Kategori</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-silver-400 uppercase tracking-wider hidden lg:table-cell">İletişim</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-silver-400 uppercase tracking-wider hidden sm:table-cell">Tarih</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-silver-400 uppercase tracking-wider">Durum</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {submissions.map((s) => (
                  <tr key={s.id} className="bg-navy-850 hover:bg-navy-800/60 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-cream-100 line-clamp-1">{s.titleTr}</p>
                      <p className="text-xs text-silver-500">{s.district} • {Number(s.price).toLocaleString("tr-TR")} ₺</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-silver-400 text-xs">
                        {CATEGORY_LABELS[s.category] ?? s.category} • {TYPE_LABELS[s.type] ?? s.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <p className="text-cream-200 text-xs">{s.contactName}</p>
                      <p className="text-silver-500 text-xs">{s.contactPhone}</p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-silver-500 text-xs">
                      {new Date(s.createdAt).toLocaleDateString("tr-TR")}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/ilan-talepleri/${s.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-navy-700 text-silver-400 hover:text-cream-100 text-xs font-medium transition-colors"
                      >
                        <Eye size={13} strokeWidth={1.5} />
                        İncele
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <span className="text-xs text-silver-500">
                Sayfa {page} / {totalPages} ({total} talep)
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
