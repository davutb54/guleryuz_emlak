import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Link } from "@/i18n/navigation";
import { ChevronLeft, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import SubmissionActions from "./submission-actions";

const CATEGORY_LABELS: Record<string, string> = {
  HOUSE: "Ev / Daire",
  LAND: "Arsa",
  FIELD: "Tarla",
  SHOP: "Dükkan / İşyeri",
};

const TYPE_LABELS: Record<string, string> = {
  SALE: "Satılık",
  RENT: "Kiralık",
};

function DetailRow({ label, value }: { label: string; value?: string | number | boolean | null }) {
  if (value === null || value === undefined || value === "") return null;
  const displayValue =
    typeof value === "boolean" ? (value ? "Evet" : "Hayır") : String(value);
  return (
    <div className="flex gap-3 py-2.5 border-b border-[var(--border-subtle)] last:border-0">
      <span className="text-xs font-semibold text-silver-500 uppercase tracking-wider w-36 shrink-0">{label}</span>
      <span className="text-sm text-cream-200 min-w-0 break-words whitespace-pre-wrap">{displayValue}</span>
    </div>
  );
}

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const submission = await db.listingSubmission.findUnique({ where: { id } });
  if (!submission) notFound();

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/ilan-talepleri"
          className="flex items-center gap-1 text-silver-500 hover:text-cream-100 text-sm transition-colors"
        >
          <ChevronLeft size={16} strokeWidth={1.5} />
          Taleplere Dön
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-start gap-6">
        {/* Sol: İlan Detayları */}
        <div className="flex-1 space-y-6">
          <div className="bg-navy-900 border border-[var(--border-subtle)] rounded-xl p-5">
            <h2 className="text-xs font-semibold text-silver-400 uppercase tracking-wider mb-4">
              İletişim Bilgileri
            </h2>
            <DetailRow label="Ad Soyad" value={submission.contactName} />
            <DetailRow label="Telefon" value={submission.contactPhone} />
            <DetailRow label="E-posta" value={submission.contactEmail} />
          </div>

          <div className="bg-navy-900 border border-[var(--border-subtle)] rounded-xl p-5">
            <h2 className="text-xs font-semibold text-silver-400 uppercase tracking-wider mb-4">
              İlan Bilgileri
            </h2>
            <DetailRow label="Başlık" value={submission.titleTr} />
            <DetailRow label="Kategori" value={CATEGORY_LABELS[submission.category] ?? submission.category} />
            <DetailRow label="Tür" value={TYPE_LABELS[submission.type] ?? submission.type} />
            <DetailRow label="Fiyat" value={`${Number(submission.price).toLocaleString("tr-TR")} ₺`} />
            <DetailRow label="Açıklama" value={submission.descriptionTr} />
          </div>

          <div className="bg-navy-900 border border-[var(--border-subtle)] rounded-xl p-5">
            <h2 className="text-xs font-semibold text-silver-400 uppercase tracking-wider mb-4">
              Konum
            </h2>
            <DetailRow label="Şehir" value={submission.city} />
            <DetailRow label="İlçe" value={submission.district} />
            <DetailRow label="Mahalle" value={submission.neighborhood} />
            <DetailRow label="Adres" value={submission.address} />
          </div>

          <div className="bg-navy-900 border border-[var(--border-subtle)] rounded-xl p-5">
            <h2 className="text-xs font-semibold text-silver-400 uppercase tracking-wider mb-4">
              Özellikler
            </h2>
            <DetailRow label="Brüt Alan" value={submission.area ? `${submission.area} m²` : null} />
            <DetailRow label="Net Alan" value={submission.netArea ? `${submission.netArea} m²` : null} />
            <DetailRow label="Oda Sayısı" value={submission.rooms} />
            <DetailRow label="Banyo Sayısı" value={submission.bathrooms} />
            <DetailRow label="Bina Yaşı" value={submission.buildingAge} />
            <DetailRow label="Bulunduğu Kat" value={submission.floor} />
            <DetailRow label="Toplam Kat" value={submission.totalFloors} />
            <DetailRow label="Isıtma" value={submission.heating} />
            <DetailRow label="Cephe" value={submission.facade} />
            <DetailRow label="Tapu Durumu" value={submission.deedStatus} />
            <DetailRow label="İmar Durumu" value={submission.zoningStatus} />
            <DetailRow label="Ada No" value={submission.islandNumber} />
            <DetailRow label="Parsel No" value={submission.parcelNumber} />
            {submission.furnished !== null && <DetailRow label="Eşyalı" value={submission.furnished} />}
            {submission.hasBalcony !== null && <DetailRow label="Balkon" value={submission.hasBalcony} />}
            {submission.hasElevator !== null && <DetailRow label="Asansör" value={submission.hasElevator} />}
            {submission.hasParking !== null && <DetailRow label="Otopark" value={submission.hasParking} />}
            {submission.hasSecurity !== null && <DetailRow label="Güvenlik" value={submission.hasSecurity} />}
            {submission.hasPool !== null && <DetailRow label="Havuz" value={submission.hasPool} />}
            {submission.inSite !== null && <DetailRow label="Site İçi" value={submission.inSite} />}
            {submission.creditEligible !== null && <DetailRow label="Krediye Uygun" value={submission.creditEligible} />}
          </div>
        </div>

        {/* Sağ: Durum & Aksiyon */}
        <div className="md:w-72 shrink-0 space-y-4">
          <div className="bg-navy-900 border border-[var(--border-subtle)] rounded-xl p-5">
            <h2 className="text-xs font-semibold text-silver-400 uppercase tracking-wider mb-3">
              Talep Durumu
            </h2>

            {submission.status === "PENDING" && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm mb-4">
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                İnceleme Bekliyor
              </div>
            )}
            {submission.status === "APPROVED" && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm mb-4">
                <CheckCircle size={14} strokeWidth={1.5} />
                Onaylandı
              </div>
            )}
            {submission.status === "REJECTED" && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
                <XCircle size={14} strokeWidth={1.5} />
                Reddedildi
              </div>
            )}

            {submission.adminNote && (
              <div className="mb-4 p-3 rounded-lg bg-navy-800 text-silver-400 text-xs">
                <p className="font-semibold text-silver-300 mb-1">Admin Notu:</p>
                {submission.adminNote}
              </div>
            )}

            {submission.reviewedAt && (
              <p className="text-xs text-silver-500 mb-4">
                İşlem tarihi: {new Date(submission.reviewedAt).toLocaleDateString("tr-TR", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              </p>
            )}

            {submission.listingId && (
              <Link
                href={`/admin/ilanlar/${submission.listingId}/duzenle`}
                className="flex items-center gap-2 text-xs text-gold-400 hover:text-gold-300 transition-colors mb-4"
              >
                <ExternalLink size={12} />
                Oluşturulan İlanı Görüntüle
              </Link>
            )}

            <p className="text-xs text-silver-600 mb-1">Gönderim Tarihi</p>
            <p className="text-xs text-silver-400">
              {new Date(submission.createdAt).toLocaleDateString("tr-TR", {
                day: "numeric", month: "long", year: "numeric",
              })}
            </p>
          </div>

          {/* Aksiyon butonları — sadece PENDING ise */}
          {submission.status === "PENDING" && (
            <SubmissionActions submissionId={submission.id} />
          )}
        </div>
      </div>
    </div>
  );
}
