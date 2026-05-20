"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import {
  type FilterState,
  EMPTY_FILTER,
  buildFilterUrl,
  countActiveFilters,
} from "@/hooks/use-listing-filters";
import {
  ESKISEHIR_DISTRICTS,
  ROOMS_OPTIONS,
  HEATING_OPTIONS,
  ZONING_STATUS_OPTIONS,
  getNeighborhoods,
} from "@/lib/data/eskisehir";

// ─── Küçük yardımcı alt bileşenler ───────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-silver-400 mb-2.5">
      {children}
    </p>
  );
}

function Divider() {
  return <hr className="border-[rgba(216,220,228,0.06)]" />;
}

// Pill toggle (multi-select için)
function Pill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
        active
          ? "bg-gold-500/15 border-gold-500 text-gold-400"
          : "border-[rgba(212,167,68,0.12)] text-silver-500 hover:border-silver-400 hover:text-cream-200"
      }`}
    >
      {label}
    </button>
  );
}

// Toggle (Evet/Hayır özellikler)
function Toggle({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
        active
          ? "bg-gold-500/12 border-gold-500/60 text-gold-400"
          : "border-[rgba(212,167,68,0.1)] text-silver-500 hover:border-silver-400/40 hover:text-cream-200"
      }`}
    >
      <span
        className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center shrink-0 transition-colors ${
          active ? "bg-gold-500 border-gold-500" : "border-silver-500"
        }`}
      >
        {active && (
          <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
            <path d="M1 3L3 5L7 1" stroke="#0A1628" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      {label}
    </button>
  );
}

// Range input çifti (min + max)
function RangeInputs({
  minLabel,
  maxLabel,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  min,
  max,
  step,
}: {
  minLabel: string;
  maxLabel: string;
  minValue: string;
  maxValue: string;
  onMinChange: (v: string) => void;
  onMaxChange: (v: string) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  const inputCls =
    "w-full bg-navy-800 border border-[rgba(216,220,228,0.12)] text-cream-100 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-gold-500 placeholder:text-navy-500 transition-colors";

  return (
    <div className="space-y-2">
      {/* Slider track (tek slider, iki değer için birbirinden bağımsız) */}
      <div className="flex gap-2">
        <div className="flex-1">
          <input
            type="range"
            min={min ?? 0}
            max={max ?? 100000000}
            step={step ?? 50000}
            value={minValue || (min ?? 0)}
            onChange={(e) => onMinChange(e.target.value)}
            className="w-full accent-gold-500 h-1 cursor-pointer"
          />
        </div>
        <div className="flex-1">
          <input
            type="range"
            min={min ?? 0}
            max={max ?? 100000000}
            step={step ?? 50000}
            value={maxValue || (max ?? 100000000)}
            onChange={(e) => onMaxChange(e.target.value)}
            className="w-full accent-gold-500 h-1 cursor-pointer"
          />
        </div>
      </div>
      {/* Sayısal giriş */}
      <div className="flex gap-2">
        <input
          type="number"
          placeholder={minLabel}
          value={minValue}
          min={min}
          max={max}
          onChange={(e) => onMinChange(e.target.value)}
          className={inputCls}
        />
        <input
          type="number"
          placeholder={maxLabel}
          value={maxValue}
          min={min}
          max={max}
          onChange={(e) => onMaxChange(e.target.value)}
          className={inputCls}
        />
      </div>
    </div>
  );
}

// ─── Ana bileşen ─────────────────────────────────────────────────────────────

interface FilterPanelProps {
  initialFilters: Partial<FilterState>;
  onClose?: () => void; // mobile drawer kapama
}

export default function FilterPanel({ initialFilters, onClose }: FilterPanelProps) {
  const router = useRouter();

  // Local state — tüm filtreler burada; "Ara" ile URL'e push edilir
  const [state, setState] = useState<FilterState>({
    ...EMPTY_FILTER,
    ...initialFilters,
    districts: initialFilters.districts ?? [],
    neighborhoods: initialFilters.neighborhoods ?? [],
    rooms: initialFilters.rooms ?? [],
  });

  // String alanlar için local state (number input değerleri)
  const [minPriceStr, setMinPriceStr] = useState(
    initialFilters.minPrice != null ? String(initialFilters.minPrice) : ""
  );
  const [maxPriceStr, setMaxPriceStr] = useState(
    initialFilters.maxPrice != null ? String(initialFilters.maxPrice) : ""
  );
  const [minAreaStr, setMinAreaStr] = useState(
    initialFilters.minArea != null ? String(initialFilters.minArea) : ""
  );
  const [maxAreaStr, setMaxAreaStr] = useState(
    initialFilters.maxArea != null ? String(initialFilters.maxArea) : ""
  );

  const set = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) =>
      setState((s) => ({ ...s, [key]: value })),
    []
  );

  const toggleArray = useCallback(
    (key: "districts" | "neighborhoods" | "rooms", value: string) =>
      setState((s) => {
        const arr = s[key] ?? [];
        const next = arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value];
        // İlçe değişince mahalleler sıfırlanır (farklı ilçenin mahalleleri geçersiz)
        if (key === "districts") return { ...s, districts: next, neighborhoods: [] };
        return { ...s, [key]: next };
      }),
    []
  );

  const toggleBool = useCallback(
    (key: keyof FilterState) =>
      setState((s) => ({ ...s, [key]: s[key] ? undefined : true })),
    []
  );

  // "Ara" butonu → URL push
  const handleSubmit = () => {
    const final: Partial<FilterState> = {
      ...state,
      minPrice: minPriceStr ? Number(minPriceStr) : undefined,
      maxPrice: maxPriceStr ? Number(maxPriceStr) : undefined,
      minArea: minAreaStr ? Number(minAreaStr) : undefined,
      maxArea: maxAreaStr ? Number(maxAreaStr) : undefined,
      page: 1, // filtre değişince 1. sayfaya dön
    };
    router.push(buildFilterUrl(final));
    onClose?.();
  };

  // "Sıfırla"
  const handleReset = () => {
    setState({ ...EMPTY_FILTER });
    setMinPriceStr("");
    setMaxPriceStr("");
    setMinAreaStr("");
    setMaxAreaStr("");
    router.push("/ilanlar");
    onClose?.();
  };

  const activeCount = countActiveFilters({
    ...state,
    minPrice: minPriceStr ? Number(minPriceStr) : undefined,
    maxPrice: maxPriceStr ? Number(maxPriceStr) : undefined,
    minArea: minAreaStr ? Number(minAreaStr) : undefined,
    maxArea: maxAreaStr ? Number(maxAreaStr) : undefined,
  });

  const isHouse = state.category === "HOUSE";
  const isLandOrField = state.category === "LAND" || state.category === "FIELD";
  const isShop = state.category === "SHOP";

  return (
    <div className="flex flex-col h-full">
      {/* Başlık */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2 text-silver-300 text-sm font-semibold">
          <SlidersHorizontal size={15} strokeWidth={1.5} className="text-gold-500" />
          Filtrele
          {activeCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-gold-500 text-navy-900 text-[10px] font-bold">
              {activeCount}
            </span>
          )}
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-silver-500 hover:text-cream-100 transition-colors lg:hidden"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Kaydırılabilir içerik */}
      <div className="flex-1 overflow-y-auto space-y-5 pr-0.5">

        {/* ── Tür ── */}
        <div>
          <SectionLabel>Tür</SectionLabel>
          <div className="flex gap-2">
            {[
              { value: undefined, label: "Tümü" },
              { value: "SALE" as const, label: "Satılık" },
              { value: "RENT" as const, label: "Kiralık" },
            ].map((opt) => (
              <Pill
                key={opt.label}
                label={opt.label}
                active={state.type === opt.value}
                onClick={() => set("type", opt.value)}
              />
            ))}
          </div>
        </div>

        <Divider />

        {/* ── Kategori ── */}
        <div>
          <SectionLabel>Kategori</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {[
              { value: undefined, label: "Tümü" },
              { value: "HOUSE" as const, label: "Ev / Daire" },
              { value: "LAND" as const, label: "Arsa" },
              { value: "FIELD" as const, label: "Tarla" },
              { value: "SHOP" as const, label: "Dükkan" },
            ].map((opt) => (
              <Pill
                key={opt.label}
                label={opt.label}
                active={state.category === opt.value}
                onClick={() => set("category", opt.value)}
              />
            ))}
          </div>
        </div>

        <Divider />

        {/* ── İlçe (multi-select) ── */}
        <div>
          <SectionLabel>İlçe</SectionLabel>
          <div className="flex flex-wrap gap-1.5">
            {ESKISEHIR_DISTRICTS.map((d) => (
              <Pill
                key={d}
                label={d}
                active={state.districts.includes(d)}
                onClick={() => toggleArray("districts", d)}
              />
            ))}
          </div>
        </div>

        {/* ── Mahalle — sadece tek ilçe seçiliyken görünür ── */}
        {state.districts.length === 1 && (() => {
          const mahalles = getNeighborhoods(state.districts[0]);
          if (mahalles.length === 0) return null;
          return (
            <>
              <Divider />
              <div>
                <SectionLabel>Mahalle</SectionLabel>
                <div className="flex flex-wrap gap-1.5">
                  {mahalles.map((m) => (
                    <Pill
                      key={m}
                      label={m}
                      active={state.neighborhoods.includes(m)}
                      onClick={() => toggleArray("neighborhoods", m)}
                    />
                  ))}
                </div>
              </div>
            </>
          );
        })()}

        <Divider />

        {/* ── Fiyat aralığı ── */}
        <div>
          <SectionLabel>Fiyat (₺)</SectionLabel>
          <RangeInputs
            minLabel="Min ₺"
            maxLabel="Max ₺"
            minValue={minPriceStr}
            maxValue={maxPriceStr}
            onMinChange={setMinPriceStr}
            onMaxChange={setMaxPriceStr}
            min={0}
            max={50000000}
            step={50000}
          />
        </div>

        <Divider />

        {/* ── Alan aralığı ── */}
        <div>
          <SectionLabel>Alan (m²)</SectionLabel>
          <RangeInputs
            minLabel="Min m²"
            maxLabel="Max m²"
            minValue={minAreaStr}
            maxValue={maxAreaStr}
            onMinChange={setMinAreaStr}
            onMaxChange={setMaxAreaStr}
            min={0}
            max={10000}
            step={10}
          />
        </div>

        {/* ── HOUSE kategorisi ── */}
        {(isHouse || !state.category) && (
          <>
            <Divider />

            {/* Oda sayısı */}
            <div>
              <SectionLabel>Oda Sayısı</SectionLabel>
              <div className="flex flex-wrap gap-1.5">
                {ROOMS_OPTIONS.map((r) => (
                  <Pill
                    key={r}
                    label={r}
                    active={state.rooms.includes(r)}
                    onClick={() => toggleArray("rooms", r)}
                  />
                ))}
              </div>
            </div>

            <Divider />

            {/* Isıtma */}
            <div>
              <SectionLabel>Isıtma</SectionLabel>
              <select
                value={state.heating ?? ""}
                onChange={(e) => set("heating", e.target.value || undefined)}
                className="w-full bg-navy-800 border border-[rgba(216,220,228,0.12)] text-cream-100 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-gold-500 transition-colors"
              >
                <option value="">Tümü</option>
                {HEATING_OPTIONS.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>

            <Divider />

            {/* Özellik toggle'ları */}
            <div>
              <SectionLabel>Özellikler</SectionLabel>
              <div className="grid grid-cols-2 gap-2">
                <Toggle label="Balkon" active={!!state.hasBalcony} onClick={() => toggleBool("hasBalcony")} />
                <Toggle label="Asansör" active={!!state.hasElevator} onClick={() => toggleBool("hasElevator")} />
                <Toggle label="Otopark" active={!!state.hasParking} onClick={() => toggleBool("hasParking")} />
                <Toggle label="Güvenlik" active={!!state.hasSecurity} onClick={() => toggleBool("hasSecurity")} />
                <Toggle label="Havuz" active={!!state.hasPool} onClick={() => toggleBool("hasPool")} />
                <Toggle label="Eşyalı" active={!!state.furnished} onClick={() => toggleBool("furnished")} />
                <Toggle label="Site İçi" active={!!state.inSite} onClick={() => toggleBool("inSite")} />
              </div>
            </div>
          </>
        )}

        {/* ── LAND / FIELD kategorisi ── */}
        {isLandOrField && (
          <>
            <Divider />
            <div>
              <SectionLabel>İmar Durumu</SectionLabel>
              <select
                value={state.zoningStatus ?? ""}
                onChange={(e) => set("zoningStatus", e.target.value || undefined)}
                className="w-full bg-navy-800 border border-[rgba(216,220,228,0.12)] text-cream-100 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-gold-500 transition-colors"
              >
                <option value="">Tümü</option>
                {ZONING_STATUS_OPTIONS.map((z) => (
                  <option key={z} value={z}>{z}</option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* ── SHOP kategorisi ── */}
        {isShop && (
          <>
            <Divider />
            <div>
              <SectionLabel>Özellikler</SectionLabel>
              <div className="grid grid-cols-2 gap-2">
                <Toggle label="Otopark" active={!!state.hasParking} onClick={() => toggleBool("hasParking")} />
                <Toggle label="Güvenlik" active={!!state.hasSecurity} onClick={() => toggleBool("hasSecurity")} />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Alt butonlar — sabit */}
      <div className="flex gap-2 pt-5 mt-auto border-t border-[rgba(216,220,228,0.06)]">
        <button
          type="button"
          onClick={handleSubmit}
          className="flex-1 py-3 rounded-full bg-gold-500 text-navy-900 text-sm font-semibold tracking-wide hover:bg-gold-400 transition-colors"
        >
          Ara
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-3 rounded-full border border-[rgba(212,167,68,0.25)] text-silver-400 text-sm hover:text-cream-100 hover:border-silver-400 transition-colors"
        >
          Sıfırla
        </button>
      </div>
    </div>
  );
}
