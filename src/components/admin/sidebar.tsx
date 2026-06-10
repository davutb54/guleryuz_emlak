"use client";

import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import {
  LayoutDashboard,
  ListFilter,
  Users,
  MessageSquare,
  Image,
  Settings,
  ClipboardList,
  LogOut,
  ChevronRight,
  Mail,
  Shield,
  Inbox,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  locale: string;
  user: { name?: string | null; email?: string | null; role?: string };
  onNavigate?: () => void;
  pendingSubmissions?: number;
}

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true, roles: ["ADMIN", "SUPER_ADMIN"] },
  { href: "/admin/ilanlar", label: "İlanlar", icon: ListFilter, roles: ["AGENT", "ADMIN", "SUPER_ADMIN"] },
  { href: "/admin/ilan-talepleri", label: "İlan Talepleri", icon: Inbox, roles: ["ADMIN", "SUPER_ADMIN"] },
  { href: "/admin/kullanicilar", label: "Kullanıcılar", icon: Users, roles: ["ADMIN", "SUPER_ADMIN"] },
  { href: "/admin/yorumlar", label: "Yorumlar", icon: MessageSquare, roles: ["ADMIN", "SUPER_ADMIN"] },
  { href: "/admin/galeri", label: "Galeri", icon: Image, roles: ["ADMIN", "SUPER_ADMIN"] },
  { href: "/admin/iletisim", label: "İletişim", icon: Mail, roles: ["ADMIN", "SUPER_ADMIN"] },
  { href: "/admin/ayarlar", label: "Site Ayarları", icon: Settings, roles: ["ADMIN", "SUPER_ADMIN"] },
  { href: "/admin/2fa-kurulum", label: "2FA Güvenlik", icon: Shield, roles: ["ADMIN", "SUPER_ADMIN"] },
  { href: "/admin/audit-log", label: "Denetim Günlüğü", icon: ClipboardList, roles: ["ADMIN", "SUPER_ADMIN"] },
];

export default function AdminSidebar({ user, onNavigate, pendingSubmissions }: SidebarProps) {
  const pathname = usePathname();

  function isActive(href: string, exact = false) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <aside className="w-64 h-full flex flex-col bg-navy-950 border-r border-[var(--border-subtle)] shrink-0">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-[var(--border-subtle)]">
        <Link href="/" className="font-display text-gold-500 font-semibold tracking-wide text-sm uppercase hover:text-gold-400 transition-colors">
          Güleryüz Admin
        </Link>
      </div>

      {/* Navigasyon */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {NAV_ITEMS.filter(({ roles }) => !user.role || roles.includes(user.role)).map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact);
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                    active
                      ? "bg-gold-500/10 text-gold-400 border border-gold-500/20"
                      : "text-cream-300 hover:bg-white/4 hover:text-cream-100"
                  )}
                >
                  <Icon
                    size={16}
                    strokeWidth={1.5}
                    className={active ? "text-gold-500" : "text-silver-500"}
                  />
                  {label}
                  {href === "/admin/ilan-talepleri" && (pendingSubmissions ?? 0) > 0 && (
                    <span className="ml-auto flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-gold-500 text-navy-900 text-[10px] font-bold">
                      {pendingSubmissions}
                    </span>
                  )}
                  {active && href !== "/admin/ilan-talepleri" && (
                    <ChevronRight size={14} className="ml-auto text-gold-500" />
                  )}
                  {active && href === "/admin/ilan-talepleri" && (pendingSubmissions ?? 0) === 0 && (
                    <ChevronRight size={14} className="ml-auto text-gold-500" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Kullanıcı bilgisi */}
      <div className="px-3 py-4 border-t border-[var(--border-subtle)]">
        <div className="px-3 py-2.5 rounded-md bg-navy-800">
          <p className="text-cream-100 text-sm font-medium truncate">
            {user.name}
          </p>
          <p className="text-silver-500 text-xs truncate">{user.email}</p>
          <p className="text-gold-600 text-xs mt-0.5">{user.role}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="mt-2 w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-silver-500 hover:text-cream-100 hover:bg-white/4 transition-colors"
        >
          <LogOut size={14} strokeWidth={1.5} />
          Çıkış Yap
        </button>
      </div>
    </aside>
  );
}
