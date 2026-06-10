"use client";

import { useState, useTransition, useRef } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { updateSiteSettings } from "@/lib/actions/settings";

const LocationPicker = dynamic(() => import("@/components/shared/location-picker"), { ssr: false });

interface SocialLinks {
  instagram?: string | null;
  facebook?: string | null;
  youtube?: string | null;
  whatsapp?: string | null;
  x?: string | null;
}

export interface ContactPartner {
  name: string;
  phone: string;
  whatsapp?: string;
}

interface InitialData {
  contactEmail: string;
  contactPhone: string;
  contactPhones?: string | null;
  address: string;
  workingHours: string;
  aboutTr?: string | null;
  socialLinks?: string | null;
  kvkkText?: string | null;
  privacyText?: string | null;
  termsText?: string | null;
  contactLat?: number | null;
  contactLng?: number | null;
  officePhoto?: string | null;
  statYear?: string | null;
  statTransactions?: string | null;
  statCustomers?: string | null;
  statSatisfaction?: string | null;
  homeHeroOverlineTr?: string | null;
  homeHeroOverlineEn?: string | null;
  homeHeroHeadlineTr?: string | null;
  homeHeroHeadlineEn?: string | null;
  homeHeroHeadlineAccentTr?: string | null;
  homeHeroHeadlineAccentEn?: string | null;
  homeHeroSubTr?: string | null;
  homeHeroSubEn?: string | null;
  homeFeaturedOverlineTr?: string | null;
  homeFeaturedOverlineEn?: string | null;
  homeFeaturedTitleTr?: string | null;
  homeFeaturedTitleEn?: string | null;
  homeVideoUrl?: string | null;
}

function InputField({ label, name, defaultValue, type = "text", placeholder }: {
  label: string; name: string; defaultValue?: string | null; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs text-silver-400 uppercase tracking-wider mb-1.5 block">{label}</label>
      <input name={name} type={type} defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        className="w-full h-10 px-3 bg-navy-800 border border-[var(--border-subtle)] rounded-xl text-sm text-cream-100 placeholder-silver-600 focus:outline-none focus:border-gold-500/60" />
    </div>
  );
}

function emptyPartner(): ContactPartner { return { name: "", phone: "", whatsapp: "" }; }

