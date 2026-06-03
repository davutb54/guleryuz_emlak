"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Menu, X, UserCircle2, LogOut, LayoutDashboard } from "lucide-react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import NotificationDropdown from "./notification-dropdown";

const NAV_LINKS = [
  { href: "/ilanlar" as const, key: "listings" },
  { href: "/hakkimizda" as const, key: "about" },
  { href: "/galeri" as const, key: "gallery" },
  { href: "/iletisim" as const, key: "contact" },
];

interface Notification {
  id: string;
  titleTr: string;
  body: string;
  link: string | null;
  read: boolean;
  createdAt: Date;
}

const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN", "AGENT"];

interface HeaderProps {
  user: { id: string; name?: string | null; email?: string | null; role?: string | null } | null;
  notifications: Notification[];
  unreadCount: number;
}

function Logo() {
  return (
    <Link href="/" className="shrink-0 flex items-center gap-3">
      <Image
        src="/brand/logo.svg"
        alt="Güleryüz Gayrimenkul"
        width={72}
        height={72}
        className="h-16 w-16 object-contain"
        priority
      />
      <div className="flex flex-col leading-tight">
        <span className="text-cream-100 font-semibold text-sm tracking-wide">Güleryüz Emlak</span>
        <span className="text-gold-500 font-medium text-xs tracking-widest uppercase">Gayrimenkul</span>
      </div>
    </Link>
  );
}

function LocaleSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(next: string) {
    router.replace(pathname, { locale: next });
  }

  return (
    <div className={cn("flex items-center gap-0.5 rounded-full border border-[--border-subtle] px-1 py-0.5", className)}>
      {(["tr", "en"] as const).map((l) => (
        <button
          key={l}
          onClick={() => switchLocale(l)}
          className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider transition-colors",
            locale === l
              ? "bg-gold-500 text-navy-900"
              : "text-silver-400 hover:text-cream-100"
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

export default function Header({ user, notifications, unreadCount }: HeaderProps) {
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

        {/* Desktop sağ aksiyonlar */}
        <div className="hidden md:flex items-center gap-2">
          <LocaleSwitcher />
          {user ? (
            <>
              {user.role && ADMIN_ROLES.includes(user.role) && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold-500/10 border border-gold-500/20 text-gold-400 hover:bg-gold-500/20 text-xs font-medium transition-colors"
                >
                  <LayoutDashboard size={13} strokeWidth={1.5} />
                  Panel
                </Link>
              )}
              <NotificationDropdown
                notifications={notifications}
                unreadCount={unreadCount}
              />
              <Link
                href="/profil"
                aria-label="Profilim"
                className="w-10 h-10 rounded-full flex items-center justify-center text-cream-200 hover:text-gold-400 hover:bg-navy-800/60 transition-all"
              >
                <UserCircle2 size={20} strokeWidth={1.5} />
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                aria-label="Çıkış Yap"
                className="w-10 h-10 rounded-full flex items-center justify-center text-silver-400 hover:text-red-400 hover:bg-navy-800/60 transition-all"
              >
                <LogOut size={18} strokeWidth={1.5} />
              </button>
            </>
          ) : (
            <>
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
            </>
          )}
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
          <div className="mt-3 flex justify-center">
            <LocaleSwitcher />
          </div>
          <div className="mt-4 flex flex-col gap-2 border-t border-[--border-divider] pt-4">
            {user ? (
              <>
                {user.role && ADMIN_ROLES.includes(user.role) && (
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="rounded-full border border-gold-500/30 py-2.5 text-center text-sm font-medium text-gold-400 flex items-center justify-center gap-2"
                  >
                    <LayoutDashboard size={15} strokeWidth={1.5} />
                    Yönetim Paneli
                  </Link>
                )}
                <Link
                  href="/profil"
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-gold-500/40 py-2.5 text-center text-sm font-medium text-gold-500"
                >
                  Profilim
                </Link>
                <button
                  onClick={() => { setOpen(false); signOut({ callbackUrl: "/" }); }}
                  className="rounded-full border border-red-500/30 py-2.5 text-center text-sm font-medium text-red-400 flex items-center justify-center gap-2"
                >
                  <LogOut size={15} strokeWidth={1.5} />
                  Çıkış Yap
                </button>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
