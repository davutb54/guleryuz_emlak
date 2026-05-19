"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/ilanlar" as const, key: "listings" },
  { href: "/hakkimizda" as const, key: "about" },
  { href: "/galeri" as const, key: "gallery" },
  { href: "/iletisim" as const, key: "contact" },
];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3 shrink-0">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-500">
        <span className="font-display text-lg font-bold text-navy-900 leading-none">G</span>
      </div>
      <div className="hidden sm:block">
        <p className="font-display text-sm font-bold text-cream-50 leading-tight tracking-[0.12em]">
          GÜLERYÜZ
        </p>
        <p className="text-[9px] font-sans font-medium text-silver-400 tracking-[0.22em] uppercase mt-0.5">
          GAYRİMENKUL
        </p>
      </div>
    </Link>
  );
}

export default function Header() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[--border-subtle] bg-navy-900/85 backdrop-blur-[20px] backdrop-saturate-150">
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-5 md:px-8 lg:px-16">
        <Logo />

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7 lg:gap-9">
          {NAV_LINKS.map(({ href, key }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative text-sm font-medium transition-colors duration-200",
                  "after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full",
                  "after:origin-left after:bg-gold-500 after:transition-transform after:duration-200",
                  active
                    ? "text-gold-500 after:scale-x-100"
                    : "text-cream-100 after:scale-x-0 hover:text-gold-500 hover:after:scale-x-100"
                )}
              >
                {t(key as Parameters<typeof t>[0])}
              </Link>
            );
          })}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/giris"
            className="rounded-full border border-gold-500 px-5 py-2 text-sm font-medium text-gold-500 transition-all duration-200 hover:bg-gold-500/10"
          >
            {t("login")}
          </Link>
          <Link
            href="/iletisim"
            className="rounded-full bg-gold-500 px-5 py-2 text-sm font-semibold text-navy-900 transition-all duration-200 hover:bg-gold-400 hover:-translate-y-px shadow-glow-sm"
          >
            {t("contact")}
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Menüyü aç/kapat"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-cream-100 transition-colors hover:bg-white/5 md:hidden"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="absolute inset-x-0 top-full border-b border-[--border-subtle] bg-navy-900 px-5 pb-6 pt-3 md:hidden animate-fade-up">
          <nav className="flex flex-col gap-0.5">
            {NAV_LINKS.map(({ href, key }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-4 py-3 text-base font-medium text-cream-100 transition-colors hover:bg-white/5 hover:text-gold-500"
              >
                {t(key as Parameters<typeof t>[0])}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2 border-t border-[--border-divider] pt-4">
            <Link
              href="/giris"
              onClick={() => setOpen(false)}
              className="rounded-full border border-gold-500 py-2.5 text-center text-sm font-medium text-gold-500"
            >
              {t("login")}
            </Link>
            <Link
              href="/iletisim"
              onClick={() => setOpen(false)}
              className="rounded-full bg-gold-500 py-2.5 text-center text-sm font-semibold text-navy-900"
            >
              {t("contact")}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