export default function SettingsForm({ initial }: { initial?: InitialData | null }) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [contactLat, setContactLat] = useState<number | null>(initial?.contactLat ?? null);
  const [contactLng, setContactLng] = useState<number | null>(initial?.contactLng ?? null);
  const [officePhoto, setOfficePhoto] = useState<string | null>(initial?.officePhoto ?? null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [homeVideoUrl, setHomeVideoUrl] = useState<string | null>(initial?.homeVideoUrl ?? null);
  const [videoUploading, setVideoUploading] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);

  let parsedPartners: ContactPartner[] = [];
  try {
    if (initial?.contactPhones) parsedPartners = JSON.parse(initial.contactPhones);
  } catch {}
  if (parsedPartners.length === 0) {
    parsedPartners = initial?.contactPhone
      ? [{ name: "", phone: initial.contactPhone, whatsapp: "" }]
      : [emptyPartner()];
  }
  const [partners, setPartners] = useState<ContactPartner[]>(parsedPartners);

  let social: SocialLinks = {};
  try { social = initial?.socialLinks ? JSON.parse(initial.socialLinks) : {}; } catch {}

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const json = await res.json();
    if (res.ok && json.url) setOfficePhoto(json.url);
    setPhotoUploading(false);
  }

  async function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const json = await res.json();
    if (res.ok && json.url) setHomeVideoUrl(json.url);
    else setError(json.error || "Video yüklenemedi");
    setVideoUploading(false);
  }

  function updatePartner(index: number, field: keyof ContactPartner, value: string) {
    setPartners(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p));
  }

  function addPartner() {
    setPartners(prev => [...prev, emptyPartner()]);
  }

  function removePartner(index: number) {
    setPartners(prev => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaved(false); setError("");
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd.entries()) as Record<string, string>;
    if (contactLat != null) data.contactLat = String(contactLat);
    if (contactLng != null) data.contactLng = String(contactLng);
    if (officePhoto) data.officePhoto = officePhoto;
    if (homeVideoUrl !== null) data.homeVideoUrl = homeVideoUrl;
    const cleanedPartners = partners.filter(p => p.phone.trim());
    data.contactPhones = JSON.stringify(cleanedPartners);
    startTransition(async () => {
      const res = await updateSiteSettings(data);
      if (res.success) setSaved(true);
      else setError(res.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      {/* İletişim */}
      <section className="bg-navy-850 border border-[var(--border-subtle)] rounded-xl p-6">
        <h2 className="text-sm font-semibold text-silver-300 uppercase tracking-wider mb-5">İletişim Bilgileri</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label="E-posta" name="contactEmail" type="email" defaultValue={initial?.contactEmail} placeholder="info@ornek.com" />
          <div>
            <label className="text-xs text-silver-400 uppercase tracking-wider mb-1.5 block">
              Ana Telefon
              <span className="ml-1.5 normal-case text-silver-600 tracking-normal">(footer &amp; genel görünüm)</span>
            </label>
            <input name="contactPhone" type="tel" defaultValue={initial?.contactPhone ?? ""}
              placeholder="+90 222 000 00 00"
              className="w-full h-10 px-3 bg-navy-800 border border-[var(--border-subtle)] rounded-xl text-sm text-cream-100 placeholder-silver-600 focus:outline-none focus:border-gold-500/60" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-silver-400 uppercase tracking-wider mb-1.5 block">Adres</label>
            <textarea name="address" rows={2} defaultValue={initial?.address ?? ""}
              placeholder="Açık adres"
              className="w-full px-3 py-2 bg-navy-800 border border-[var(--border-subtle)] rounded-xl text-sm text-cream-100 placeholder-silver-600 focus:outline-none focus:border-gold-500/60 resize-none" />
          </div>
          <InputField label="Çalışma Saatleri" name="workingHours" defaultValue={initial?.workingHours} placeholder="Hft içi 09:00–18:00" />
        </div>
      </section>

      {/* Ortaklar / İletişim Kişileri */}
      <section className="bg-navy-850 border border-[var(--border-subtle)] rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-semibold text-silver-300 uppercase tracking-wider">İletişim Numaraları</h2>
            <p className="text-xs text-silver-500 mt-1">İletişim ve hakkımızda sayfasında gösterilir.</p>
          </div>
          <button
            type="button"
            onClick={addPartner}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-navy-800 border border-[var(--border-subtle)] text-xs text-silver-300 hover:border-gold-500/40 hover:text-gold-400 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Numara Ekle
          </button>
        </div>
        <div className="space-y-4">
          {partners.map((partner, i) => (
            <div key={i} className="bg-navy-800 border border-[var(--border-subtle)] rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-silver-500 font-medium">{i + 1}. Numara</span>
                {partners.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePartner(i)}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    Kaldır
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-silver-400 uppercase tracking-wider mb-1.5 block">Ad Soyad</label>
                  <input
                    type="text"
                    value={partner.name}
                    onChange={e => updatePartner(i, "name", e.target.value)}
                    placeholder="Ahmet Yılmaz"
                    className="w-full h-10 px-3 bg-navy-900 border border-[var(--border-subtle)] rounded-xl text-sm text-cream-100 placeholder-silver-600 focus:outline-none focus:border-gold-500/60"
                  />
                </div>
                <div>
                  <label className="text-xs text-silver-400 uppercase tracking-wider mb-1.5 block">Telefon *</label>
                  <input
                    type="tel"
                    value={partner.phone}
                    onChange={e => updatePartner(i, "phone", e.target.value)}
                    placeholder="+90 5XX XXX XX XX"
                    className="w-full h-10 px-3 bg-navy-900 border border-[var(--border-subtle)] rounded-xl text-sm text-cream-100 placeholder-silver-600 focus:outline-none focus:border-gold-500/60"
                  />
                </div>
                <div>
                  <label className="text-xs text-silver-400 uppercase tracking-wider mb-1.5 block">WhatsApp (opsiyonel)</label>
                  <input
                    type="tel"
                    value={partner.whatsapp ?? ""}
                    onChange={e => updatePartner(i, "whatsapp", e.target.value)}
                    placeholder="+90 5XX XXX XX XX"
                    className="w-full h-10 px-3 bg-navy-900 border border-[var(--border-subtle)] rounded-xl text-sm text-cream-100 placeholder-silver-600 focus:outline-none focus:border-gold-500/60"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* İletişim Haritası */}
      <section className="bg-navy-850 border border-[var(--border-subtle)] rounded-xl p-6">
        <h2 className="text-sm font-semibold text-silver-300 uppercase tracking-wider mb-1">Ofis Konumu</h2>
        <p className="text-xs text-silver-500 mb-4">İletişim sayfasındaki haritada gösterilecek konum.</p>
        <LocationPicker
          lat={contactLat}
          lng={contactLng}
          onChange={(lat, lng) => { setContactLat(lat); setContactLng(lng); }}
        />
      </section>

      {/* Sosyal Medya */}
      <section className="bg-navy-850 border border-[var(--border-subtle)] rounded-xl p-6">
        <h2 className="text-sm font-semibold text-silver-300 uppercase tracking-wider mb-5">Sosyal Medya</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label="Instagram" name="socialInstagram" defaultValue={social.instagram} placeholder="https://instagram.com/..." />
          <InputField label="Facebook" name="socialFacebook" defaultValue={social.facebook} placeholder="https://facebook.com/..." />
          <InputField label="YouTube" name="socialYoutube" defaultValue={social.youtube} placeholder="https://youtube.com/..." />
          <InputField label="WhatsApp (genel sayfa, opsiyonel)" name="socialWhatsapp" defaultValue={social.whatsapp} placeholder="+905xxxxxxxxx" />
          <InputField label="X (Twitter)" name="socialX" defaultValue={social.x} placeholder="https://x.com/..." />
        </div>
      </section>

      {/* Hakkımızda metni */}
      <section className="bg-navy-850 border border-[var(--border-subtle)] rounded-xl p-6">
        <h2 className="text-sm font-semibold text-silver-300 uppercase tracking-wider mb-5">Hakkımızda (TR)</h2>
        <textarea name="aboutTr" rows={6} defaultValue={initial?.aboutTr ?? ""}
          placeholder="Şirket hakkında kısa açıklama (Hakkımızda sayfasında gösterilecek)"
          className="w-full px-3 py-2 bg-navy-800 border border-[var(--border-subtle)] rounded-xl text-sm text-cream-100 placeholder-silver-600 focus:outline-none focus:border-gold-500/60 resize-y" />
      </section>

      {/* Ofis Fotoğrafı */}
      <section className="bg-navy-850 border border-[var(--border-subtle)] rounded-xl p-6">
        <h2 className="text-sm font-semibold text-silver-300 uppercase tracking-wider mb-1">Ofis Fotoğrafı</h2>
        <p className="text-xs text-silver-500 mb-4">Hakkımızda sayfasındaki sol bölümde gösterilir.</p>
        <div className="flex items-start gap-4">
          {/* Önizleme */}
          <div className="w-32 h-24 rounded-xl overflow-hidden bg-navy-800 border border-[var(--border-subtle)] shrink-0 flex items-center justify-center">
            {officePhoto ? (
              <Image src={officePhoto} alt="Ofis fotoğrafı" width={128} height={96} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs text-silver-600">Fotoğraf yok</span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            <button type="button" disabled={photoUploading}
              onClick={() => photoInputRef.current?.click()}
              className="px-4 py-2 rounded-xl bg-navy-800 border border-[var(--border-subtle)] text-sm text-silver-300 hover:border-gold-500/40 hover:text-gold-400 transition-colors disabled:opacity-50">
              {photoUploading ? "Yükleniyor..." : "Fotoğraf Seç"}
            </button>
            {officePhoto && (
              <button type="button" onClick={() => setOfficePhoto(null)}
                className="px-4 py-2 rounded-xl bg-navy-800 border border-red-500/20 text-sm text-red-400 hover:border-red-500/40 transition-colors">
                Kaldır
              </button>
            )}
          </div>
        </div>
      </section>

      {/* İstatistikler */}
      <section className="bg-navy-850 border border-[var(--border-subtle)] rounded-xl p-6">
        <h2 className="text-sm font-semibold text-silver-300 uppercase tracking-wider mb-1">Hakkımızda İstatistikleri</h2>
        <p className="text-xs text-silver-500 mb-4">Sayfadaki 4 kutucuk. Örnek: "15+", "500+", "1.000+", "%98"</p>
        <div className="grid grid-cols-2 gap-4">
          <InputField label="Yıllık Deneyim" name="statYear" defaultValue={initial?.statYear} placeholder="15+" />
          <InputField label="Tamamlanan İşlem" name="statTransactions" defaultValue={initial?.statTransactions} placeholder="500+" />
          <InputField label="Mutlu Müşteri" name="statCustomers" defaultValue={initial?.statCustomers} placeholder="1.000+" />
          <InputField label="Müşteri Memnuniyeti" name="statSatisfaction" defaultValue={initial?.statSatisfaction} placeholder="%98" />
        </div>
      </section>

      {/* Ana Sayfa İçerikleri */}
      <section className="bg-navy-850 border border-[var(--border-subtle)] rounded-xl p-6 space-y-6">
        <h2 className="text-sm font-semibold text-silver-300 uppercase tracking-wider">Ana Sayfa İçerikleri</h2>
        <p className="text-xs text-silver-500 -mt-2">Ana sayfa üst bölüm (Hero) ve öne çıkan ilanlar kısmı için başlık metinleri.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-gold-500 uppercase">Hero Alanı (Türkçe)</h3>
            <InputField label="Üst Başlık (TR)" name="homeHeroOverlineTr" defaultValue={initial?.homeHeroOverlineTr} placeholder="Eskişehir'in Güvenilir Emlak Ofisi" />
            <InputField label="Ana Başlık (TR)" name="homeHeroHeadlineTr" defaultValue={initial?.homeHeroHeadlineTr} placeholder="Hayalindeki Mülkü" />
            <InputField label="Vurgulu Ana Başlık (TR)" name="homeHeroHeadlineAccentTr" defaultValue={initial?.homeHeroHeadlineAccentTr} placeholder="Birlikte Bulalım" />
            <div>
              <label className="text-xs text-silver-400 uppercase tracking-wider mb-1.5 block">Alt Açıklama (TR)</label>
              <textarea name="homeHeroSubTr" rows={3} defaultValue={initial?.homeHeroSubTr ?? ""}
                placeholder="Eskişehir ve çevresinde satılık ve kiralık..."
                className="w-full px-3 py-2 bg-navy-800 border border-[var(--border-subtle)] rounded-xl text-sm text-cream-100 placeholder-silver-600 focus:outline-none focus:border-gold-500/60 resize-y" />
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-gold-500 uppercase">Hero Alanı (İngilizce)</h3>
            <InputField label="Üst Başlık (EN)" name="homeHeroOverlineEn" defaultValue={initial?.homeHeroOverlineEn} placeholder="Eskişehir's Trusted Real Estate" />
            <InputField label="Ana Başlık (EN)" name="homeHeroHeadlineEn" defaultValue={initial?.homeHeroHeadlineEn} placeholder="Find Your Dream Property" />
            <InputField label="Vurgulu Ana Başlık (EN)" name="homeHeroHeadlineAccentEn" defaultValue={initial?.homeHeroHeadlineAccentEn} placeholder="Together" />
            <div>
              <label className="text-xs text-silver-400 uppercase tracking-wider mb-1.5 block">Alt Açıklama (EN)</label>
              <textarea name="homeHeroSubEn" rows={3} defaultValue={initial?.homeHeroSubEn ?? ""}
                placeholder="Find properties in Eskişehir..."
                className="w-full px-3 py-2 bg-navy-800 border border-[var(--border-subtle)] rounded-xl text-sm text-cream-100 placeholder-silver-600 focus:outline-none focus:border-gold-500/60 resize-y" />
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-[var(--border-subtle)] pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-gold-500 uppercase">Öne Çıkanlar Alanı (Türkçe)</h3>
            <InputField label="Üst Başlık (TR)" name="homeFeaturedOverlineTr" defaultValue={initial?.homeFeaturedOverlineTr} placeholder="Seçkin İlanlar" />
            <InputField label="Ana Başlık (TR)" name="homeFeaturedTitleTr" defaultValue={initial?.homeFeaturedTitleTr} placeholder="Öne Çıkan Gayrimenkuller" />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-gold-500 uppercase">Öne Çıkanlar Alanı (İngilizce)</h3>
            <InputField label="Üst Başlık (EN)" name="homeFeaturedOverlineEn" defaultValue={initial?.homeFeaturedOverlineEn} placeholder="Featured Properties" />
            <InputField label="Ana Başlık (EN)" name="homeFeaturedTitleEn" defaultValue={initial?.homeFeaturedTitleEn} placeholder="Premium Real Estate" />
          </div>
        </div>

        <div className="mt-6 border-t border-[var(--border-subtle)] pt-6">
          <h3 className="text-xs font-semibold text-gold-500 uppercase mb-4">Hero Alanı Videosu</h3>
          <p className="text-xs text-silver-500 mb-3">YouTube bağlantısı yapıştırın veya cihazınızdan video yükleyin. Bu video masaüstünde solda, mobilde üstte yer alacaktır.</p>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <input 
              name="homeVideoUrl" 
              value={homeVideoUrl || ""} 
              onChange={e => setHomeVideoUrl(e.target.value)} 
              placeholder="https://www.youtube.com/watch?v=..."
              className="flex-1 w-full h-10 px-3 bg-navy-800 border border-[var(--border-subtle)] rounded-xl text-sm text-cream-100 placeholder-silver-600 focus:outline-none focus:border-gold-500/60"
            />
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs text-silver-500">veya</span>
              <input ref={videoInputRef} type="file" accept="video/mp4,video/webm" className="hidden" onChange={handleVideoUpload} />
              <button type="button" disabled={videoUploading}
                onClick={() => videoInputRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-navy-800 border border-[var(--border-subtle)] text-sm text-silver-300 hover:border-gold-500/40 hover:text-gold-400 transition-colors disabled:opacity-50">
                {videoUploading ? "Yükleniyor..." : "Video Yükle (Max 50MB)"}
              </button>
            </div>
          </div>
          {homeVideoUrl && (
            <div className="mt-3">
              <button type="button" onClick={() => setHomeVideoUrl("")}
                className="text-xs text-red-400 hover:text-red-300 transition-colors">
                Videoyu Kaldır
              </button>
            </div>
          )}
        </div>
      </section>
      {/* Yasal metinler */}
      <section className="bg-navy-850 border border-[var(--border-subtle)] rounded-xl p-6 space-y-6">
        <h2 className="text-sm font-semibold text-silver-300 uppercase tracking-wider">Yasal Metinler</h2>
        <p className="text-xs text-silver-500 -mt-2">Boş bırakılırsa sayfalar varsayılan içeriği gösterir.</p>
        <div>
          <label className="text-xs text-silver-400 uppercase tracking-wider mb-1.5 block">KVKK Aydınlatma Metni</label>
          <textarea name="kvkkText" rows={10} defaultValue={initial?.kvkkText ?? ""}
            placeholder="KVKK metnini buraya girin..."
            className="w-full px-3 py-2 bg-navy-800 border border-[var(--border-subtle)] rounded-xl text-sm text-cream-100 placeholder-silver-600 focus:outline-none focus:border-gold-500/60 resize-y font-mono" />
        </div>
        <div>
          <label className="text-xs text-silver-400 uppercase tracking-wider mb-1.5 block">Gizlilik Politikası</label>
          <textarea name="privacyText" rows={10} defaultValue={initial?.privacyText ?? ""}
            placeholder="Gizlilik politikası metnini buraya girin..."
            className="w-full px-3 py-2 bg-navy-800 border border-[var(--border-subtle)] rounded-xl text-sm text-cream-100 placeholder-silver-600 focus:outline-none focus:border-gold-500/60 resize-y font-mono" />
        </div>
        <div>
          <label className="text-xs text-silver-400 uppercase tracking-wider mb-1.5 block">Kullanım Koşulları</label>
          <textarea name="termsText" rows={10} defaultValue={initial?.termsText ?? ""}
            placeholder="Kullanım koşulları metnini buraya girin..."
            className="w-full px-3 py-2 bg-navy-800 border border-[var(--border-subtle)] rounded-xl text-sm text-cream-100 placeholder-silver-600 focus:outline-none focus:border-gold-500/60 resize-y font-mono" />
        </div>
      </section>

      {/* Kaydet */}
      {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>}
      {saved && <p className="text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">Ayarlar kaydedildi.</p>}

      <button type="submit" disabled={isPending}
        className="px-8 py-3 rounded-full bg-gold-500 text-navy-900 text-sm font-semibold hover:bg-gold-400 transition-colors disabled:opacity-50">
        {isPending ? "Kaydediliyor..." : "Ayarları Kaydet"}
      </button>
    </form>
  );
}
