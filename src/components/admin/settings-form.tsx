"use client";

import { useState, useTransition } from "react";
import { updateSiteSettings } from "@/lib/actions/settings";

interface SocialLinks {
  instagram?: string | null;
  facebook?: string | null;
  youtube?: string | null;
  whatsapp?: string | null;
  x?: string | null;
}

interface InitialData {
  contactEmail: string;
  contactPhone: string;
  address: string;
  workingHours: string;
  aboutTr?: string | null;
  socialLinks?: string | null;
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

export default function SettingsForm({ initial }: { initial?: InitialData | null }) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  let social: SocialLinks = {};
  try { social = initial?.socialLinks ? JSON.parse(initial.socialLinks) : {}; } catch {}

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaved(false); setError("");
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd.entries());
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
          <InputField label="Telefon" name="contactPhone" defaultValue={initial?.contactPhone} placeholder="+90 222 000 00 00" />
          <div className="sm:col-span-2">
            <label className="text-xs text-silver-400 uppercase tracking-wider mb-1.5 block">Adres</label>
            <textarea name="address" rows={2} defaultValue={initial?.address ?? ""}
              placeholder="Açık adres"
              className="w-full px-3 py-2 bg-navy-800 border border-[var(--border-subtle)] rounded-xl text-sm text-cream-100 placeholder-silver-600 focus:outline-none focus:border-gold-500/60 resize-none" />
          </div>
          <InputField label="Çalışma Saatleri" name="workingHours" defaultValue={initial?.workingHours} placeholder="Hft içi 09:00–18:00" />
        </div>
      </section>

      {/* Sosyal Medya */}
      <section className="bg-navy-850 border border-[var(--border-subtle)] rounded-xl p-6">
        <h2 className="text-sm font-semibold text-silver-300 uppercase tracking-wider mb-5">Sosyal Medya</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label="Instagram" name="socialInstagram" defaultValue={social.instagram} placeholder="https://instagram.com/..." />
          <InputField label="Facebook" name="socialFacebook" defaultValue={social.facebook} placeholder="https://facebook.com/..." />
          <InputField label="YouTube" name="socialYoutube" defaultValue={social.youtube} placeholder="https://youtube.com/..." />
          <InputField label="WhatsApp (numara)" name="socialWhatsapp" defaultValue={social.whatsapp} placeholder="+905xxxxxxxxx" />
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
