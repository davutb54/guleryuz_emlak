"use client";

import { useState, useTransition } from "react";
import { useRouter, Link } from "@/i18n/navigation";
import { Trash2, CheckSquare, Archive, Zap, Pencil, Eye, Star, Printer } from "lucide-react";
import { bulkListingAction, toggleFeatured } from "@/lib/actions/listing";
import ListingStatusSelect from "./listing-status-select";

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  DRAFT:    { label: "Taslak",    cls: "bg-silver-500/15 text-silver-400" },
  PENDING:  { label: "Beklemede", cls: "bg-amber-400/15 text-amber-400" },
  ACTIVE:   { label: "Aktif",     cls: "bg-green-400/15 text-green-400" },
  SOLD:     { label: "Satıldı",   cls: "bg-blue-400/15 text-blue-400" },
  RENTED:   { label: "Kiralandı", cls: "bg-purple-400/15 text-purple-400" },
  ARCHIVED: { label: "Arşiv",     cls: "bg-navy-600/60 text-silver-500" },
};

const CATEGORY_LABELS: Record<string, string> = {
  HOUSE: "Ev/Daire", LAND: "Arsa", FIELD: "Tarla", SHOP: "Dükkan",
};

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

interface Listing {
  id: string;
  slug: string;
  titleTr: string;
  category: string;
  type: string;
  status: string;
  price: number;
  currency: string;
  district: string;
  featured: boolean;
  agent: { name: string };
}

interface Props {
  listings: Listing[];
}

export default function ListingTable({ listings }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const allSelected = listings.length > 0 && selected.size === listings.length;

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(listings.map((l) => l.id)));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function runBulk(action: "activate" | "archive" | "delete") {
    if (selected.size === 0) return;
    if (action === "delete" && !confirm(`${selected.size} ilan kalıcı olarak silinecek. Emin misiniz?`)) return;
    startTransition(async () => {
      const res = await bulkListingAction({ ids: Array.from(selected), action });
      if (res.success) { setSelected(new Set()); router.refresh(); }
      else alert(res.error);
    });
  }

  function handleToggleFeatured(id: string) {
    startTransition(async () => {
      await toggleFeatured(id);
      router.refresh();
    });
  }

  return (
    <>
      {/* Toplu işlem araç çubuğu */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 mb-3 bg-gold-500/8 border border-gold-500/25 rounded-xl">
          <span className="text-sm text-gold-400 font-medium">{selected.size} ilan seçildi</span>
          <div className="flex items-center gap-2 ml-auto">
            <button onClick={() => runBulk("activate")} disabled={isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-medium hover:bg-green-500/20 transition-colors disabled:opacity-50">
              <Zap size={13} /> Aktif Yap
            </button>
            <button onClick={() => runBulk("archive")} disabled={isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-silver-500/10 text-silver-400 border border-silver-500/20 text-xs font-medium hover:bg-silver-500/20 transition-colors disabled:opacity-50">
              <Archive size={13} /> Arşivle
            </button>
            <button onClick={() => runBulk("delete")} disabled={isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50">
              <Trash2 size={13} /> Sil
            </button>
          </div>
        </div>
      )}

      <div className="bg-navy-850 border border-[var(--border-subtle)] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-divider)]">
                <th className="px-4 py-3 w-10">
                  <button onClick={toggleAll} aria-label="Tümünü seç"
                    className="text-silver-500 hover:text-gold-500 transition-colors">
                    <CheckSquare size={15} strokeWidth={1.5}
                      className={allSelected ? "text-gold-500" : ""} />
                  </button>
                </th>
                {["İlan Başlığı", "Kategori", "Fiyat", "İlçe", "Durum", "Agent", "İşlem"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-silver-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {listings.map((listing) => {
                const status = STATUS_LABELS[listing.status] ?? STATUS_LABELS.DRAFT;
                return (
                  <tr key={listing.id}
                    className={`border-b border-[var(--border-divider)] last:border-0 transition-colors ${
                      selected.has(listing.id) ? "bg-gold-500/5" : "hover:bg-navy-800/60"
                    }`}>
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.has(listing.id)}
                        onChange={() => toggleOne(listing.id)}
                        className="w-4 h-4 rounded border-navy-600 accent-gold-500 cursor-pointer" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleToggleFeatured(listing.id)} disabled={isPending}
                          title={listing.featured ? "Öne çıkarmayı kaldır" : "Öne çıkar"}
                          className={`shrink-0 transition-colors ${listing.featured ? "text-gold-500" : "text-navy-600 hover:text-gold-500"}`}>
                          <Star size={14} strokeWidth={1.5} className={listing.featured ? "fill-gold-500" : ""} />
                        </button>
                        <span className="text-cream-100 font-medium line-clamp-1 max-w-[200px]">
                          {listing.titleTr}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-silver-400 whitespace-nowrap">
                      {CATEGORY_LABELS[listing.category]} / {listing.type === "SALE" ? "Satılık" : "Kiralık"}
                    </td>
                    <td className="px-4 py-3 text-cream-100 font-medium tabular-nums whitespace-nowrap">
                      {formatPrice(listing.price, listing.currency)}
                    </td>
                    <td className="px-4 py-3 text-silver-400">{listing.district}</td>
                    <td className="px-4 py-3">
                      <ListingStatusSelect id={listing.id} currentStatus={listing.status} />
                    </td>
                    <td className="px-4 py-3 text-silver-500 text-xs">{listing.agent.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link href={`/ilan/${listing.slug}`} target="_blank"
                          className="p-1.5 rounded-md text-silver-500 hover:text-cream-100 hover:bg-white/5 transition-colors"
                          title="Önizle">
                          <Eye size={15} strokeWidth={1.5} />
                        </Link>
                        <Link href={`/admin/ilanlar/${listing.id}/duzenle`}
                          className="p-1.5 rounded-md text-silver-500 hover:text-gold-400 hover:bg-gold-500/8 transition-colors"
                          title="Düzenle">
                          <Pencil size={15} strokeWidth={1.5} />
                        </Link>
                        <Link href={`/admin/ilanlar/${listing.id}/afis`} target="_blank"
                          className="p-1.5 rounded-md text-silver-500 hover:text-green-400 hover:bg-green-500/8 transition-colors"
                          title="Afiş Yazdır">
                          <Printer size={15} strokeWidth={1.5} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
