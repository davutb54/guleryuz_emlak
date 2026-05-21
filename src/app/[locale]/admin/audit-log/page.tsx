import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Link } from "@/i18n/navigation";
import { ClipboardList, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 50;

const ACTION_COLORS: Record<string, string> = {
  "listing.create":        "text-green-400",
  "listing.delete":        "text-red-400",
  "listing.bulk_delete":   "text-red-400",
  "listing.bulk_activate": "text-green-400",
  "listing.bulk_archive":  "text-silver-400",
  "listing.toggle_featured": "text-gold-500",
  "user.role_change":      "text-blue-400",
  "user.ban":              "text-red-400",
  "user.unban":            "text-green-400",
  "comment.delete":        "text-red-400",
  "gallery.create":        "text-green-400",
  "gallery.delete":        "text-red-400",
};

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    sayfa?: string;
    action?: string;
    entity?: string;
  }>;
}

export default async function AdminAuditLogPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { sayfa = "1", action = "", entity = "" } = await searchParams;
  const session = await auth();
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    redirect(`/${locale}/giris`);
  }

  const page = Math.max(1, parseInt(sayfa, 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const where: Record<string, unknown> = {};
  if (action) where.action = { contains: action };
  if (entity) where.entity = entity;

  const [logs, total] = await Promise.all([
    db.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
      include: { user: { select: { name: true, email: true } } },
    }),
    db.auditLog.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Mevcut filtrelerin URL'si
  function buildUrl(p: number) {
    const params = new URLSearchParams();
    if (p > 1) params.set("sayfa", String(p));
    if (action) params.set("action", action);
    if (entity) params.set("entity", entity);
    const q = params.toString();
    return `/admin/audit-log${q ? `?${q}` : ""}`;
  }

  const ENTITY_OPTIONS = ["Listing", "User", "Comment", "GalleryItem"];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-display-md text-cream-50">Denetim Günlüğü</h1>
        <p className="text-silver-500 text-sm mt-1">{total} kayıt</p>
      </div>

      {/* Filtre */}
      <form method="GET" className="flex flex-wrap gap-3 mb-5">
        <input name="action" defaultValue={action} placeholder="Eylem filtrele (örn: listing)"
          className="h-10 px-3 bg-navy-800 border border-[var(--border-subtle)] rounded-xl text-sm text-cream-100 placeholder-silver-600 focus:outline-none focus:border-gold-500/60 w-48" />
        <select name="entity" defaultValue={entity}
          className="h-10 px-3 bg-navy-800 border border-[var(--border-subtle)] rounded-xl text-sm text-cream-100 focus:outline-none focus:border-gold-500/60 [&>option]:bg-navy-800">
          <option value="">Tüm Varlıklar</option>
          {ENTITY_OPTIONS.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
        <button type="submit"
          className="h-10 px-5 rounded-xl bg-gold-500 text-navy-900 text-sm font-semibold hover:bg-gold-400 transition-colors">
          Filtrele
        </button>
        {(action || entity) && (
          <Link href="/admin/audit-log"
            className="h-10 px-4 flex items-center rounded-xl border border-[var(--border-subtle)] text-silver-400 text-sm hover:text-cream-100 transition-colors">
            Temizle
          </Link>
        )}
      </form>

      {logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-navy-850 rounded-xl border border-[var(--border-subtle)]">
          <ClipboardList size={32} strokeWidth={1} className="text-navy-600 mb-3" />
          <p className="text-silver-500 text-sm">Bu filtreyle kayıt bulunamadı.</p>
        </div>
      ) : (
        <>
          <div className="bg-navy-850 border border-[var(--border-subtle)] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-divider)]">
                    {["Zaman", "Kullanıcı", "Eylem", "Varlık", "Detay", "IP"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-silver-400 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => {
                    let metadata: Record<string, unknown> = {};
                    try { metadata = log.metadata ? JSON.parse(log.metadata) : {}; } catch {}
                    const actionColor = ACTION_COLORS[log.action] ?? "text-cream-300";

                    return (
                      <tr key={log.id} className="border-b border-[var(--border-divider)] last:border-0 hover:bg-navy-800/40 transition-colors">
                        <td className="px-4 py-3 text-silver-500 text-xs whitespace-nowrap">
                          {log.createdAt.toLocaleDateString("tr-TR", {
                            day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-cream-200 text-xs font-medium">{log.user.name}</div>
                          <div className="text-silver-600 text-xs">{log.user.email}</div>
                        </td>
                        <td className={`px-4 py-3 text-xs font-mono ${actionColor}`}>{log.action}</td>
                        <td className="px-4 py-3 text-silver-400 text-xs">
                          <div>{log.entity}</div>
                          {log.entityId && <div className="text-silver-600 font-mono text-[10px] truncate max-w-[80px]">{log.entityId}</div>}
                        </td>
                        <td className="px-4 py-3 text-silver-500 text-xs max-w-[200px]">
                          {Object.keys(metadata).length > 0 && (
                            <span className="truncate block">
                              {Object.entries(metadata)
                                .slice(0, 2)
                                .map(([k, v]) => `${k}: ${String(v)}`)
                                .join(", ")}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-silver-600 text-xs font-mono">{log.ipAddress ?? "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sayfalama */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <span className="text-xs text-silver-500">
                Sayfa {page} / {totalPages} ({total} kayıt)
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
