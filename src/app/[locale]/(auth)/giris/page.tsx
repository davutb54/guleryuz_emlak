"use client";

import { useState, useTransition } from "react";
import { Link } from "@/i18n/navigation";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { signIn } from "next-auth/react";
import GoogleSignInButton from "@/components/shared/google-sign-in-button";
import FacebookSignInButton from "@/components/shared/facebook-sign-in-button";

export default function GirisPage() {
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isPending) return;
    setError(null);
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    startTransition(async () => {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("E-posta veya şifre hatalı.");
      } else {
        window.location.href = "/";
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
        <h1 className="font-display text-3xl text-cream-50">Giriş Yap</h1>
        <p className="text-silver-500 text-sm mt-2">Hesabınıza erişin</p>
      </div>

      <div className="bg-navy-850 border border-[rgba(212,167,68,0.15)] rounded-2xl p-8">
        <form onSubmit={handleSubmit} method="post" className="space-y-5">
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
                autoComplete="current-password"
                className="w-full bg-navy-800 border border-[rgba(216,220,228,0.12)] text-cream-100 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-gold-500 placeholder:text-navy-600 transition-colors"
                placeholder="••••••••"
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

          {/* Giriş butonu */}
          <button
            type="submit"
            className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-gold-500 text-navy-900 font-semibold text-sm transition-colors ${isPending ? "opacity-60 cursor-not-allowed pointer-events-none" : "hover:bg-gold-400"}`}
          >
            {isPending ? (
              <span className="w-4 h-4 border-2 border-navy-900/40 border-t-navy-900 rounded-full animate-spin" />
            ) : (
              <LogIn size={16} strokeWidth={2} />
            )}
            {isPending ? "Giriş yapılıyor…" : "Giriş Yap"}
          </button>
        </form>

        {/* Ayırıcı */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-[rgba(216,220,228,0.1)]" />
          <span className="text-xs text-silver-600 uppercase tracking-wider">veya</span>
          <div className="flex-1 h-px bg-[rgba(216,220,228,0.1)]" />
        </div>

        {/* Sosyal medya butonları */}
        <div className="space-y-3">
          <GoogleSignInButton />
          <FacebookSignInButton />
        </div>

        {/* Kayıt linki */}
        <p className="text-center text-silver-500 text-sm mt-6">
          Hesabınız yok mu?{" "}
          <Link href="/kayit" className="text-gold-500 hover:text-gold-400 transition-colors font-medium">
            Kayıt Ol
          </Link>
        </p>
      </div>
    </div>
  );
}
