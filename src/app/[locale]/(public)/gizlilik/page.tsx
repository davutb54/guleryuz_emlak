import type { Metadata } from "next";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Gizlilik Politikası | Güleryüz Gayrimenkul",
  description:
    "Güleryüz Gayrimenkul gizlilik politikası. Kişisel verilerinizi nasıl koruyoruz.",
  robots: { index: false, follow: false },
};

export default async function GizlilikPage() {
  const settings = await db.siteSettings.findUnique({
    where: { id: 1 },
    select: { privacyText: true },
  });

  return (
    <div className="min-h-screen bg-navy-900">
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950 to-navy-900" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="font-sans text-xs tracking-[0.3em] uppercase text-gold-500 mb-4 text-center">
            Yasal Bilgilendirme
          </p>
          <h1 className="font-display text-display-md text-cream-50 mb-4 text-center">
            Gizlilik Politikası
          </h1>
          <div className="w-12 h-px bg-gold-500 mx-auto mb-12" />

          {settings?.privacyText ? (
            <div className="font-sans text-silver-400 text-sm leading-relaxed whitespace-pre-wrap">
              {settings.privacyText}
            </div>
          ) : (
            <div className="space-y-8 font-sans text-silver-400 text-sm leading-relaxed">
              <section>
                <h2 className="font-display text-xl text-cream-100 mb-3">
                  1. Genel Bilgiler
                </h2>
                <p>
                  Güleryüz Gayrimenkul olarak kullanıcılarımızın gizliliğine
                  büyük önem veriyoruz. Bu politika, sitemizi kullanırken
                  toplanan verilerin nasıl işlendiğini açıklamaktadır.
                </p>
              </section>

              <section>
                <h2 className="font-display text-xl text-cream-100 mb-3">
                  2. Veri Güvenliği
                </h2>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li>Şifreler Argon2id algoritmasıyla şifrelenmektedir</li>
                  <li>Oturumlar HttpOnly, Secure, SameSite=Lax cookie ile korunmaktadır</li>
                  <li>Yönetici hesapları iki faktörlü doğrulama (2FA) gerektirmektedir</li>
                  <li>Tüm iletişim HTTPS üzerinden şifrelenmektedir</li>
                  <li>Yüklenen görseller EXIF verisi temizlenerek işlenmektedir</li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-xl text-cream-100 mb-3">
                  3. Üçüncü Taraf Hizmetler
                </h2>
                <p>Sitemizde aşağıdaki üçüncü taraf hizmetler kullanılmaktadır:</p>
                <ul className="list-disc list-inside space-y-1 mt-2 pl-2">
                  <li>
                    <strong className="text-cream-200">OpenStreetMap</strong> — Harita hizmeti (koordinat verisi aktarılır)
                  </li>
                  <li>
                    <strong className="text-cream-200">Resend</strong> — E-posta bildirimleri (yalnızca e-posta adresi)
                  </li>
                  <li>
                    <strong className="text-cream-200">Google OAuth</strong> — Sosyal giriş (opsiyonel; Google hesabı e-posta adresi)
                  </li>
                </ul>
                <p className="mt-3">
                  Google Analytics, Meta Pixel veya benzeri reklam izleme araçları kullanılmamaktadır.
                </p>
              </section>

              <section>
                <h2 className="font-display text-xl text-cream-100 mb-3">
                  4. Veri Saklama Süresi
                </h2>
                <p>
                  Hesap verileri hesap silinene kadar saklanmaktadır. Silme
                  talebini{" "}
                  <strong className="text-cream-200">
                    info@guleryuzgayrimenkul.com
                  </strong>{" "}
                  adresine iletebilirsiniz.
                </p>
              </section>

              <section>
                <h2 className="font-display text-xl text-cream-100 mb-3">
                  5. İletişim
                </h2>
                <p>
                  Gizlilik politikamıza ilişkin sorularınız için{" "}
                  <strong className="text-cream-200">
                    info@guleryuzgayrimenkul.com
                  </strong>{" "}
                  adresine yazabilirsiniz.
                </p>
              </section>

              <p className="text-xs text-silver-500 pt-4 border-t border-navy-700">
                Son güncelleme: Mayıs 2026
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
