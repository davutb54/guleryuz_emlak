"use client";

import { useState, Suspense } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { SlidersHorizontal } from "lucide-react";
import FilterPanel from "./filter-panel";
import { countActiveFilters, type FilterState } from "@/hooks/use-listing-filters";

// ─── Desktop sidebar wrapper ──────────────────────────────────────────────────
// Server Component'ten initialFilters alır; FilterPanel'a iletir

function DesktopSidebar({ initialFilters }: { initialFilters: FilterState }) {
  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0">
      <div className="bg-navy-850 border border-[rgba(212,167,68,0.12)] rounded-xl p-5 sticky top-24 max-h-[calc(100vh-7rem)] overflow-hidden flex flex-col">
        <FilterPanel initialFilters={initialFilters} />
      </div>
    </aside>
  );
}

// ─── Mobile trigger + bottom sheet ───────────────────────────────────────────

function MobileFilterButton({
  activeCount,
  onOpen,
}: {
  activeCount: number;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-full border border-[rgba(212,167,68,0.25)] text-silver-300 text-sm font-medium hover:border-gold-500/50 hover:text-cream-100 transition-colors"
    >
      <SlidersHorizontal size={15} strokeWidth={1.5} className="text-gold-500" />
      Filtrele
      {activeCount > 0 && (
        <span className="ml-0.5 w-5 h-5 rounded-full bg-gold-500 text-navy-900 text-[10px] font-bold flex items-center justify-center">
          {activeCount}
        </span>
      )}
    </button>
  );
}

// ─── İçerik — useListingFilters hook gerektiriyor (Suspense içinde) ──────────

function FilterSheetContent({
  initialFilters,
}: {
  initialFilters: FilterState;
}) {
  const [open, setOpen] = useState(false);
  const activeCount = countActiveFilters(initialFilters);

  return (
    <>
      {/* Desktop sidebar */}
      <DesktopSidebar initialFilters={initialFilters} />

      {/* Mobile trigger (sadece mobilde görünür) */}
      <div className="lg:hidden">
        <MobileFilterButton activeCount={activeCount} onOpen={() => setOpen(true)} />
      </div>

      {/* Mobile bottom sheet */}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          {/* Backdrop */}
          <Dialog.Overlay className="fixed inset-0 z-40 bg-[rgba(5,14,31,0.80)] backdrop-blur-sm data-[state=open]:animate-[fadeIn_200ms_ease] data-[state=closed]:animate-[fadeOut_150ms_ease]" />

          {/* Sheet */}
          <Dialog.Content
            className="fixed bottom-0 left-0 right-0 z-50 flex flex-col bg-navy-850 border-t border-[rgba(212,167,68,0.18)] rounded-t-2xl max-h-[88vh] focus:outline-none data-[state=open]:animate-[slideUp_300ms_cubic-bezier(0.4,0,0.2,1)] data-[state=closed]:animate-[slideDown_200ms_ease]"
            aria-describedby={undefined}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-silver-400/30" />
            </div>

            {/* Panel içerik — kaydırılabilir */}
            <div className="flex-1 overflow-y-auto px-5 pb-6 pt-2">
              <FilterPanel
                initialFilters={initialFilters}
                onClose={() => setOpen(false)}
              />
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}

// ─── Public export — Suspense boundary ile sarılmış ──────────────────────────
// useSearchParams() için Suspense zorunlu (Next.js App Router)

export default function FilterSheet({
  initialFilters,
}: {
  initialFilters: FilterState;
}) {
  return (
    <Suspense
      fallback={
        // Skeleton: desktop sidebar + mobile trigger
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="bg-navy-850 border border-[rgba(212,167,68,0.12)] rounded-xl p-5 sticky top-24 h-[480px] animate-pulse" />
        </aside>
      }
    >
      <FilterSheetContent initialFilters={initialFilters} />
    </Suspense>
  );
}
