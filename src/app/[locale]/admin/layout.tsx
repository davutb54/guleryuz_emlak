import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AdminSidebar from "@/components/admin/sidebar";

const ALLOWED_ROLES = ["AGENT", "ADMIN", "SUPER_ADMIN"];

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

  return (
    <div className="flex h-screen bg-navy-900 overflow-hidden">
      <AdminSidebar
        locale={locale}
        user={{
          name: session.user.name,
          email: session.user.email,
          role: session.user.role,
        }}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 min-h-full">{children}</div>
      </main>
    </div>
  );
}
