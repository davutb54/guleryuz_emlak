import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { is2FAVerified } from "@/lib/two-factor";
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

  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";

  // AGENT 2FA sayfalarına erişemez
  if (
    session.user.role === "AGENT" &&
    (pathname.includes("/2fa-dogrula") || pathname.includes("/2fa-kurulum"))
  ) {
    redirect(`/${locale}/admin`);
  }

  // ADMIN/SUPER_ADMIN için 2FA zorunlu
  if (TWO_FA_ROLES.includes(session.user.role)) {
    const isOnVerifyPage = pathname.includes("/2fa-dogrula");
    const isOnSetupPage = pathname.includes("/2fa-kurulum");

    if (!isOnVerifyPage && !isOnSetupPage) {
      const dbUser = await db.user.findUnique({
        where: { id: session.user.id },
        select: { twoFactorEnabled: true },
      });
      if (!dbUser?.twoFactorEnabled) {
        // 2FA henüz kurulmamış — kurulum sayfasına yönlendir
        redirect(`/${locale}/admin/2fa-kurulum`);
      } else {
        // 2FA kurulu ama doğrulanmamış — doğrulama sayfasına yönlendir
        const verified = await is2FAVerified(session.user.id);
        if (!verified) {
          redirect(`/${locale}/admin/2fa-dogrula`);
        }
      }
    }
  }

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
