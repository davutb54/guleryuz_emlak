"use client";

import { useState, useTransition } from "react";
import { Check, Pencil, X } from "lucide-react";
import { updateSelfProfile } from "@/lib/actions/user";

interface Props {
  name: string;
  phone: string | null;
  avatar: string | null;
}

export default function ProfileEditForm({ name, phone, avatar }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ name, phone: phone ?? "" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateSelfProfile({ ...form, avatar: avatar ?? "" });
      if (!result.success) {
        setError(result.error);
      } else {
        setSaved(true);
        setTimeout(() => setOpen(false), 700);
      }
    });
  }

  return (
    <>
      <button
        onClick={() => { setOpen(true); setSaved(false); setError(null); }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--border-subtle)] text-silver-400 hover:text-cream-100 hover:border-silver-500 text-xs font-medium transition-colors"
      >
        <Pencil size={12} strokeWidth={1.5} />
        Profili Düzenle
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
          <div className="bg-navy-800 border border-navy-700 rounded-2xl w-full max-w-sm p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-lg text-cream-50">Profil Bilgileri</h3>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-navy-700 flex items-center justify-center text-silver-500"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-silver-400 uppercase tracking-wider mb-1.5">
                  Ad Soyad <span className="text-red-400">*</span>
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  minLength={2}
                  maxLength={100}
                  className="w-full bg-navy-900 border border-navy-600 focus:border-gold-500 rounded-xl px-3 py-2.5 text-cream-100 text-sm outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs text-silver-400 uppercase tracking-wider mb-1.5">
                  Telefon
                </label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+90 5xx xxx xx xx"
                  maxLength={30}
                  className="w-full bg-navy-900 border border-navy-600 focus:border-gold-500 rounded-xl px-3 py-2.5 text-cream-100 text-sm outline-none transition-colors"
                />
              </div>

              {error && (
                <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                  {error}
                </p>
              )}
              {saved && (
                <p className="text-green-400 text-xs bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2">
                  Kaydedildi!
                </p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 border border-navy-600 text-silver-400 py-2.5 rounded-full text-sm hover:border-navy-500 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 bg-gold-500 hover:bg-gold-400 disabled:opacity-60 text-navy-900 font-semibold py-2.5 rounded-full text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Check size={14} />
                  {isPending ? "Kaydediliyor…" : "Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
