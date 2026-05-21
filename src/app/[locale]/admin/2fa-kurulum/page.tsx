import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import TwoFASetupClient from "./setup-client";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function TwoFASetupPage({ params }: Props) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    redirect(`/${locale}/giris`);
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { twoFactorEnabled: true },
  });

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <h1 className="font-display text-display-md text-cream-50">İki Adımlı Doğrulama</h1>
        <p className="text-silver-500 text-sm mt-1">Hesabınızı TOTP ile ekstra güvence altına alın</p>
      </div>
      <TwoFASetupClient isEnabled={user?.twoFactorEnabled ?? false} />
    </div>
  );
}
