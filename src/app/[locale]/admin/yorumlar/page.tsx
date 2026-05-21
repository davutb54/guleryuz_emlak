import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { deleteComment, toggleApproveComment } from "@/lib/actions/comment";
import { Link } from "@/i18n/navigation";
import { Star, Trash2, MessageSquare, Eye, EyeOff, ExternalLink } from "lucide-react";

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ gorunum?: string }>;
}

export default async function AdminYorumlarPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { gorunum = "hepsi" } = await searchParams;
  const session = await auth();
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    redirect(`/${locale}/giris`);
  }

  const where = gorunum === "gizli" ? { approved: false } : gorunum === "yayinda" ? { approved: true } : {};

  const comments = await db.comment.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      user: { select: { name: true, email: true } },
      listing: { select: { titleTr: true, slug: true } },
    },
  });

  const tabs = [
    { value: "hepsi",   label: "Tümü" },
    { value: "yayinda", label: "Yayında" },
    { value: "gizli",   label: "Gizli" },
  ];

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="font-display text-display-sm text-cream-50 mb-1">Yorumlar</h1>
        <p className="text-silver-500 text-sm">{comments.length} yorum</p>
      </div>

      {/* Filtre sekmeleri */}
      <div className="flex gap-2 mb-5">
        {tabs.map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/yorumlar${tab.value === "hepsi" ? "" : `?gorunum=${tab.value}`}`}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              gorunum === tab.value
                ? "bg-gold-500/15 text-gold-400 border border-gold-500/25"
                : "text-silver-400 hover:text-cream-100"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {comments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-navy-850 rounded-xl border border-[var(--border-subtle)]">
          <MessageSquare size={32} strokeWidth={1} className="text-navy-600 mb-3" />
          <p className="text-silver-500 text-sm">Bu görünümde yorum yok.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className={`bg-navy-850 border rounded-xl p-5 transition-colors ${
                comment.approved ? "border-[var(--border-subtle)]" : "border-red-500/20 opacity-70"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <span className="text-cream-100 font-medium text-sm">{comment.user.name}</span>
                    <span className="text-silver-600 text-xs">{comment.user.email}</span>
                    {comment.rating && (
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={12} strokeWidth={1.5}
                            className={s <= comment.rating! ? "fill-gold-500 text-gold-500" : "text-navy-600"} />
                        ))}
                      </div>
                    )}
                    {!comment.approved && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 font-semibold uppercase">
                        Gizli
                      </span>
                    )}
                    <span className="text-silver-600 text-xs ml-auto">
                      {new Date(comment.createdAt).toLocaleDateString("tr-TR")}
                    </span>
                  </div>
                  <p className="text-cream-200 text-sm mb-2">{comment.content}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-silver-600">İlan:</span>
                    <Link
                      href={`/ilan/${comment.listing.slug}`}
                      target="_blank"
                      className="flex items-center gap-1 text-xs text-silver-400 hover:text-gold-400 transition-colors"
                    >
                      {comment.listing.titleTr}
                      <ExternalLink size={10} strokeWidth={1.5} />
                    </Link>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Onayla / Gizle toggle */}
                  <form action={toggleApproveComment.bind(null, comment.id)}>
                    <button type="submit"
                      title={comment.approved ? "Gizle" : "Yayınla"}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                        comment.approved
                          ? "bg-silver-500/10 text-silver-400 border-silver-500/20 hover:bg-silver-500/20"
                          : "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20"
                      }`}>
                      {comment.approved ? <EyeOff size={13} /> : <Eye size={13} />}
                      {comment.approved ? "Gizle" : "Yayınla"}
                    </button>
                  </form>
                  {/* Sil */}
                  <form action={deleteComment.bind(null, comment.id)}>
                    <button type="submit"
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-medium hover:bg-red-500/20 transition-colors">
                      <Trash2 size={13} /> Sil
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
