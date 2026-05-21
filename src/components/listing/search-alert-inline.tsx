"use client";

import { useState, useTransition } from "react";
import { Bell, Check, Loader2, X } from "lucide-react";
import { createSearchAlert } from "@/lib/actions/search-alert";
import type { FilterState } from "@/lib/filter-utils";

const CATEGORY_LABELS: Record<string, string> = {
  HOUSE: "Daire/Ev",
  LAND: "Arsa",
  FIELD: "Tarla",
  SHOP: "Dükkan",
};
const TYPE_LABELS: Record<string, string> = {
  SALE: "Satılık",
  RENT: "Kiralık",
};

function buildAutoName(filters: Partial<FilterState>): string {
  const parts: string[] = [];
  if (filters.districts && filters.districts.length > 0)
    parts.push(filters.districts.join(", "));
  if (filters.type) parts.push(TYPE_LABELS[filters.type] ?? filters.type);
  if (filters.rooms && filters.rooms.length > 0)
    parts.push(filters.rooms.join("/"));
  if (filters.category)
    parts.push(CATEGORY_LABELS[filters.category] ?? filters.category);
  return parts.length > 0 ? parts.join(" ") : "Arama Alarmı";
}

function buildAlertFilters(filters: FilterState) {
  return {
    ...(filters.category ? { category: filters.category } : {}),
    ...(filters.type ? { type: filters.type } : {}),
    ...(filters.districts.length > 0
      ? { districts: filters.districts }
      : {}),
    ...(filters.rooms.length > 0 ? { rooms: filters.rooms } : {}),
    ...(filters.minPrice != null ? { minPrice: filters.minPrice } : {}),
    ...(filters.maxPrice != null ? { maxPrice: filters.maxPrice } : {}),
  };
}

interface SearchAlertInlineProps {
  filters: FilterState;
}

export default function SearchAlertInline({ filters }: SearchAlertInlineProps) {
  const [saved, setSaved] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [frequency, setFrequency] = useState<"daily" | "weekly">("daily");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (dismissed) return null;

  const autoName = buildAutoName(filters);

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const res = await createSearchAlert({
        name: autoName,
        filters: buildAlertFilters(filters),
        frequency,
      });
      if (res.error) {
        setError(res.error);
      } else {
        setSaved(true);
      }
    });
  }

  if (saved) {
    return (
      <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-green-500/8 border border-green-500/20">
        <div className="w-8 h-8 rounded-full bg-green-500/15 flex items-center justify-center shrink-0">
          <Check size={15} className="text-green-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-green-300">Alarm oluşturuldu!</p>
          <p className="text-xs text-silver-500 mt-0.5">
            &quot;{autoName}&quot; — yeni eşleşmelerde bildirim alacaksınız.
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-silver-600 hover:text-silver-400 transition-colors"
        >
          <X size={15} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4 rounded-xl bg-navy-850 border border-[rgba(212,167,68,0.15)]">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-9 h-9 rounded-full bg-gold-500/10 border border-gold-500/25 flex items-center justify-center shrink-0">
          <Bell size={16} className="text-gold-500" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-cream-100">Bu kriterlere uyan yeni ilanları bildir</p>
          <p className="text-xs text-silver-500 mt-0.5 truncate">
            {autoName}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Sıklık seçici */}
        <select
          value={frequency}
          onChange={(e) => setFrequency(e.target.value as "daily" | "weekly")}
          className="h-9 bg-navy-800 border border-[rgba(216,220,228,0.12)] rounded-lg px-3 text-cream-200 text-xs focus:outline-none focus:border-gold-500 [&>option]:bg-navy-800 [&>option]:text-cream-100"
        >
          <option value="daily">Günlük</option>
          <option value="weekly">Haftalık</option>
        </select>

        <button
          onClick={handleSave}
          disabled={isPending}
          className="h-9 px-4 rounded-lg bg-gold-500 text-navy-900 text-xs font-semibold hover:bg-gold-400 transition-colors disabled:opacity-60 flex items-center gap-1.5"
        >
          {isPending && <Loader2 size={12} className="animate-spin" />}
          Alarm Kur
        </button>

        <button
          onClick={() => setDismissed(true)}
          className="h-9 w-9 flex items-center justify-center text-silver-600 hover:text-silver-400 transition-colors"
        >
          <X size={15} />
        </button>
      </div>

      {error && (
        <p className="w-full text-xs text-red-400 mt-1">{error}</p>
      )}
    </div>
  );
}
