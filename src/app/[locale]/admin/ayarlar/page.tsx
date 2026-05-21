import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import SettingsForm from "@/components/admin/settings-form";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function AdminAyarlarPage({ params }: Props) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    redirect(`/${locale}/giris`);
  }

  const settings = await db.siteSettings.findUnique({ where: { id: 1 } });

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-display-md text-cream-50">Site Ayarları</h1>
        <p className="text-silver-500 text-sm mt-1">İletişim bilgileri, sosyal medya ve hakkımızda içeriği</p>
      </div>
      <SettingsForm initial={settings} />
    </div>
  );
}
