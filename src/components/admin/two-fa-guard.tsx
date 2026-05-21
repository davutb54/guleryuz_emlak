"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import AdminShell from "./admin-shell";

interface Props {
  children: React.ReactNode;
  isVerified: boolean;
  twoFAEnabled: boolean;
  locale: string;
  user: { name?: string | null; email?: string | null; role?: string };
}

function Spinner({ to }: { to: string }) {
  useEffect(() => {
    window.location.replace(to);
  }, [to]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-950">
      <div className="w-8 h-8 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
    </div>
  );
}

export default function TwoFAGuard({ children, isVerified, twoFAEnabled, locale, user }: Props) {
  const pathname = usePathname();
  const isOn2FAPage =
    pathname.includes("/2fa-dogrula") || pathname.includes("/2fa-kurulum");

  // 2FA sayfalarında tam ekran — sidebar yok
  if (isOn2FAPage) {
    return <>{children}</>;
  }

  // 2FA kurulmamış → kurulum sayfasına yönlendir
  if (!twoFAEnabled) {
    return <Spinner to={`/${locale}/admin/2fa-kurulum`} />;
  }

  // 2FA kurulu ama doğrulanmamış → doğrulama sayfasına yönlendir
  if (!isVerified) {
    return <Spinner to={`/${locale}/admin/2fa-dogrula`} />;
  }

  // Her şey tamam — AdminShell ile render et
  return (
    <AdminShell locale={locale} user={user}>
      {children}
    </AdminShell>
  );
}
