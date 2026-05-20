"use client";

import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { Eye, EyeOff, UserPlus } from "lucide-react";

export default function KayitPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    startTransition(async () => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Kayıt oluşturulurken hata oluştu.");
      } else {
        router.push("/giris");
      }
    });
  }

  return (
    <div className="w-full max-w-md">
      {/* Logo / Marka */}
      <div className="text-center mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600 mb-2">
          Güleryüz Gayrimenkul
        </p>
        <h1 className="font-display text-3xl text-cream-50">Kayıt Ol</h1>
        <p className="text-silver-500 text-sm mt-2">Yeni hesap oluşturun</p>
      </div>

      <div className="bg-navy-850 border border-[rgba(212,167,68,0.15)] rounded-2xl p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Ad Soyad */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-silver-400 mb-2">
              Ad Soyad
            </label>
            <input
              name="name"
              type="text"
              required
              autoComplete="name"
              className="w-full bg-navy-800 border border-[rgba(216,220,228,0.12)] text-cream-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold-500 placeholder:text-navy-600 transition-colors"
              placeholder="Ahmet Yılmaz"
            />
          </div>

          {/* E-posta */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-silver-400 mb-2">
              E-posta
            </label>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full bg-navy-800 border border-[rgba(216,220,228,0.12)] text-cream-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold-500 placeholder:text-navy-600 transition-colors"
              placeholder="ornek@email.com"
            />
          </div>

          {/* Şifre */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-silver-400 mb-2">
              Şifre
            </label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full bg-navy-800 border border-[rgba(216,220,228,0.12)] text-cream-100 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-gold-500 placeholder:text-navy-600 transition-colors"
                placeholder="En az 8 karakter"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-silver-500 hover:text-silver-300 transition-colors"
              >
                {showPassword ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
              </button>
            </div>
          </div>

          {/* Hata mesajı */}
          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Kayıt butonu */}
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-gold-500 text-navy-900 font-semibold text-sm hover:bg-gold-400 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? (
              <span className="w-4 h-4 border-2 border-navy-900/40 border-t-navy-900 rounded-full animate-spin" />
            ) : (
              <UserPlus size={16} strokeWidth={2} />
            )}
            {isPending ? "Kayıt oluşturuluyor…" : "Kayıt Ol"}
          </button>
        </form>

        <p className="text-center text-silver-500 text-sm mt-6">
          Zaten hesabınız var mı?{" "}
          <Link href="/giris" className="text-gold-500 hover:text-gold-400 transition-colors font-medium">
            Giriş Yap
          </Link>
        </p>
      </div>
    </div>
  );
}
