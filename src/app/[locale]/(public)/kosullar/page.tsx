import type { Metadata } from "next";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Kullanım Koşulları | Güleryüz Gayrimenkul",
  description: "Güleryüz Gayrimenkul web sitesi kullanım koşulları.",
  robots: { index: false, follow: false },
};

export default async function KosullarPage() {
  const settings = await db.siteSettings.findUnique({
    where: { id: 1 },
    select: { termsText: true },
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
            Kullanım Koşulları
          </h1>
          <div className="w-12 h-px bg-gold-500 mx-auto mb-12" />

          {settings?.termsText ? (
            <div className="font-sans text-silver-400 text-sm leading-relaxed whitespace-pre-wrap">
              {settings.termsText}
            </div>
          ) : (
            <div className="space-y-8 font-sans text-silver-400 text-sm leading-relaxed">
              <section>
                <h2 className="font-display text-xl text-cream-100 mb-3">
                  1. Kabul
                </h2>
                <p>
                  Bu web sitesini kullanarak aşağıdaki koşulları kabul etmiş
                  sayılırsınız. Koşulları kabul etmiyorsanız siteyi
                  kullanmayınız.
                </p>
              </section>

              <section>
                <h2 className="font-display text-xl text-cream-100 mb-3">
                  2. Hizmet Kapsamı
                </h2>
                <p>
                  Güleryüz Gayrimenkul web sitesi, Eskişehir ilinde satılık ve
                  kiralık gayrimenkul ilanlarının listelenmesi ve tanıtımı
                  amacıyla hizmet vermektedir.
                </p>
                <ul className="list-disc list-inside space-y-1 mt-2 pl-2">
                  <li>İlan ekleme yalnızca yetkilendirilmiş personele açıktır</li>
                  <li>Kullanıcılar ilan favorileme, yorum yazma ve bildirim alma hizmetlerinden yararlanabilir</li>
                  <li>Ücretli üyelik veya ödeme işlemi yapılmamaktadır</li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-xl text-cream-100 mb-3">
                  3. Kullanıcı Yükümlülükleri
                </h2>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li>Doğru ve güncel bilgi sağlamak</li>
                  <li>Başkalarının haklarını ihlal etmemek</li>
                  <li>Sisteme zarar verici eylemlerden kaçınmak</li>
                  <li>Platformu yalnızca yasal amaçlarla kullanmak</li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-xl text-cream-100 mb-3">
                  4. Sorumluluk Sınırlaması
                </h2>
                <p>
                  İlan bilgilerinin doğruluğu maksimum özen gösterilerek
                  sağlanmaktadır; ancak Güleryüz Gayrimenkul, ilan
                  içeriklerindeki olası hatalar nedeniyle sorumluluk
                  üstlenmez. Nihai alım-satım/kiralama kararlarından önce
                  resmi belge doğrulaması yapılmasını tavsiye ederiz.
                </p>
              </section>

              <section>
                <h2 className="font-display text-xl text-cream-100 mb-3">
                  5. Fikri Mülkiyet
                </h2>
                <p>
                  Site içeriği, görseller ve tasarım unsurları Güleryüz
                  Gayrimenkul&apos;e aittir. İzinsiz kopyalanması, dağıtılması
                  veya ticari amaçla kullanılması yasaktır.
                </p>
              </section>

              <section>
                <h2 className="font-display text-xl text-cream-100 mb-3">
                  6. Değişiklikler
                </h2>
                <p>
                  Kullanım koşulları önceden bildirmeksizin güncellenebilir.
                  Güncel koşullar her zaman bu sayfada yayınlanır.
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
