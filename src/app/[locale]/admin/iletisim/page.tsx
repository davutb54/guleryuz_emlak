import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { markMessageRead, deleteMessage } from "@/lib/actions/contact";
import { Mail, MailOpen, Trash2, Phone } from "lucide-react";

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ gorunum?: string }>;
}

export default async function AdminIletisimPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { gorunum = "hepsi" } = await searchParams;
  const session = await auth();
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    redirect(`/${locale}/giris`);
  }

  const where = gorunum === "okunmamis" ? { read: false } : gorunum === "okunmus" ? { read: true } : {};

  const messages = await db.contactMessage.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const unreadCount = await db.contactMessage.count({ where: { read: false } });

  const { Link } = await import("@/i18n/navigation");

  const tabs = [
    { value: "hepsi",      label: "Tümü" },
    { value: "okunmamis",  label: `Okunmamış ${unreadCount > 0 ? `(${unreadCount})` : ""}` },
    { value: "okunmus",    label: "Okunmuş" },
  ];

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="font-display text-display-sm text-cream-50 mb-1">İletişim Mesajları</h1>
        <p className="text-silver-500 text-sm">{messages.length} mesaj</p>
      </div>

      {/* Filtre sekmeleri */}
      <div className="flex gap-2 mb-5">
        {tabs.map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/iletisim${tab.value === "hepsi" ? "" : `?gorunum=${tab.value}`}`}
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

      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-navy-850 rounded-xl border border-[var(--border-subtle)]">
          <Mail size={32} strokeWidth={1} className="text-navy-600 mb-3" />
          <p className="text-silver-500 text-sm">Bu görünümde mesaj yok.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div key={msg.id}
              className={`bg-navy-850 border rounded-xl p-5 ${
                msg.read ? "border-[var(--border-subtle)] opacity-80" : "border-gold-500/20"
              }`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Başlık satırı */}
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <div className="flex items-center gap-2">
                      {msg.read
                        ? <MailOpen size={14} strokeWidth={1.5} className="text-silver-500" />
                        : <Mail size={14} strokeWidth={1.5} className="text-gold-500" />
                      }
                      <span className={`font-medium text-sm ${msg.read ? "text-cream-200" : "text-cream-50"}`}>
                        {msg.name}
                      </span>
                    </div>
                    <a href={`mailto:${msg.email}`}
                      className="text-xs text-silver-400 hover:text-gold-400 transition-colors">{msg.email}</a>
                    {msg.phone && (
                      <div className="flex items-center gap-1 text-xs text-silver-500">
                        <Phone size={11} strokeWidth={1.5} />
                        <a href={`tel:${msg.phone}`} className="hover:text-cream-100 transition-colors">{msg.phone}</a>
                      </div>
                    )}
                    <span className="text-silver-600 text-xs ml-auto">
                      {new Date(msg.createdAt).toLocaleDateString("tr-TR", {
                        day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {msg.subject && (
                    <p className="text-xs text-silver-500 mb-1.5">Konu: <span className="text-silver-300">{msg.subject}</span></p>
                  )}
                  <p className="text-cream-200 text-sm whitespace-pre-line">{msg.message}</p>
                </div>

                {/* Aksiyon butonları */}
                <div className="flex flex-col gap-2 shrink-0">
                  {!msg.read && (
                    <form action={markMessageRead.bind(null, msg.id)}>
                      <button type="submit"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-medium hover:bg-blue-500/20 transition-colors whitespace-nowrap">
                        <MailOpen size={12} /> Okundu
                      </button>
                    </form>
                  )}
                  <form action={deleteMessage.bind(null, msg.id)}>
                    <button type="submit"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-medium hover:bg-red-500/20 transition-colors">
                      <Trash2 size={12} /> Sil
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
