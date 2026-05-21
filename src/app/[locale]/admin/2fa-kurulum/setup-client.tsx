"use client";

import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import Image from "next/image";
import { ShieldCheck, ShieldOff, QrCode, AlertTriangle } from "lucide-react";
import { initiate2FASetup, confirm2FASetup, disable2FA } from "@/lib/actions/two-factor";

interface Props {
  isEnabled: boolean;
}

type Step = "idle" | "scanning" | "confirming" | "done" | "disabling";

export default function TwoFASetupClient({ isEnabled }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<Step>(isEnabled ? "idle" : "idle");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [secretBase32, setSecretBase32] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [enabled, setEnabled] = useState(isEnabled);

  function handleInitiate() {
    setError("");
    startTransition(async () => {
      const res = await initiate2FASetup();
      if (!res.success) { setError(res.error); return; }
      setQrDataUrl(res.qrDataUrl);
      setSecretBase32(res.secretBase32);
      setStep("scanning");
    });
  }

  function handleConfirmSetup() {
    if (code.length !== 6) { setError("6 haneli kod giriniz"); return; }
    setError("");
    startTransition(async () => {
      const res = await confirm2FASetup(code);
      if (!res.success) { setError(res.error); setCode(""); return; }
      setEnabled(true);
      setStep("done");
      router.refresh();
    });
  }

  function handleDisable() {
    if (code.length !== 6) { setError("6 haneli kod giriniz"); return; }
    setError("");
    startTransition(async () => {
      const res = await disable2FA(code);
      if (!res.success) { setError(res.error); setCode(""); return; }
      setEnabled(false);
      setStep("idle");
      setCode("");
      router.refresh();
    });
  }

  // --- Status badge ---
  const StatusBadge = () => (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${
      enabled
        ? "bg-green-500/10 border-green-500/20 text-green-400"
        : "bg-silver-500/10 border-silver-500/20 text-silver-400"
    }`}>
      {enabled ? <ShieldCheck size={14} /> : <ShieldOff size={14} />}
      {enabled ? "2FA Etkin" : "2FA Devre Dışı"}
    </div>
  );

  // --- Disable flow ---
  if (enabled && step === "disabling") {
    return (
      <div className="bg-navy-850 border border-red-500/20 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3 text-red-400">
          <AlertTriangle size={18} />
          <h2 className="font-semibold">2FA Devre Dışı Bırakılıyor</h2>
        </div>
        <p className="text-sm text-silver-400">Kimlik doğrulayıcı uygulamanızdan 6 haneli kodu girin.</p>
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
          placeholder="000000"
          className="w-32 h-12 px-3 text-center text-xl tracking-[0.5em] bg-navy-800 border border-[var(--border-subtle)] rounded-xl text-cream-100 focus:outline-none focus:border-red-500/60"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex gap-3">
          <button onClick={handleDisable} disabled={isPending}
            className="px-6 py-2.5 rounded-full bg-red-600 text-white text-sm font-semibold hover:bg-red-500 transition-colors disabled:opacity-50">
            {isPending ? "İşleniyor..." : "2FA'yı Kapat"}
          </button>
          <button onClick={() => { setStep("idle"); setCode(""); setError(""); }}
            className="px-6 py-2.5 rounded-full border border-[var(--border-subtle)] text-silver-400 text-sm hover:text-cream-100 transition-colors">
            İptal
          </button>
        </div>
      </div>
    );
  }

  // --- Idle / enabled state ---
  if (step === "idle" || step === "done") {
    return (
      <div className="space-y-5">
        <div className="bg-navy-850 border border-[var(--border-subtle)] rounded-xl p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-cream-100 font-semibold mb-1">Durum</h2>
              <p className="text-silver-500 text-sm mb-4">
                {enabled
                  ? "İki adımlı doğrulama hesabınız için etkinleştirilmiştir."
                  : "İki adımlı doğrulama henüz etkin değil. Google Authenticator veya Authy ile kurabilirsiniz."
                }
              </p>
              <StatusBadge />
            </div>
          </div>
        </div>

        {!enabled && (
          <button onClick={handleInitiate} disabled={isPending}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-gold-500 text-navy-900 text-sm font-semibold hover:bg-gold-400 transition-colors disabled:opacity-50">
            <QrCode size={16} />
            {isPending ? "Hazırlanıyor..." : "2FA Kurulumunu Başlat"}
          </button>
        )}

        {enabled && (
          <button onClick={() => { setStep("disabling"); setCode(""); setError(""); }}
            className="flex items-center gap-2 px-6 py-3 rounded-full border border-red-500/30 text-red-400 text-sm font-semibold hover:bg-red-500/10 transition-colors">
            <ShieldOff size={16} />
            2FA Devre Dışı Bırak
          </button>
        )}
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    );
  }

  // --- Scanning (QR visible) ---
  if (step === "scanning") {
    return (
      <div className="space-y-6">
        <div className="bg-navy-850 border border-[var(--border-subtle)] rounded-xl p-6">
          <h2 className="text-cream-100 font-semibold mb-1">Adım 1 — QR Kodu Tarayın</h2>
          <p className="text-silver-500 text-sm mb-5">
            Google Authenticator veya Authy uygulamasını açın ve aşağıdaki QR kodu tarayın.
          </p>
          {qrDataUrl && (
            <div className="inline-block p-3 bg-[#F5F1E8] rounded-xl mb-4">
              <Image src={qrDataUrl} alt="2FA QR Kodu" width={240} height={240} />
            </div>
          )}
          <details className="mt-2">
            <summary className="text-xs text-silver-600 cursor-pointer hover:text-silver-400 transition-colors">
              QR tarayamıyor musunuz? Manuel giriş
            </summary>
            <code className="block mt-2 text-xs text-gold-400 bg-navy-900 px-3 py-2 rounded-lg break-all">
              {secretBase32}
            </code>
          </details>
        </div>

        <div className="bg-navy-850 border border-[var(--border-subtle)] rounded-xl p-6">
          <h2 className="text-cream-100 font-semibold mb-1">Adım 2 — Kodu Doğrulayın</h2>
          <p className="text-silver-500 text-sm mb-4">
            Uygulamanızda oluşturulan 6 haneli kodu girin.
          </p>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
            onKeyDown={e => e.key === "Enter" && handleConfirmSetup()}
            placeholder="000000"
            className="w-32 h-12 px-3 text-center text-xl tracking-[0.5em] bg-navy-800 border border-[var(--border-subtle)] rounded-xl text-cream-100 focus:outline-none focus:border-gold-500/60 mb-4"
            autoFocus
          />
          {error && <p className="text-sm text-red-400 mb-3">{error}</p>}
          <div className="flex gap-3">
            <button onClick={handleConfirmSetup} disabled={isPending || code.length !== 6}
              className="px-6 py-2.5 rounded-full bg-gold-500 text-navy-900 text-sm font-semibold hover:bg-gold-400 transition-colors disabled:opacity-50">
              {isPending ? "Doğrulanıyor..." : "Kurulumu Tamamla"}
            </button>
            <button onClick={() => { setStep("idle"); setCode(""); setError(""); }}
              className="px-6 py-2.5 rounded-full border border-[var(--border-subtle)] text-silver-400 text-sm hover:text-cream-100 transition-colors">
              İptal
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
