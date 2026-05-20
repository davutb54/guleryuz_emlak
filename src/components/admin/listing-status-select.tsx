"use client";

import { useTransition } from "react";
import { changeListingStatus } from "@/lib/actions/listing";
import { LISTING_STATUSES } from "@/lib/validations/listing";

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Taslak",
  PENDING: "Beklemede",
  ACTIVE: "Aktif",
  SOLD: "Satıldı",
  RENTED: "Kiralandı",
  ARCHIVED: "Arşivlendi",
};

interface Props {
  id: string;
  currentStatus: string;
}

export default function ListingStatusSelect({ id, currentStatus }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const status = e.target.value;
    startTransition(async () => {
      await changeListingStatus(id, { status });
    });
  }

  return (
    <select
      value={currentStatus}
      onChange={handleChange}
      disabled={isPending}
      className="text-xs bg-navy-800 border border-[var(--border-subtle)] text-cream-100 rounded-md px-2 py-1 focus:outline-none focus:border-gold-500 disabled:opacity-50 cursor-pointer"
    >
      {LISTING_STATUSES.map((s) => (
        <option key={s} value={s}>
          {STATUS_LABELS[s]}
        </option>
      ))}
    </select>
  );
}
