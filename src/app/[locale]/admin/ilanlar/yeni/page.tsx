import ListingForm from "@/components/admin/listing-form";
import { Link } from "@/i18n/navigation";
import { ChevronLeft } from "lucide-react";

export default function YeniIlanPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/ilanlar"
          className="flex items-center gap-1 text-silver-500 hover:text-cream-100 text-sm transition-colors"
        >
          <ChevronLeft size={16} strokeWidth={1.5} />
          İlanlara Dön
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="font-display text-display-md text-cream-50">Yeni İlan Ekle</h1>
        <p className="text-silver-500 text-sm mt-1">
          Tüm zorunlu alanları doldurun, taslak olarak kaydedebilirsiniz.
        </p>
      </div>

      <ListingForm />
    </div>
  );
}
