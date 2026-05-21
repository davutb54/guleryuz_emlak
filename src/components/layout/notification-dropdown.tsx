"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { Bell, X, Check, ExternalLink } from "lucide-react";
import { markAllNotificationsRead, markNotificationRead } from "@/lib/actions/notification";
import { useRouter } from "@/i18n/navigation";

interface Notification {
  id: string;
  titleTr: string;
  body: string;
  link: string | null;
  read: boolean;
  createdAt: Date;
}

interface NotificationDropdownProps {
  notifications: Notification[];
  unreadCount: number;
}

export default function NotificationDropdown({
  notifications,
  unreadCount: initialUnread,
}: NotificationDropdownProps) {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(initialUnread);
  const [localNotifs, setLocalNotifs] = useState(notifications);
  const [isPending, startTransition] = useTransition();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Dışarı tıklayınca kapat
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleMarkAll() {
    startTransition(async () => {
      await markAllNotificationsRead();
      setLocalNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnread(0);
    });
  }

  function handleClickNotif(notif: Notification) {
    if (!notif.read) {
      startTransition(async () => {
        await markNotificationRead(notif.id);
        setLocalNotifs((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
        );
        setUnread((prev) => Math.max(0, prev - 1));
      });
    }
    if (notif.link) {
      setOpen(false);
      router.push(notif.link as "/");
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Zil ikonu */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Bildirimler"
        className="relative w-10 h-10 rounded-full flex items-center justify-center text-cream-200 hover:text-gold-400 hover:bg-navy-800/60 transition-all"
      >
        <Bell size={18} strokeWidth={1.5} />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-gold-500 text-navy-900 text-[9px] font-bold flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-12 w-80 bg-navy-850 border border-[rgba(212,167,68,0.18)] rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] z-50 overflow-hidden">
          {/* Başlık */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(216,220,228,0.06)]">
            <h3 className="text-sm font-semibold text-cream-100">Bildirimler</h3>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button
                  onClick={handleMarkAll}
                  disabled={isPending}
                  className="flex items-center gap-1 text-xs text-silver-500 hover:text-cream-100 transition-colors"
                >
                  <Check size={12} />
                  Tümünü okundu say
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="text-silver-600 hover:text-cream-100 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Liste */}
          <div className="max-h-80 overflow-y-auto">
            {localNotifs.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell size={24} strokeWidth={1} className="text-navy-700 mx-auto mb-2" />
                <p className="text-silver-600 text-sm">Bildirim yok.</p>
              </div>
            ) : (
              localNotifs.map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => handleClickNotif(notif)}
                  className={`w-full text-left flex items-start gap-3 px-4 py-3 border-b border-[rgba(216,220,228,0.04)] hover:bg-navy-800/60 transition-colors last:border-0 ${
                    !notif.read ? "bg-gold-500/5" : ""
                  }`}
                >
                  {/* Okunmadı göstergesi */}
                  <div className="mt-1.5 shrink-0">
                    {!notif.read ? (
                      <div className="w-2 h-2 rounded-full bg-gold-500" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-transparent" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-cream-100 text-sm font-medium line-clamp-1">
                      {notif.titleTr}
                    </p>
                    <p className="text-silver-500 text-xs line-clamp-2 mt-0.5">{notif.body}</p>
                    <p className="text-silver-600 text-[10px] mt-1">
                      {new Date(notif.createdAt).toLocaleDateString("tr-TR", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {notif.link && (
                    <ExternalLink size={12} strokeWidth={1.5} className="text-silver-600 shrink-0 mt-1" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
