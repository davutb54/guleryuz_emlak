import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Users } from "lucide-react";
import { UserRoleSelect, BanButton } from "@/components/admin/user-actions";
import UserTitleEdit from "@/components/admin/user-title-edit";
import { Link } from "@/i18n/navigation";

const ROLE_LABELS: Record<string, { label: string; cls: string }> = {
  USER:        { label: "Kullanıcı",   cls: "text-cream-300" },
  AGENT:       { label: "Agent",       cls: "text-blue-400" },
  ADMIN:       { label: "Admin",       cls: "text-purple-400" },
  SUPER_ADMIN: { label: "Süper Admin", cls: "text-gold-500" },
};

const FILTER_TABS = [
  { value: "",            label: "Tümü" },
  { value: "USER",        label: "Kullanıcı" },
  { value: "AGENT",       label: "Agent" },
  { value: "ADMIN",       label: "Admin" },
  { value: "SUPER_ADMIN", label: "Süper Admin" },
];

const TITLE_ELIGIBLE = ["AGENT", "ADMIN", "SUPER_ADMIN"];

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ rol?: string }>;
}

export default async function AdminKullanicilarPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { rol } = await searchParams;
  const session = await auth();
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    redirect(`/${locale}/giris`);
  }

  const roleFilter = FILTER_TABS.some((t) => t.value === rol) && rol ? rol : undefined;

  const [rawUsers, favCounts, commentCounts] = await Promise.all([
    db.user.findMany({
      where: roleFilter ? { role: roleFilter as any } : undefined,
      orderBy: { createdAt: "desc" },
    }),
    db.favorite.groupBy({ by: ["userId"], _count: { _all: true } }),
    db.comment.groupBy({ by: ["userId"], _count: { _all: true } }),
  ]);

  const users = rawUsers.map(({ passwordHash: _ph, twoFactorSecret: _ts, ...u }) => u);
  const favMap = new Map(favCounts.map((r) => [r.userId, r._count._all]));
  const commentMap = new Map(commentCounts.map((r) => [r.userId, r._count._all]));

  function filterUrl(value: string) {
    return value ? `?rol=${value}` : "?";
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-display-md text-cream-50">Kullanıcılar</h1>
        <p className="text-silver-500 text-sm mt-1">{users.length} kullanıcı{roleFilter ? ` (${ROLE_LABELS[roleFilter]?.label} filtresi)` : ""}</p>
      </div>

      {/* Rol filtresi */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTER_TABS.map((tab) => {
          const active = (tab.value === "") ? !roleFilter : roleFilter === tab.value;
          return (
            <Link
              key={tab.value}
              href={filterUrl(tab.value) as any}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
                active
                  ? "bg-gold-500 text-navy-900 border-gold-500"
                  : "bg-transparent text-silver-400 border-[var(--border-subtle)] hover:text-cream-100 hover:border-silver-500"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-navy-850 rounded-xl border border-[var(--border-subtle)]">
          <Users size={32} strokeWidth={1} className="text-navy-600 mb-3" />
          <p className="text-silver-500 text-sm">Bu filtrede kullanıcı yok.</p>
        </div>
      ) : (
        <div className="bg-navy-850 border border-[var(--border-subtle)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-divider)]">
                  {["İsim / E-posta", "Rol", "Ünvan", "Favori", "Yorum", "Kayıt", "İşlem"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-silver-400 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const roleInfo = ROLE_LABELS[user.role] ?? ROLE_LABELS.USER;
                  const isSelf = user.id === session.user!.id;
                  const canEditTitle = TITLE_ELIGIBLE.includes(user.role);

                  return (
                    <tr key={user.id}
                      className={`border-b border-[var(--border-divider)] last:border-0 hover:bg-navy-800/60 transition-colors ${user.banned ? "opacity-60" : ""}`}>
                      <td className="px-4 py-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-cream-100 font-medium text-sm">{user.name}</span>
                            {user.banned && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 font-semibold uppercase">
                                Banlı
                              </span>
                            )}
                            {isSelf && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-gold-500/15 text-gold-500 font-semibold uppercase">
                                Siz
                              </span>
                            )}
                          </div>
                          <span className="text-silver-500 text-xs">{user.email}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium ${roleInfo.cls}`}>{roleInfo.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        {canEditTitle ? (
                          <span className="text-silver-400 text-xs italic">
                            {(user as any).title ?? <span className="text-navy-600">—</span>}
                          </span>
                        ) : (
                          <span className="text-navy-600 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-silver-400 tabular-nums text-xs">{favMap.get(user.id) ?? 0}</td>
                      <td className="px-4 py-3 text-silver-400 tabular-nums text-xs">{commentMap.get(user.id) ?? 0}</td>
                      <td className="px-4 py-3 text-silver-500 text-xs whitespace-nowrap">
                        {user.createdAt.toLocaleDateString("tr-TR")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          {canEditTitle && (
                            <UserTitleEdit
                              userId={user.id}
                              currentTitle={(user as any).title ?? null}
                            />
                          )}
                          {user.role !== "SUPER_ADMIN" && (
                            <UserRoleSelect
                              userId={user.id}
                              currentRole={user.role}
                              isSelf={isSelf}
                            />
                          )}
                          {user.role !== "SUPER_ADMIN" && user.role !== "ADMIN" && (
                            <BanButton userId={user.id} banned={user.banned} isSelf={isSelf} />
                          )}
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
