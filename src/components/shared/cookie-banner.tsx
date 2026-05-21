"use client";

import { useState, useEffect } from "react";
import { Cookie, X } from "lucide-react";
import { Link } from "@/i18n/navigation";

const COOKIE_KEY = "guleryuz-cookie-consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem(COOKIE_KEY, "accepted");
    setVisible(false);
  };

  const dismiss = () => {
    localStorage.setItem(COOKIE_KEY, "dismissed");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-md z-40 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-navy-800 border border-navy-600 rounded-2xl p-5 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-gold-500/10 border border-gold-500/20 flex items-center justify-center shrink-0 mt-0.5">
            <Cookie className="w-4 h-4 text-gold-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-sans text-sm font-semibold text-cream-100 mb-1">
              Çerez Kullanımı
            </p>
            <p className="font-sans text-xs text-silver-400 leading-relaxed">
              Sitemiz oturum yönetimi için zorunlu çerezler kullanmaktadır.
              Reklam veya izleme çerezi bulunmamaktadır.{" "}
              <Link
                href="/kvkk"
                className="text-gold-500 hover:text-gold-400 underline underline-offset-2"
              >
                KVKK Aydınlatma Metni
              </Link>
            </p>
          </div>
          <button
            onClick={dismiss}
            className="w-7 h-7 rounded-lg hover:bg-navy-700 flex items-center justify-center text-silver-500 hover:text-silver-300 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={accept}
            className="flex-1 bg-gold-500 hover:bg-gold-400 text-navy-900 font-sans font-semibold text-xs py-2.5 rounded-full transition-colors"
          >
            Kabul Et
          </button>
          <button
            onClick={dismiss}
            className="flex-1 border border-navy-600 hover:border-navy-500 text-silver-400 hover:text-silver-300 font-sans text-xs py-2.5 rounded-full transition-colors"
          >
            Reddet
          </button>
        </div>
      </div>
    </div>
  );
}
