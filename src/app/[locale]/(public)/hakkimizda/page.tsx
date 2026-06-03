import type { Metadata } from "next";
import { db } from "@/lib/db";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import {
  Phone,
  Mail,
  MapPin,
  Award,
  Users,
  Building2,
  TrendingUp,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Hakkımızda | Güleryüz Gayrimenkul",
  description:
    "Güleryüz Gayrimenkul olarak Eskişehir'de yıllardır güvenilir, şeffaf ve profesyonel emlak hizmeti sunuyoruz. Ekibimiz ve vizyonumuz hakkında bilgi edinin.",
  openGraph: {
    title: "Hakkımızda | Güleryüz Gayrimenkul",
    description:
      "Eskişehir'in güvenilir emlak ofisi. Profesyonel ekibimiz ve değerlerimiz hakkında bilgi edinin.",
    type: "website",
  },
};

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Yönetici",
  AGENT: "Emlak Danışmanı",
};

const DEFAULT_STATS = [
  { icon: Award, value: "15+", label: "Yıllık Deneyim", key: "statYear" as const },
  { icon: Building2, value: "500+", label: "Tamamlanan İşlem", key: "statTransactions" as const },
  { icon: Users, value: "1.000+", label: "Mutlu Müşteri", key: "statCustomers" as const },
  { icon: TrendingUp, value: "%98", label: "Müşteri Memnuniyeti", key: "statSatisfaction" as const },
];

