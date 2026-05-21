import HeaderWrapper from "@/components/layout/header-wrapper";
import Footer from "@/components/layout/footer";
import CookieBanner from "@/components/shared/cookie-banner";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <HeaderWrapper />
      <main className="flex-1">{children}</main>
      <Footer />
      <CookieBanner />
    </>
  );
}
