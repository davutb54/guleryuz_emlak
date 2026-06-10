import type { Metadata } from "next";
import { FileText, Clock, CheckCircle, Phone } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import ListingSubmitForm from "@/components/listing/listing-submit-form";

export const metadata: Metadata = {
  title: "İlan Ekle | Güleryüz Gayrimenkul",
  description:
    "Mülkünüzü satmak veya kiralamak mı istiyorsunuz? İlan talebinizi gönderin, ekibimiz en kısa sürede sizinle iletişime geçsin.",
};

const HOW_IT_WORKS = [
  {
    icon: FileText,
    title: "Formu Doldurun",
    desc: "Mülkünüzün bilgilerini ve iletişim bilgilerinizi girin.",
  },
  {
    icon: Clock,
    title: "İnceleme Süreci",
    desc: "Ekibimiz talebinizi 24 saat içinde inceler.",
  },
  {
    icon: CheckCircle,
    title: "İlanınız Yayında",
    desc: "Onay sonrasında ilanınız sitemizde aktif olarak listelenir.",
  },
  {
    icon: Phone,
    title: "Sizinle İletişim",
    desc: "Gerekirse daha fazla bilgi için sizi ararız.",
  },
];

export default async function IlanEklePage() {
  const session = await auth();
  let contactName: string | undefined;
  let contactEmail: string | undefined;
  let contactPhone: string | undefined;

  if (session?.user?.id) {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, phone: true },
    });
    contactName = user?.name ?? undefined;
    contactEmail = user?.email ?? undefined;
    contactPhone = user?.phone ?? undefined;
  }

  return (
    <main className="mx-auto max-w-[1440px] px-5 py-12 md:px-8 lg:px-16">
      {/* Başlık */}
      <div className="mb-10 text-center">
        <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gold-400 bg-gold-500/10 rounded-full mb-4">
          Ücretsiz
        </span>
        <h1 className="font-display text-display-lg text-cream-50 mb-3">
          İlanınızı Ekleyin
        </h1>
        <p className="text-silver-400 max-w-xl mx-auto">
          Mülkünüzü satmak veya kiralamak mı istiyorsunuz? Bilgilerinizi bırakın,
          ekibimiz ilgilensin.
        </p>
      </div>

      {/* Nasıl çalışır */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {HOW_IT_WORKS.map(({ icon: Icon, title, desc }, i) => (
          <div
            key={i}
            className="flex flex-col items-center text-center gap-3 p-5 rounded-2xl bg-navy-900 border border-[var(--border-subtle)]"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gold-500/10">
              <Icon size={20} className="text-gold-400" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-semibold text-cream-100 mb-1">{title}</p>
              <p className="text-xs text-silver-500">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto bg-navy-900 border border-[var(--border-subtle)] rounded-2xl p-6 md:p-8">
        <ListingSubmitForm
          defaultContactName={contactName}
          defaultContactEmail={contactEmail}
          defaultContactPhone={contactPhone}
        />
      </div>
    </main>
  );
}