export default async function HakkimizdaPage() {
  const [settings, teamMembers] = await Promise.all([
    db.siteSettings.findFirst(),
    db.user.findMany({
      where: { role: { in: ["ADMIN", "AGENT"] } },
      select: {
        id: true,
        name: true,
        title: true,
        role: true,
        email: true,
        phone: true,
        avatar: true,
      },
      orderBy: [{ role: "asc" }, { name: "asc" }],
    }),
  ]);

  const aboutText =
    settings?.aboutTr ??
    "Güleryüz Gayrimenkul, Eskişehir'de 15 yılı aşkın deneyimiyle konut, arsa, tarla ve ticari mülk alım-satım ve kiralama hizmetleri sunmaktadır. Müşteri memnuniyetini her şeyin önünde tutan anlayışımızla, hayalinizdeki mülkü bulmanızda yanınızdayız. Şeffaf, güvenilir ve profesyonel hizmet anlayışımızla Eskişehir'in en köklü gayrimenkul ofislerinden biri olmaktan gurur duyuyoruz.";

  const stats = DEFAULT_STATS.map((s) => ({
    ...s,
    value: settings?.[s.key] ?? s.value,
  }));

  return (
    <div className="min-h-screen bg-navy-900">
      {/* Hero */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-900" />
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, #D4A744 0%, transparent 50%), radial-gradient(circle at 80% 20%, #D4A744 0%, transparent 40%)",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="font-sans text-xs tracking-[0.3em] uppercase text-gold-500 mb-4">
            Güleryüz Gayrimenkul
          </p>
          <h1 className="font-display text-display-lg md:text-display-xl text-cream-50 mb-6">
            Hakkımızda
          </h1>
          <div className="w-16 h-px bg-gold-500 mx-auto mb-6" />
          <p className="font-sans text-silver-400 text-lg max-w-2xl mx-auto">
            Eskişehir&apos;de güven ve profesyonellikle, 15 yılı aşkın
            deneyimimizle hayalinizdeki mülkü bulmanızda yanınızdayız.
          </p>
        </div>
      </section>

      {/* Hikayemiz */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Sol — görsel */}
            <div className="relative">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-navy-800">
                {settings?.officePhoto ? (
                  <Image
                    src={settings.officePhoto}
                    alt="Ofisimiz"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Building2 className="w-20 h-20 text-navy-600 mx-auto mb-4" />
                      <p className="text-navy-600 text-sm">Ofis fotoğrafı</p>
                    </div>
                  </div>
                )}
              </div>
              {/* Gold accent kutu */}
              <div className="absolute -bottom-4 -right-4 w-32 h-32 border-2 border-gold-500/30 rounded-xl -z-10" />
              <div className="absolute -top-4 -left-4 w-20 h-20 border border-gold-500/20 rounded-lg -z-10" />
              {/* Yıl rozeti */}
              <div className="absolute top-6 left-6 bg-gold-500 rounded-xl px-4 py-3 text-navy-900">
                <p className="font-display text-3xl font-bold leading-none">
                  {(settings?.statYear ?? "15+").replace("+", "")}
                </p>
                <p className="font-sans text-xs font-semibold mt-0.5">
                  Yıllık Deneyim
                </p>
              </div>
            </div>

            {/* Sağ — metin */}
            <div>
              <p className="font-sans text-xs tracking-[0.3em] uppercase text-gold-500 mb-3">
                Hikayemiz
              </p>
              <h2 className="font-display text-display-md text-cream-50 mb-6">
                Güvenin Adresi,
                <br />
                <em>Eskişehir&apos;in Kalbinde</em>
              </h2>
              <div className="w-12 h-px bg-gold-500 mb-8" />
              <div className="space-y-4 text-silver-400 font-sans leading-relaxed">
                {aboutText.split("\n").map((paragraph, i) =>
                  paragraph.trim() ? (
                    <p key={i}>{paragraph}</p>
                  ) : null
                )}
              </div>

              {/* İletişim bilgileri */}
              {settings && (
                <div className="mt-10 space-y-3">
                  {settings.address && (
                    <div className="flex items-center gap-3 text-silver-400">
                      <MapPin className="w-4 h-4 text-gold-500 shrink-0" />
                      <span className="text-sm">{settings.address}</span>
                    </div>
                  )}
                  {settings.contactPhone && (
                    <div className="flex items-center gap-3 text-silver-400">
                      <Phone className="w-4 h-4 text-gold-500 shrink-0" />
                      <a
                        href={`tel:${settings.contactPhone}`}
                        className="text-sm hover:text-gold-400 transition-colors"
                      >
                        {settings.contactPhone}
                      </a>
                    </div>
                  )}
                  {settings.contactEmail && (
                    <div className="flex items-center gap-3 text-silver-400">
                      <Mail className="w-4 h-4 text-gold-500 shrink-0" />
                      <a
                        href={`mailto:${settings.contactEmail}`}
                        className="text-sm hover:text-gold-400 transition-colors"
                      >
                        {settings.contactEmail}
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* İstatistikler */}
      <section className="py-16 bg-navy-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={label} className="text-center group">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-navy-800 border border-gold-500/20 mb-4 group-hover:border-gold-500/50 transition-colors">
                  <Icon className="w-5 h-5 text-gold-500" />
                </div>
                <p className="font-display text-4xl text-cream-50 mb-1">
                  {value}
                </p>
                <p className="font-sans text-sm text-silver-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vizyonumuz & Değerlerimiz */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="font-sans text-xs tracking-[0.3em] uppercase text-gold-500 mb-3">
              Değerlerimiz
            </p>
            <h2 className="font-display text-display-md text-cream-50">
              Neden Güleryüz?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Güven",
                desc: "Her işlemde şeffaf ve dürüst yaklaşımımızla müşterilerimizin en değerli varlıklarına aracılık ediyoruz.",
              },
              {
                title: "Uzmanlık",
                desc: "Eskişehir gayrimenkul piyasasının derinlemesine bilgisiyle size en doğru kararı almanızda rehberlik ediyoruz.",
              },
              {
                title: "Hizmet",
                desc: "Satın alma veya kiralama sürecinizin her adımında yanınızda olarak süreci kolaylaştırıyoruz.",
              },
            ].map(({ title, desc }) => (
              <div
                key={title}
                className="bg-navy-800 border border-navy-700 rounded-2xl p-8 hover:border-gold-500/30 transition-colors"
              >
                <div className="w-8 h-0.5 bg-gold-500 mb-6" />
                <h3 className="font-display text-display-sm text-cream-50 mb-3">
                  {title}
                </h3>
                <p className="font-sans text-silver-400 leading-relaxed text-sm">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ekibimiz */}
      {teamMembers.length > 0 && (
        <section className="py-20 md:py-28 bg-navy-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="font-sans text-xs tracking-[0.3em] uppercase text-gold-500 mb-3">
                Profesyonel Kadro
              </p>
              <h2 className="font-display text-display-md text-cream-50 mb-4">
                Uzman Ekibimiz
              </h2>
              <div className="w-12 h-px bg-gold-500 mx-auto" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="bg-navy-800 border border-navy-700 rounded-2xl p-6 text-center hover:border-gold-500/30 transition-all hover:-translate-y-1 group"
                >
                  {/* Avatar */}
                  <div className="relative w-20 h-20 mx-auto mb-4">
                    {member.avatar ? (
                      <Image
                        src={member.avatar}
                        alt={member.name}
                        fill
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-navy-700 border-2 border-navy-600 group-hover:border-gold-500/40 transition-colors flex items-center justify-center">
                        <span className="font-display text-2xl text-gold-500">
                          {member.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  <h3 className="font-display text-lg text-cream-50 mb-1">
                    {member.name}
                  </h3>
                  <p className="font-sans text-xs text-gold-500 tracking-wider uppercase mb-4">
                    {member.title || ROLE_LABELS[member.role] || "Uzman"}
                  </p>

                  {/* İletişim ikonları */}
                  <div className="flex items-center justify-center gap-3">
                    <a
                      href={`mailto:${member.email}`}
                      className="w-8 h-8 rounded-full bg-navy-700 hover:bg-gold-500/20 flex items-center justify-center transition-colors group/icon"
                      title="E-posta gönder"
                    >
                      <Mail className="w-3.5 h-3.5 text-silver-500 group-hover/icon:text-gold-400 transition-colors" />
                    </a>
                    {member.phone && (
                      <a
                        href={`tel:${member.phone}`}
                        className="w-8 h-8 rounded-full bg-navy-700 hover:bg-gold-500/20 flex items-center justify-center transition-colors group/icon"
                        title="Telefon et"
                      >
                        <Phone className="w-3.5 h-3.5 text-silver-500 group-hover/icon:text-gold-400 transition-colors" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="font-sans text-xs tracking-[0.3em] uppercase text-gold-500 mb-4">
            İletişime Geçin
          </p>
          <h2 className="font-display text-display-md text-cream-50 mb-6">
            Hayalinizdeki Mülk
            <br />
            <em>Bir Adım Uzağınızda</em>
          </h2>
          <p className="font-sans text-silver-400 mb-10 leading-relaxed">
            Satın almak, kiralamak veya değerleme yaptırmak için uzman
            ekibimizle iletişime geçin.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/iletisim"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gold-500 hover:bg-gold-400 text-navy-900 font-sans font-semibold rounded-full transition-colors text-sm"
            >
              Bize Ulaşın
            </Link>
            <Link
              href="/ilanlar"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-gold-500/40 hover:border-gold-500 text-gold-400 font-sans font-medium rounded-full transition-colors text-sm"
            >
              İlanları Görüntüle
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
