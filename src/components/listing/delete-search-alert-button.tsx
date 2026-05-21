"use client";

import { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteSearchAlert } from "@/lib/actions/search-alert";

export default function DeleteSearchAlertButton({ alertId }: { alertId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await deleteSearchAlert(alertId);
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="flex items-center gap-1.5 text-[11px] text-silver-500 hover:text-red-400 transition-colors disabled:opacity-50"
    >
      {isPending ? (
        <Loader2 size={11} className="animate-spin" />
      ) : (
        <Trash2 size={11} />
      )}
      Sil
    </button>
  );
}
