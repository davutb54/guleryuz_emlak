"use client";

interface SortSelectProps {
  defaultValue: string;
  hiddenFields: { name: string; value: string }[];
}

export default function SortSelect({ defaultValue, hiddenFields }: SortSelectProps) {
  return (
    <form method="GET" action="/ilanlar">
      {hiddenFields.map((f) => (
        <input key={f.name} type="hidden" name={f.name} value={f.value} />
      ))}
      <select
        name="siralama"
        defaultValue={defaultValue}
        onChange={(e) => (e.target.form as HTMLFormElement).submit()}
        className="bg-navy-850 border border-[var(--border-subtle)] text-cream-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold-500 cursor-pointer"
      >
        <option value="newest">En Yeni</option>
        <option value="oldest">En Eski</option>
        <option value="price_asc">Fiyat ↑</option>
        <option value="price_desc">Fiyat ↓</option>
        <option value="area_asc">Alan ↑</option>
        <option value="area_desc">Alan ↓</option>
      </select>
    </form>
  );
}
