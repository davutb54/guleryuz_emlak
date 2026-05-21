import type { Metadata } from "next";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni | Güleryüz Gayrimenkul",
  description:
    "6698 Sayılı Kişisel Verilerin Korunması Kanunu kapsamında kişisel verilerinizin işlenmesine ilişkin aydınlatma metni.",
  robots: { index: false, follow: false },
};

export default async function KvkkPage() {
  const settings = await db.siteSettings.findUnique({
    where: { id: 1 },
    select: { kvkkText: true },
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
            KVKK Aydınlatma Metni
          </h1>
          <div className="w-12 h-px bg-gold-500 mx-auto mb-12" />

          {settings?.kvkkText ? (
            <div className="font-sans text-silver-400 text-sm leading-relaxed whitespace-pre-wrap">
              {settings.kvkkText}
            </div>
          ) : (
            <div className="prose prose-invert max-w-none space-y-8 font-sans text-silver-400 text-sm leading-relaxed">
              <section>
                <h2 className="font-display text-xl text-cream-100 mb-3">
                  1. Veri Sorumlusunun Kimliği
                </h2>
                <p>
                  6698 Sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;)
                  kapsamında kişisel verileriniz, veri sorumlusu sıfatıyla{" "}
                  <strong className="text-cream-200">
                    Güleryüz Gayrimenkul
                  </strong>{" "}
                  tarafından işlenmektedir.
                </p>
              </section>

              <section>
                <h2 className="font-display text-xl text-cream-100 mb-3">
                  2. Toplanan Kişisel Veriler
                </h2>
                <p>Aşağıdaki kişisel verileriniz işlenebilmektedir:</p>
                <ul className="list-disc list-inside space-y-1 mt-2 pl-2">
                  <li>Kimlik bilgileri (ad, soyad)</li>
                  <li>İletişim bilgileri (e-posta adresi, telefon numarası)</li>
                  <li>İşlem güvenliği bilgileri (IP adresi, çerez verileri)</li>
                  <li>Talep ve şikayet yönetimi kapsamında paylaştığınız bilgiler</li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-xl text-cream-100 mb-3">
                  3. Kişisel Verilerin İşlenme Amaçları
                </h2>
                <ul className="list-disc list-inside space-y-1 mt-2 pl-2">
                  <li>Üyelik ve giriş işlemlerinin gerçekleştirilmesi</li>
                  <li>İletişim taleplerinizin yanıtlanması</li>
                  <li>Arama alarmı ve favori ilan bildirimlerinin iletilmesi</li>
                  <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                  <li>Hizmet kalitesinin iyileştirilmesi</li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-xl text-cream-100 mb-3">
                  4. Kişisel Verilerin Aktarılması
                </h2>
                <p>
                  Kişisel verileriniz; yasal zorunluluklar dışında üçüncü
                  kişilere aktarılmamaktadır. E-posta hizmetleri kapsamında
                  yalnızca e-posta servis sağlayıcısı (Resend) ile
                  paylaşılabilmektedir.
                </p>
              </section>

              <section>
                <h2 className="font-display text-xl text-cream-100 mb-3">
                  5. Veri Sahibinin Hakları
                </h2>
                <p>KVKK&apos;nın 11. maddesi kapsamında aşağıdaki haklara sahipsiniz:</p>
                <ul className="list-disc list-inside space-y-1 mt-2 pl-2">
                  <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                  <li>İşlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                  <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
                  <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme</li>
                  <li>Kişisel verilerin silinmesini veya yok edilmesini isteme</li>
                  <li>Zararın giderilmesini talep etme</li>
                </ul>
                <p className="mt-4">
                  Haklarınızı kullanmak için{" "}
                  <strong className="text-cream-200">
                    info@guleryuzgayrimenkul.com
                  </strong>{" "}
                  adresine başvurabilirsiniz.
                </p>
              </section>

              <section>
                <h2 className="font-display text-xl text-cream-100 mb-3">
                  6. Çerezler (Cookies)
                </h2>
                <p>
                  Sitemiz oturum yönetimi amacıyla zorunlu çerezler
                  kullanmaktadır. Bu çerezler HttpOnly ve Secure olarak
                  işaretlenmiş olup üçüncü taraf izleme çerezi
                  kullanılmamaktadır.
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
