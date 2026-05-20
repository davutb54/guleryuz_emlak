import { Link } from "@/i18n/navigation";
import { LayoutGrid, Map } from "lucide-react";

interface ViewToggleProps {
  listUrl: string;
  mapUrl: string;
  currentView: "liste" | "harita";
}

// Hook yok → Server Component olarak kullanılabilir, Suspense gerektirmez
export default function ViewToggle({ listUrl, mapUrl, currentView }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-[rgba(212,167,68,0.15)] bg-navy-850 p-0.5">
      <Link
        href={listUrl}
        aria-label="Liste görünümü"
        className={`flex items-center justify-center w-8 h-8 rounded-md transition-colors ${
          currentView === "liste"
            ? "bg-gold-500 text-navy-900"
            : "text-silver-400 hover:text-cream-100"
        }`}
      >
        <LayoutGrid size={15} strokeWidth={1.5} />
      </Link>
      <Link
        href={mapUrl}
        aria-label="Harita görünümü"
        className={`flex items-center justify-center w-8 h-8 rounded-md transition-colors ${
          currentView === "harita"
            ? "bg-gold-500 text-navy-900"
            : "text-silver-400 hover:text-cream-100"
        }`}
      >
        <Map size={15} strokeWidth={1.5} />
      </Link>
    </div>
  );
}
