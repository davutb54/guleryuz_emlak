"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteListing } from "@/lib/actions/listing";
import { useRouter } from "@/i18n/navigation";

interface Props {
  id: string;
  title: string;
}

export default function DeleteListingButton({ id, title }: Props) {
  const [isPending, startTransition] = useTransition();
  const [confirm, setConfirm] = useState(false);
  const router = useRouter();

  function handleClick() {
    if (!confirm) {
      setConfirm(true);
      setTimeout(() => setConfirm(false), 3000);
      return;
    }
    startTransition(async () => {
      const result = await deleteListing(id);
      if (result.success) {
        router.refresh();
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      title={confirm ? `"${title}" silinecek — tekrar tıklayın` : "Sil"}
      className={`p-1.5 rounded-md transition-colors text-sm ${
        confirm
          ? "bg-red-500/15 text-red-400 hover:bg-red-500/25"
          : "text-silver-500 hover:text-red-400 hover:bg-red-500/8"
      } disabled:opacity-50`}
    >
      <Trash2 size={15} strokeWidth={1.5} />
    </button>
  );
}
