"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { CheckCircle, XCircle, Trash2 } from "lucide-react";
import { approveListingSubmission, rejectListingSubmission, deleteListingSubmission } from "@/lib/actions/listing-submission";

export default function SubmissionActions({ submissionId }: { submissionId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "reject" | "delete" | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleApprove() {
    setLoading("approve");
    setError(null);
    const result = await approveListingSubmission(submissionId);
    setLoading(null);
    if (result.success && result.data) {
      router.push(`/admin/ilanlar`);
    } else if (!result.success) {
      setError(result.error);
    }
  }

  async function handleReject() {
    setLoading("reject");
    setError(null);
    const result = await rejectListingSubmission(submissionId, rejectNote || undefined);
    setLoading(null);
    if (result.success) {
      router.push("/admin/ilan-talepleri");
    } else {
      setError(result.error);
    }
  }

  async function handleDelete() {
    if (!confirm("Bu talep kalıcı olarak silinecek. Emin misiniz?")) return;
    setLoading("delete");
    const result = await deleteListingSubmission(submissionId);
    setLoading(null);
    if (result.success) {
      router.push("/admin/ilan-talepleri");
    } else if (!result.success) {
      setError(result.error);
    }
  }

  return (
    <div className="bg-navy-900 border border-[var(--border-subtle)] rounded-xl p-5 space-y-3">
      <h2 className="text-xs font-semibold text-silver-400 uppercase tracking-wider">
        Aksiyonlar
      </h2>

      {error && (
        <p className="text-red-400 text-xs bg-red-500/10 p-2 rounded-lg">{error}</p>
      )}

      <button
        onClick={handleApprove}
        disabled={loading !== null}
        className="w-full flex items-center justify-center gap-2 h-10 rounded-xl bg-green-600 hover:bg-green-500 text-white text-sm font-semibold transition-colors disabled:opacity-60"
      >
        <CheckCircle size={15} strokeWidth={2} />
        {loading === "approve" ? "Onaylanıyor..." : "Onayla ve İlanı Yayınla"}
      </button>

      {!showRejectForm ? (
        <button
          onClick={() => setShowRejectForm(true)}
          disabled={loading !== null}
          className="w-full flex items-center justify-center gap-2 h-10 rounded-xl bg-red-600/80 hover:bg-red-600 text-white text-sm font-semibold transition-colors disabled:opacity-60"
        >
          <XCircle size={15} strokeWidth={2} />
          Reddet
        </button>
      ) : (
        <div className="space-y-2">
          <textarea
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            placeholder="Red gerekçesi (opsiyonel)..."
            rows={3}
            className="w-full px-3 py-2 bg-navy-800 border border-[var(--border-subtle)] rounded-xl text-sm text-cream-100 placeholder-silver-600 focus:outline-none focus:border-red-500/60 resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={handleReject}
              disabled={loading !== null}
              className="flex-1 h-9 rounded-xl bg-red-600/80 hover:bg-red-600 text-white text-sm font-semibold transition-colors disabled:opacity-60"
            >
              {loading === "reject" ? "Reddediliyor..." : "Reddet"}
            </button>
            <button
              onClick={() => setShowRejectForm(false)}
              className="h-9 px-4 rounded-xl border border-[var(--border-subtle)] text-silver-400 text-sm hover:text-cream-100 transition-colors"
            >
              İptal
            </button>
          </div>
        </div>
      )}

      <button
        onClick={handleDelete}
        disabled={loading !== null}
        className="w-full flex items-center justify-center gap-2 h-9 rounded-xl border border-[var(--border-subtle)] text-silver-500 hover:text-red-400 hover:border-red-500/40 text-sm transition-colors disabled:opacity-60"
      >
        <Trash2 size={13} strokeWidth={1.5} />
        {loading === "delete" ? "Siliniyor..." : "Talebi Sil"}
      </button>
    </div>
  );
}
