import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { is2FAVerified } from "@/lib/two-factor";
import TwoFAGuard from "@/components/admin/two-fa-guard";
import AdminShell from "@/components/admin/admin-shell";

const ALLOWED_ROLES = ["AGENT", "ADMIN", "SUPER_ADMIN"];
const TWO_FA_ROLES = ["ADMIN", "SUPER_ADMIN"];

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect(`/${locale}/giris`);
  }

  if (!ALLOWED_ROLES.includes(session.user.role)) {
    redirect(`/${locale}`);
  }

  // AGENT — 2FA zorunlu değil, doğrudan AdminShell
  if (!TWO_FA_ROLES.includes(session.user.role)) {
    return (
      <AdminShell
        locale={locale}
        user={{
          name: session.user.name,
          email: session.user.email,
          role: session.user.role,
        }}
      >
        {children}
      </AdminShell>
    );
  }

  // ADMIN / SUPER_ADMIN — 2FA durumunu DB'den oku
  const dbUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: { twoFactorEnabled: true },
  });

  const twoFAEnabled = dbUser?.twoFactorEnabled ?? false;
  const isVerified = twoFAEnabled ? await is2FAVerified(session.user.id) : false;

  return (
    <TwoFAGuard
      locale={locale}
      isVerified={isVerified}
      twoFAEnabled={twoFAEnabled}
      user={{
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
      }}
    >
      {children}
    </TwoFAGuard>
  );
}
