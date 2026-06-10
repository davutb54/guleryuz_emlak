"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import AdminSidebar from "./sidebar";
import { Link } from "@/i18n/navigation";

interface AdminShellProps {
  children: React.ReactNode;
  user: { name?: string | null; email?: string | null; role?: string };
  locale: string;
  pendingSubmissions?: number;
}

export default function AdminShell({ children, user, locale, pendingSubmissions }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-navy-900 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-[rgba(5,14,31,0.75)] backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:z-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <AdminSidebar
          locale={locale}
          user={user}
          onNavigate={() => setSidebarOpen(false)}
          pendingSubmissions={pendingSubmissions}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center h-14 px-4 border-b border-[var(--border-subtle)] bg-navy-950 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Menüyü aç"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-silver-400 hover:text-cream-100 hover:bg-white/5 transition-colors"
          >
            <Menu size={20} />
          </button>
          <Link href="/" className="ml-3 font-display text-gold-500 text-sm font-semibold tracking-wide uppercase hover:text-gold-400 transition-colors">
            Güleryüz Admin
          </Link>
          {sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-auto w-9 h-9 flex items-center justify-center rounded-lg text-silver-400 hover:text-cream-100 hover:bg-white/5 transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-8 min-h-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
