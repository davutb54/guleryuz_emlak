"use client";

import { useSearchParams } from "next/navigation";
import {
  parseFiltersFromUrl,
  type FilterState,
} from "@/lib/filter-utils";

// Re-export — bileşenler tek import noktası olarak bu dosyayı kullanabilir
export type { FilterState };
export {
  parseFiltersFromUrl,
  buildFilterUrl,
  countActiveFilters,
  EMPTY_FILTER,
} from "@/lib/filter-utils";

// Hook: mevcut URL'den filtre state'ini okur (useSearchParams — client only)
export function useListingFilters(): FilterState {
  const searchParams = useSearchParams();
  return parseFiltersFromUrl(new URLSearchParams(searchParams.toString()));
}
