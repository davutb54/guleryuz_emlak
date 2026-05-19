import { getTranslations } from "next-intl/server";
import { Clock, Camera, Users, Play, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";

export default async function Footer() {
  const t = await getTranslations("footer");
  const nav = await getTranslations("nav");

  const quickLinks = [
    { href: "/ilanlar", label: t("saleListing") },
    { href: "/ilanlar?type=RENT", label: t("rentListing") },
    { href: "/hakkimizda", label: nav("about") },
    { href: "/galeri", label: nav("gallery") },
    { href: "/iletisim", label: nav("contact") },
  ];

  const services = [
    t("saleListing"),
    t("rentListing"),
    t("appraisal"),
    t("consultation"),
  ];

  const contactItems = [
    { icon: MapPin, text: "Eskişehir, Türkiye" },
    { icon: Phone, text: "+90 (222) 000 00 00" },
    { icon: Mail, text: "info@guleryuzgayrimenkul.com" },
    { icon: Clock, text: "Pzt–Cts  09:00 – 18:00" },
  ];

  const socialLinks = [
    { icon: Camera, label: "Instagram", href: "#" },
    { icon: Users, label: "Facebook", href: "#" },
    { icon: Play, label: "YouTube", href: "#" },
  ];

  const legalLinks = [
    { href: "/kvkk", label: t("kvkk") },
    { href: "/gizlilik", label: t("privacy") },
    { href: "/kosullar", label: t("terms") },
  ];

  return (
    <footer className="bg-navy-950 border-t border-[--border-subtle]">
      <div className="mx-auto max-w-[1440px] px-5 py-16 md:px-8 md:py-20 lg:px-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Marka */}
          <div>
            <Link href="/" className="mb-5 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-500">
                <span className="font-display text-lg font-bold text-navy-900 leading-none">G</span>
              </div>
              <div>
                <p className="font-display text-sm font-bold text-cream-50 leading-tight tracking-[0.12em]">
                  GÜLERYÜZ
                </p>
                <p className="mt-0.5 text-[9px] font-sans font-medium uppercase tracking-[0.22em] text-silver-400">
                  GAYRİMENKUL
                </p>
              </div>
            </Link>
            <p className="mb-6 text-sm leading-relaxed text-silver-500">
              {t("description")}
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[--border-subtle] text-silver-400 transition-colors hover:border-gold-500 hover:text-gold-500"
                >
                  <Icon size={15} strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>

          {/* Hızlı Linkler */}
          <div>
            <h4 className="mb-5 text-xs font-semibold uppercase tracking-[0.14em] text-silver-300">
              {t("quickLinks")}
            </h4>
            <ul className="space-y-3">
              {quickLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-silver-500 transition-colors hover:text-gold-400"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hizmetler */}
          <div>
            <h4 className="mb-5 text-xs font-semibold uppercase tracking-[0.14em] text-silver-300">
              {t("services")}
            </h4>
            <ul className="space-y-3">
              {services.map((item) => (
                <li key={item} className="text-sm text-silver-500">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* İletişim */}
          <div>
            <h4 className="mb-5 text-xs font-semibold uppercase tracking-[0.14em] text-silver-300">
              {t("contact")}
            </h4>
            <ul className="space-y-4">
              {contactItems.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3">
                  <Icon
                    size={14}
                    strokeWidth={1.5}
                    className="mt-0.5 shrink-0 text-gold-500"
                  />
                  <span className="text-sm text-silver-500">{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Alt bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[--border-divider] pt-6 sm:flex-row">
          <p className="text-xs text-silver-500">
            © {new Date().getFullYear()} Güleryüz Gayrimenkul.{" "}
            {t("rights")}
          </p>
          <div className="flex items-center gap-5">
            {legalLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-xs text-silver-500 transition-colors hover:text-silver-300"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
