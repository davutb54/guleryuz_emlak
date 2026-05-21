import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Users } from "lucide-react";
import { UserRoleSelect, BanButton } from "@/components/admin/user-actions";

const ROLE_LABELS: Record<string, { label: string; cls: string }> = {
  USER:        { label: "Kullanıcı",  cls: "text-cream-300" },
  AGENT:       { label: "Agent",      cls: "text-blue-400" },
  ADMIN:       { label: "Admin",      cls: "text-purple-400" },
  SUPER_ADMIN: { label: "Süper Admin", cls: "text-gold-500" },
};

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function AdminKullanicilarPage({ params }: Props) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    redirect(`/${locale}/giris`);
  }

  const [rawUsers, favCounts, commentCounts] = await Promise.all([
    db.user.findMany({ orderBy: { createdAt: "desc" } }),
    db.favorite.groupBy({ by: ["userId"], _count: { _all: true } }),
    db.comment.groupBy({ by: ["userId"], _count: { _all: true } }),
  ]);

  // Hassas alanları (passwordHash, twoFactorSecret) çıkar
  const users = rawUsers.map(({ passwordHash: _ph, twoFactorSecret: _ts, ...u }) => u);
  const favMap = new Map(favCounts.map((r) => [r.userId, r._count._all]));
  const commentMap = new Map(commentCounts.map((r) => [r.userId, r._count._all]));

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-display-md text-cream-50">Kullanıcılar</h1>
        <p className="text-silver-500 text-sm mt-1">{users.length} kullanıcı</p>
      </div>

      {users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-navy-850 rounded-xl border border-[var(--border-subtle)]">
          <Users size={32} strokeWidth={1} className="text-navy-600 mb-3" />
          <p className="text-silver-500 text-sm">Henüz kullanıcı yok.</p>
        </div>
      ) : (
        <div className="bg-navy-850 border border-[var(--border-subtle)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-divider)]">
                  {["İsim / E-posta", "Rol", "Favori", "Yorum", "Kayıt", "İşlem"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-silver-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const roleInfo = ROLE_LABELS[user.role] ?? ROLE_LABELS.USER;
                  const isSelf = user.id === session.user!.id;

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
                      <td className="px-4 py-3 text-silver-400 tabular-nums text-xs">{favMap.get(user.id) ?? 0}</td>
                      <td className="px-4 py-3 text-silver-400 tabular-nums text-xs">{commentMap.get(user.id) ?? 0}</td>
                      <td className="px-4 py-3 text-silver-500 text-xs whitespace-nowrap">
                        {user.createdAt.toLocaleDateString("tr-TR")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
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
