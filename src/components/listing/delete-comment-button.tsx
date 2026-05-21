"use client";

import { useTransition, useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteComment } from "@/lib/actions/comment";

export default function DeleteCommentButton({ commentId }: { commentId: string }) {
  const [isPending, startTransition] = useTransition();
  const [confirm, setConfirm] = useState(false);

  const handleClick = () => {
    if (!confirm) {
      setConfirm(true);
      setTimeout(() => setConfirm(false), 3000);
      return;
    }
    startTransition(() => deleteComment(commentId));
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      title={confirm ? "Silmek için tekrar tıkla" : "Yorumu sil"}
      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors disabled:opacity-50 ${
        confirm
          ? "bg-red-500/20 text-red-300 border-red-500/30"
          : "bg-transparent text-silver-500 border-navy-700 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20"
      }`}
    >
      <Trash2 size={12} strokeWidth={1.5} />
      {isPending ? "Siliniyor…" : confirm ? "Emin misin?" : "Sil"}
    </button>
  );
}
