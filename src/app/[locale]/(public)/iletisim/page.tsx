import type { Metadata } from "next";
import { db } from "@/lib/db";
import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";
import ContactForm from "@/components/contact/contact-form";
import OfficeMapClient from "@/components/contact/office-map-client";
import type { ContactPartner } from "@/components/admin/settings-form";

export const metadata: Metadata = {
  title: "İletişim | Güleryüz Gayrimenkul",
  description:
    "Güleryüz Gayrimenkul ile iletişime geçin. Eskişehir ofisimizi ziyaret edin veya formu doldurun, en kısa sürede dönüş yapalım.",
  openGraph: {
    title: "İletişim | Güleryüz Gayrimenkul",
    description:
      "Eskişehir'de gayrimenkul danışmanlığı için bizimle iletişime geçin.",
    type: "website",
  },
};

export default async function IletisimPage() {
  const settings = await db.siteSettings.findFirst();

  let socialLinks: Record<string, string> = {};
  if (settings?.socialLinks) {
    try { socialLinks = JSON.parse(settings.socialLinks); } catch {}
  }

  let partners: ContactPartner[] = [];
  if (settings?.contactPhones) {
    try { partners = JSON.parse(settings.contactPhones); } catch {}
  }
  if (partners.length === 0 && settings?.contactPhone) {
    partners = [{ name: "", phone: settings.contactPhone, whatsapp: "" }];
  }

  return (
    <div className="min-h-screen bg-navy-900">
      {/* Hero */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-900" />
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 50%, #D4A744 0%, transparent 50%)",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="font-sans text-xs tracking-[0.3em] uppercase text-gold-500 mb-4">
            Bize Ulaşın
          </p>
          <h1 className="font-display text-display-lg md:text-display-xl text-cream-50 mb-6">
            İletişim
          </h1>
          <div className="w-16 h-px bg-gold-500 mx-auto mb-6" />
          <p className="font-sans text-silver-400 text-lg max-w-2xl mx-auto">
            Sorularınız, mülk değerleme talepleriniz veya randevu için
            formu doldurun, sizi arayalım.
          </p>
        </div>
      </section>

      {/* İletişim Bilgileri + Form */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Sol — iletişim bilgileri */}
            <div>
              <p className="font-sans text-xs tracking-[0.3em] uppercase text-gold-500 mb-3">
                Bilgilerimiz
              </p>
              <h2 className="font-display text-display-sm text-cream-50 mb-8">
                Bizimle İletişime
                <br />
                <em>Geçin</em>
              </h2>
              <div className="w-10 h-px bg-gold-500 mb-10" />

              <div className="space-y-6">
                {settings?.address && (
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-navy-800 border border-navy-700 flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4 text-gold-500" />
                    </div>
                    <div>
                      <p className="text-xs font-sans text-silver-500 uppercase tracking-wider mb-1">
                        Adres
                      </p>
                      <p className="text-cream-200 font-sans text-sm leading-relaxed">
                        {settings.address}
                      </p>
                    </div>
                  </div>
                )}

                {partners.length > 0 && (
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-navy-800 border border-navy-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Phone className="w-4 h-4 text-gold-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-sans text-silver-500 uppercase tracking-wider mb-3">
                        Telefon
                      </p>
                      <div className="space-y-3">
                        {partners.map((p, i) => (
                          <div key={i} className="flex flex-col gap-1.5">
                            {p.name && (
                              <p className="text-xs text-silver-500 font-medium">{p.name}</p>
                            )}
                            <div className="flex items-center gap-2 flex-wrap">
                              <a
                                href={`tel:${p.phone}`}
                                className="text-cream-200 font-sans text-sm hover:text-gold-400 transition-colors"
                              >
                                {p.phone}
                              </a>
                              {p.whatsapp && (
                                <a
                                  href={`https://wa.me/${p.whatsapp.replace(/\D/g, "")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs hover:bg-green-500/20 transition-colors"
                                >
                                  <MessageCircle className="w-3 h-3" />
                                  WhatsApp
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {settings?.contactEmail && (
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-navy-800 border border-navy-700 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4 text-gold-500" />
                    </div>
                    <div>
                      <p className="text-xs font-sans text-silver-500 uppercase tracking-wider mb-1">
                        E-posta
                      </p>
                      <a
                        href={`mailto:${settings.contactEmail}`}
                        className="text-cream-200 font-sans text-sm hover:text-gold-400 transition-colors"
                      >
                        {settings.contactEmail}
                      </a>
                    </div>
                  </div>
                )}

                {settings?.workingHours && (
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-navy-800 border border-navy-700 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4 text-gold-500" />
                    </div>
                    <div>
                      <p className="text-xs font-sans text-silver-500 uppercase tracking-wider mb-1">
                        Çalışma Saatleri
                      </p>
                      <p className="text-cream-200 font-sans text-sm leading-relaxed whitespace-pre-line">
                        {settings.workingHours}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Sosyal medya linkleri */}
              {Object.keys(socialLinks).length > 0 && (
                <div className="mt-10 pt-8 border-t border-navy-700">
                  <p className="text-xs font-sans text-silver-500 uppercase tracking-wider mb-4">
                    Sosyal Medya
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    {Object.entries(socialLinks).map(([platform, url]) =>
                      url ? (
                        <a
                          key={platform}
                          href={url.startsWith("http") ? url : platform === "whatsapp" ? `https://wa.me/${url.replace(/\s/g, "")}` : url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-navy-800 border border-navy-700 hover:border-gold-500/40 text-silver-400 hover:text-gold-400 rounded-full text-xs font-sans transition-colors capitalize"
                        >
                          {platform}
                        </a>
                      ) : null
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sağ — form */}
            <div className="bg-navy-800 border border-navy-700 rounded-2xl p-8">
              <h3 className="font-display text-display-sm text-cream-50 mb-2">
                Mesaj Gönderin
              </h3>
              <p className="text-silver-400 text-sm font-sans mb-8">
                Tüm alanları doldurun, en kısa sürede yanıt verelim.
              </p>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* Harita */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-navy-800 border border-navy-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-silver-300 uppercase tracking-wider">
                Konum
              </h2>
              {settings?.contactLat && settings?.contactLng && (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${settings.contactLat},${settings.contactLng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gold-500/35 text-gold-500 text-xs font-medium hover:bg-gold-500/8 transition-colors"
                >
                  <MapPin size={12} strokeWidth={1.5} />
                  Yol Tarifi Al
                </a>
              )}
            </div>
            <div className="h-96 rounded-xl overflow-hidden border border-navy-700">
              <OfficeMapClient
                address={settings?.address}
                lat={settings?.contactLat ?? undefined}
                lng={settings?.contactLng ?? undefined}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
