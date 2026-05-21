"use client";

import { useState, useTransition } from "react";
import { Bell, Loader2, X } from "lucide-react";
import { createSearchAlert } from "@/lib/actions/search-alert";
import { ESKISEHIR_DISTRICTS } from "@/lib/data/eskisehir";

const CATEGORIES = [
  { value: "HOUSE", label: "Daire / Ev" },
  { value: "LAND", label: "Arsa" },
  { value: "FIELD", label: "Tarla" },
  { value: "SHOP", label: "Dükkan" },
];

const ROOMS_OPTIONS = ["1+0", "1+1", "2+1", "3+1", "4+1", "5+1"];

function buildAutoName(f: {
  category?: string;
  type?: string;
  district?: string;
  rooms?: string[];
}) {
  const parts: string[] = [];
  if (f.district) parts.push(f.district);
  if (f.type === "SALE") parts.push("Satılık");
  else if (f.type === "RENT") parts.push("Kiralık");
  if (f.rooms && f.rooms.length > 0) parts.push(f.rooms.join("/"));
  if (f.category === "HOUSE") parts.push("Daire");
  else if (f.category === "LAND") parts.push("Arsa");
  else if (f.category === "FIELD") parts.push("Tarla");
  else if (f.category === "SHOP") parts.push("Dükkan");
  return parts.length > 0 ? parts.join(" ") : "Yeni Arama Alarmı";
}

export default function SearchAlertForm({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ error?: string } | null>(null);

  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [district, setDistrict] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [rooms, setRooms] = useState<string[]>([]);
  const [frequency, setFrequency] = useState<"daily" | "weekly">("daily");

  function toggleRoom(r: string) {
    setRooms((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);

    const filters = {
      ...(category ? { category } : {}),
      ...(type ? { type } : {}),
      ...(district ? { district } : {}),
      ...(minPrice ? { minPrice: Number(minPrice) } : {}),
      ...(maxPrice ? { maxPrice: Number(maxPrice) } : {}),
      ...(rooms.length > 0 ? { rooms } : {}),
    };

    const name = buildAutoName({ category, type, district, rooms });

    startTransition(async () => {
      const res = await createSearchAlert({ name, filters, frequency });
      if (res.error) {
        setResult({ error: res.error });
      } else {
        setOpen(false);
        setCategory(""); setType(""); setDistrict(""); setMinPrice("");
        setMaxPrice(""); setRooms([]); setFrequency("daily");
        onSuccess?.();
      }
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-gold-500/40 text-gold-500 text-sm font-medium hover:bg-gold-500/8 transition-colors"
      >
        <Bell size={14} strokeWidth={1.5} />
        Yeni Alarm Ekle
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-navy-800 border border-[rgba(212,167,68,0.15)] rounded-xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-cream-100 font-semibold text-sm">Yeni Arama Alarmı</p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-silver-500 hover:text-cream-200 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Kategori */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-silver-500 mb-1.5">Kategori</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-navy-900 border border-[rgba(216,220,228,0.12)] rounded-lg px-3 py-2 text-cream-200 text-sm focus:outline-none focus:border-gold-500"
          >
            <option value="">Hepsi</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Tür */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-silver-500 mb-1.5">Tür</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full bg-navy-900 border border-[rgba(216,220,228,0.12)] rounded-lg px-3 py-2 text-cream-200 text-sm focus:outline-none focus:border-gold-500"
          >
            <option value="">Hepsi</option>
            <option value="SALE">Satılık</option>
            <option value="RENT">Kiralık</option>
          </select>
        </div>

        {/* İlçe */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-silver-500 mb-1.5">İlçe</label>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="w-full bg-navy-900 border border-[rgba(216,220,228,0.12)] rounded-lg px-3 py-2 text-cream-200 text-sm focus:outline-none focus:border-gold-500"
          >
            <option value="">Hepsi</option>
            {ESKISEHIR_DISTRICTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Sıklık */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-silver-500 mb-1.5">Bildirim Sıklığı</label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as "daily" | "weekly")}
            className="w-full bg-navy-900 border border-[rgba(216,220,228,0.12)] rounded-lg px-3 py-2 text-cream-200 text-sm focus:outline-none focus:border-gold-500"
          >
            <option value="daily">Günlük</option>
            <option value="weekly">Haftalık</option>
          </select>
        </div>

        {/* Min Fiyat */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-silver-500 mb-1.5">Min Fiyat (₺)</label>
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="0"
            min={0}
            className="w-full bg-navy-900 border border-[rgba(216,220,228,0.12)] rounded-lg px-3 py-2 text-cream-200 text-sm placeholder:text-silver-700 focus:outline-none focus:border-gold-500"
          />
        </div>

        {/* Max Fiyat */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-silver-500 mb-1.5">Max Fiyat (₺)</label>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Sınırsız"
            min={0}
            className="w-full bg-navy-900 border border-[rgba(216,220,228,0.12)] rounded-lg px-3 py-2 text-cream-200 text-sm placeholder:text-silver-700 focus:outline-none focus:border-gold-500"
          />
        </div>
      </div>

      {/* Oda sayısı */}
      <div className="mb-4">
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-silver-500 mb-2">Oda Sayısı</label>
        <div className="flex flex-wrap gap-2">
          {ROOMS_OPTIONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => toggleRoom(r)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                rooms.includes(r)
                  ? "bg-gold-500/15 border-gold-500/60 text-gold-400"
                  : "border-[rgba(216,220,228,0.12)] text-silver-400 hover:border-silver-500"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {result?.error && (
        <p className="text-red-400 text-xs bg-red-400/10 rounded-lg px-3 py-2 mb-3">
          {result.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-2.5 rounded-full bg-gold-500 text-navy-900 font-semibold text-sm hover:bg-gold-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isPending && <Loader2 size={14} className="animate-spin" />}
        <span>Alarmı Kaydet</span>
      </button>
    </form>
  );
}
