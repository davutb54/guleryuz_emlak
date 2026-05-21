"use client";

import { useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { changeUserRole, toggleBanUser } from "@/lib/actions/user";

interface UserRowActionsProps {
  userId: string;
  currentRole: string;
  banned: boolean;
  isSelf: boolean;
}

const ROLE_OPTIONS = [
  { value: "USER",  label: "Kullanıcı" },
  { value: "AGENT", label: "Agent" },
  { value: "ADMIN", label: "Admin" },
];

export function UserRoleSelect({ userId, currentRole, isSelf }: Omit<UserRowActionsProps, "banned">) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (currentRole === "SUPER_ADMIN") {
    return <span className="text-xs text-gold-500 font-semibold uppercase tracking-wider">SUPER_ADMIN</span>;
  }

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const role = e.target.value;
    startTransition(async () => {
      const res = await changeUserRole(userId, { role });
      if (!res.success) alert(res.error);
      else router.refresh();
    });
  }

  return (
    <select
      value={currentRole}
      onChange={handleChange}
      disabled={isPending || isSelf}
      title={isSelf ? "Kendi rolünüzü değiştiremezsiniz" : undefined}
      className="h-8 px-2 bg-navy-800 border border-[var(--border-subtle)] rounded-lg text-xs text-cream-100 focus:outline-none focus:border-gold-500/60 disabled:opacity-50 [&>option]:bg-navy-800"
    >
      {ROLE_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

export function BanButton({ userId, banned, isSelf }: Omit<UserRowActionsProps, "currentRole">) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick() {
    if (!banned && !confirm("Bu kullanıcı banlanacak. Giriş yapamayacak. Emin misiniz?")) return;
    startTransition(async () => {
      const res = await toggleBanUser(userId);
      if (!res.success) alert(res.error);
      else router.refresh();
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending || isSelf}
      title={isSelf ? "Kendinizi banlayamazsınız" : banned ? "Banı kaldır" : "Banla"}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
        banned
          ? "bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20"
          : "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
      }`}
    >
      {banned ? "Banı Kaldır" : "Banla"}
    </button>
  );
}
