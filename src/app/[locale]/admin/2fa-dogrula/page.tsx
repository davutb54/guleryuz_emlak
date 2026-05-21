"use client";

import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { Shield } from "lucide-react";
import { verify2FALogin } from "@/lib/actions/two-factor";

export default function TwoFAVerifyPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  function handleVerify() {
    if (code.length !== 6) { setError("6 haneli kod giriniz"); return; }
    setError("");
    startTransition(async () => {
      const res = await verify2FALogin(code);
      if (!res.success) { setError(res.error); setCode(""); return; }
      router.replace("/admin");
      router.refresh();
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-950 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gold-500/10 border border-gold-500/20 mb-4">
            <Shield size={24} className="text-gold-500" />
          </div>
          <h1 className="font-display text-display-sm text-cream-50 mb-2">İki Adımlı Doğrulama</h1>
          <p className="text-silver-500 text-sm">
            Kimlik doğrulayıcı uygulamanızdan 6 haneli kodu girin.
          </p>
        </div>

        <div className="bg-navy-850 border border-[var(--border-subtle)] rounded-2xl p-6 space-y-5">
          <div className="flex flex-col items-center gap-4">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
              onKeyDown={e => e.key === "Enter" && handleVerify()}
              placeholder="000000"
              className="w-40 h-14 px-3 text-center text-2xl tracking-[0.6em] bg-navy-800 border border-[var(--border-subtle)] rounded-xl text-cream-100 focus:outline-none focus:border-gold-500/60"
              autoFocus
            />
            {error && <p className="text-sm text-red-400 text-center">{error}</p>}
          </div>

          <button
            onClick={handleVerify}
            disabled={isPending || code.length !== 6}
            className="w-full h-11 rounded-full bg-gold-500 text-navy-900 text-sm font-semibold hover:bg-gold-400 transition-colors disabled:opacity-50"
          >
            {isPending ? "Doğrulanıyor..." : "Doğrula"}
          </button>
        </div>

        <p className="text-center text-xs text-silver-600 mt-6">
          Uygulamayı değiştirdiyseniz yöneticiyle iletişime geçin.
        </p>
      </div>
    </div>
  );
}
