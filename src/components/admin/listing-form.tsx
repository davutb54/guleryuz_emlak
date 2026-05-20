"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "@/i18n/navigation";
import { listingCreateSchema, type ListingCreateInput } from "@/lib/validations/listing";
import { createListing, updateListing } from "@/lib/actions/listing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ESKISEHIR_DISTRICTS,
  ROOMS_OPTIONS,
  HEATING_OPTIONS,
  FACADE_OPTIONS,
  DEED_STATUS_OPTIONS,
  ZONING_STATUS_OPTIONS,
} from "@/lib/data/eskisehir";
import { cn } from "@/lib/utils";

// ─── Tip: Düzenleme modunda geçilen ilan verisi ───────────────────────────────
export interface ListingFormData {
  id: string;
  category: ListingCreateInput["category"];
  type: ListingCreateInput["type"];
  status: ListingCreateInput["status"];
  titleTr: string;
  titleEn?: string | null;
  descriptionTr: string;
  descriptionEn?: string | null;
  price: number;
  currency: string;
  city: string;
  district: string;
  neighborhood?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  area: number;
  netArea?: number | null;
  rooms?: string | null;
  bathrooms?: number | null;
  buildingAge?: number | null;
  floor?: number | null;
  totalFloors?: number | null;
  heating?: string | null;
  furnished?: boolean | null;
  hasBalcony?: boolean | null;
  hasElevator?: boolean | null;
  hasParking?: boolean | null;
  hasSecurity?: boolean | null;
  hasPool?: boolean | null;
  inSite?: boolean | null;
  facade?: string | null;
  creditEligible?: boolean | null;
  deedStatus?: string | null;
  zoningStatus?: string | null;
  kaks?: number | null;
  taks?: number | null;
  islandNumber?: string | null;
  parcelNumber?: string | null;
  ceilingHeight?: number | null;
  storefrontWidth?: number | null;
  virtualTourUrl?: string | null;
  featured: boolean;
}

interface ListingFormProps {
  listing?: ListingFormData;
}

// ─── Yardımcı bileşenler ─────────────────────────────────────────────────────

function FormField({
  label,
  error,
  children,
  required,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-silver-400 uppercase tracking-wider">
        {label}
        {required && <span className="text-gold-500 ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}

const selectClass =
  "w-full h-[52px] bg-white/[0.03] border border-[rgba(216,220,228,0.12)] text-cream-100 rounded-xl px-4 text-sm focus:outline-none focus:border-gold-500 focus:shadow-[0_0_0_3px_rgba(212,167,68,0.15)] transition-all";

const textareaClass =
  "w-full bg-white/[0.03] border border-[rgba(216,220,228,0.12)] text-cream-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold-500 focus:shadow-[0_0_0_3px_rgba(212,167,68,0.15)] transition-all placeholder:text-silver-500 resize-none";

const inputClass =
  "h-[52px] bg-white/[0.03] border-[rgba(216,220,228,0.12)] text-cream-100 rounded-xl";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-6 mb-4">
      <h3 className="text-xs font-semibold text-silver-300 uppercase tracking-widest">
        {children}
      </h3>
      <div className="h-px bg-[var(--border-divider)] mt-2" />
    </div>
  );
}

function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean | undefined;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked ?? false}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-silver-500 bg-navy-800 text-gold-500 focus:ring-gold-500 focus:ring-offset-navy-900 cursor-pointer"
      />
      <span className="text-sm text-cream-200 group-hover:text-cream-100 transition-colors">
        {label}
      </span>
    </label>
  );
}

// ─── Ana form bileşeni ───────────────────────────────────────────────────────

export default function ListingForm({ listing }: ListingFormProps) {
  const router = useRouter();
  const isEdit = !!listing;
  const [serverError, setServerError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"tr" | "en">("tr");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<ListingCreateInput>({
    resolver: zodResolver(listingCreateSchema) as any,
    defaultValues: listing
      ? {
          category: listing.category,
          type: listing.type,
          status: listing.status,
          titleTr: listing.titleTr,
          titleEn: listing.titleEn ?? "",
          descriptionTr: listing.descriptionTr,
          descriptionEn: listing.descriptionEn ?? "",
          price: listing.price,
          currency: listing.currency,
          city: listing.city,
          district: listing.district,
          neighborhood: listing.neighborhood ?? "",
          address: listing.address ?? "",
          latitude: listing.latitude ?? undefined,
          longitude: listing.longitude ?? undefined,
          area: listing.area,
          netArea: listing.netArea ?? undefined,
          rooms: listing.rooms ?? "",
          bathrooms: listing.bathrooms ?? undefined,
          buildingAge: listing.buildingAge ?? undefined,
          floor: listing.floor ?? undefined,
          totalFloors: listing.totalFloors ?? undefined,
          heating: listing.heating ?? "",
          furnished: listing.furnished ?? false,
          hasBalcony: listing.hasBalcony ?? false,
          hasElevator: listing.hasElevator ?? false,
          hasParking: listing.hasParking ?? false,
          hasSecurity: listing.hasSecurity ?? false,
          hasPool: listing.hasPool ?? false,
          inSite: listing.inSite ?? false,
          facade: listing.facade ?? "",
          creditEligible: listing.creditEligible ?? false,
          deedStatus: listing.deedStatus ?? "",
          zoningStatus: listing.zoningStatus ?? "",
          kaks: listing.kaks ?? undefined,
          taks: listing.taks ?? undefined,
          islandNumber: listing.islandNumber ?? "",
          parcelNumber: listing.parcelNumber ?? "",
          ceilingHeight: listing.ceilingHeight ?? undefined,
          storefrontWidth: listing.storefrontWidth ?? undefined,
          virtualTourUrl: listing.virtualTourUrl ?? "",
          featured: listing.featured,
        }
      : {
          status: "DRAFT",
          currency: "TRY",
          city: "Eskişehir",
          featured: false,
        },
  });

  const category = watch("category");
  const isHouse = category === "HOUSE";
  const isLand = category === "LAND" || category === "FIELD";
  const isShop = category === "SHOP";
  const showResidential = isHouse || isShop;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    setServerError(null);
    const result = isEdit
      ? await updateListing(listing.id, data)
      : await createListing(data);

    if (result.success) {
      router.push("/admin/ilanlar");
    } else {
      setServerError(result.error ?? "Bir hata oluştu");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl space-y-2">
      {/* Sunucu hatası */}
      {serverError && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {serverError}
        </div>
      )}

      {/* ─── Temel Bilgiler ──────────────────────────────────────────────────── */}
      <div className="bg-navy-850 border border-[var(--border-subtle)] rounded-xl p-6">
        <SectionTitle>Temel Bilgiler</SectionTitle>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Kategori" error={errors.category?.message} required>
            <select {...register("category")} className={selectClass}>
              <option value="">Seçiniz</option>
              <option value="HOUSE">Ev / Daire</option>
              <option value="LAND">Arsa</option>
              <option value="FIELD">Tarla</option>
              <option value="SHOP">Dükkan / İşyeri</option>
            </select>
          </FormField>

          <FormField label="İlan Türü" error={errors.type?.message} required>
            <select {...register("type")} className={selectClass}>
              <option value="">Seçiniz</option>
              <option value="SALE">Satılık</option>
              <option value="RENT">Kiralık</option>
            </select>
          </FormField>

          <FormField label="Durum" error={errors.status?.message}>
            <select {...register("status")} className={selectClass}>
              <option value="DRAFT">Taslak</option>
              <option value="PENDING">Beklemede</option>
              <option value="ACTIVE">Aktif</option>
              <option value="SOLD">Satıldı</option>
              <option value="RENTED">Kiralandı</option>
              <option value="ARCHIVED">Arşivlendi</option>
            </select>
          </FormField>
        </div>

        <div className="mt-4">
          <CheckboxField
            label="Öne Çıkan İlan"
            checked={watch("featured")}
            onChange={(v) => setValue("featured", v)}
          />
        </div>
      </div>

      {/* ─── İçerik ─────────────────────────────────────────────────────────── */}
      <div className="bg-navy-850 border border-[var(--border-subtle)] rounded-xl p-6">
        <SectionTitle>Başlık ve Açıklama</SectionTitle>

        {/* TR / EN sekme */}
        <div className="flex gap-2 mb-4">
          {(["tr", "en"] as const).map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setActiveTab(lang)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors",
                activeTab === lang
                  ? "bg-gold-500 text-navy-900"
                  : "border border-[var(--border-subtle)] text-silver-400 hover:text-cream-100"
              )}
            >
              {lang === "tr" ? "Türkçe" : "English"}
            </button>
          ))}
        </div>

        {activeTab === "tr" ? (
          <div className="space-y-4">
            <FormField label="Başlık (TR)" error={errors.titleTr?.message} required>
              <Input
                {...register("titleTr")}
                placeholder="Örn: Tepebaşı'nda Satılık 3+1 Daire"
                className={inputClass}
              />
            </FormField>
            <FormField label="Açıklama (TR)" error={errors.descriptionTr?.message} required>
              <textarea
                {...register("descriptionTr")}
                rows={5}
                placeholder="İlan detaylarını giriniz..."
                className={textareaClass}
              />
            </FormField>
          </div>
        ) : (
          <div className="space-y-4">
            <FormField label="Title (EN)" error={errors.titleEn?.message}>
              <Input
                {...register("titleEn")}
                placeholder="e.g. 3+1 Apartment for Sale in Tepebaşı"
                className={inputClass}
              />
            </FormField>
            <FormField label="Description (EN)" error={errors.descriptionEn?.message}>
              <textarea
                {...register("descriptionEn")}
                rows={5}
                placeholder="Enter listing details..."
                className={textareaClass}
              />
            </FormField>
          </div>
        )}
      </div>

      {/* ─── Fiyat ve Alan ──────────────────────────────────────────────────── */}
      <div className="bg-navy-850 border border-[var(--border-subtle)] rounded-xl p-6">
        <SectionTitle>Fiyat ve Alan</SectionTitle>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <FormField label="Fiyat" error={errors.price?.message} required>
            <Input
              {...register("price")}
              type="number"
              min={0}
              placeholder="0"
              className={inputClass}
            />
          </FormField>

          <FormField label="Para Birimi" error={errors.currency?.message}>
            <select {...register("currency")} className={selectClass}>
              <option value="TRY">TRY ₺</option>
              <option value="USD">USD $</option>
              <option value="EUR">EUR €</option>
            </select>
          </FormField>

          <FormField label="Brüt Alan (m²)" error={errors.area?.message} required>
            <Input
              {...register("area")}
              type="number"
              min={0}
              step="0.01"
              placeholder="0"
              className={inputClass}
            />
          </FormField>

          <FormField label="Net Alan (m²)" error={errors.netArea?.message}>
            <Input
              {...register("netArea")}
              type="number"
              min={0}
              step="0.01"
              placeholder="0"
              className={inputClass}
            />
          </FormField>
        </div>
      </div>

      {/* ─── Konum ──────────────────────────────────────────────────────────── */}
      <div className="bg-navy-850 border border-[var(--border-subtle)] rounded-xl p-6">
        <SectionTitle>Konum</SectionTitle>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Şehir">
            <Input {...register("city")} readOnly className={cn(inputClass, "opacity-60")} />
          </FormField>

          <FormField label="İlçe" error={errors.district?.message} required>
            <select {...register("district")} className={selectClass}>
              <option value="">İlçe Seçiniz</option>
              {ESKISEHIR_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Mahalle" error={errors.neighborhood?.message}>
            <Input
              {...register("neighborhood")}
              placeholder="Mahalle adı"
              className={inputClass}
            />
          </FormField>

          <FormField label="Adres" error={errors.address?.message}>
            <Input {...register("address")} placeholder="Tam adres" className={inputClass} />
          </FormField>

          <FormField label="Enlem" error={errors.latitude?.message}>
            <Input
              {...register("latitude")}
              type="number"
              step="0.000001"
              placeholder="39.7767"
              className={inputClass}
            />
          </FormField>

          <FormField label="Boylam" error={errors.longitude?.message}>
            <Input
              {...register("longitude")}
              type="number"
              step="0.000001"
              placeholder="30.5206"
              className={inputClass}
            />
          </FormField>
        </div>
      </div>

      {/* ─── Konut / Dükkan Özellikleri ─────────────────────────────────────── */}
      {showResidential && (
        <div className="bg-navy-850 border border-[var(--border-subtle)] rounded-xl p-6">
          <SectionTitle>{isHouse ? "Daire Özellikleri" : "Dükkan Özellikleri"}</SectionTitle>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {isHouse && (
              <FormField label="Oda Sayısı">
                <select {...register("rooms")} className={selectClass}>
                  <option value="">Seçiniz</option>
                  {ROOMS_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </FormField>
            )}

            <FormField label="Banyo">
              <Input
                {...register("bathrooms")}
                type="number"
                min={0}
                placeholder="0"
                className={inputClass}
              />
            </FormField>

            {isHouse && (
              <>
                <FormField label="Bina Yaşı">
                  <Input
                    {...register("buildingAge")}
                    type="number"
                    min={0}
                    placeholder="0"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Bulunduğu Kat">
                  <Input
                    {...register("floor")}
                    type="number"
                    placeholder="0"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Toplam Kat">
                  <Input
                    {...register("totalFloors")}
                    type="number"
                    min={1}
                    placeholder="1"
                    className={inputClass}
                  />
                </FormField>
              </>
            )}

            <FormField label="Isıtma">
              <select {...register("heating")} className={selectClass}>
                <option value="">Seçiniz</option>
                {HEATING_OPTIONS.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Cephe">
              <select {...register("facade")} className={selectClass}>
                <option value="">Seçiniz</option>
                {FACADE_OPTIONS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Tapu Durumu">
              <select {...register("deedStatus")} className={selectClass}>
                <option value="">Seçiniz</option>
                {DEED_STATUS_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </FormField>

            {isShop && (
              <>
                <FormField label="Tavan Yüksekliği (m)">
                  <Input
                    {...register("ceilingHeight")}
                    type="number"
                    step="0.01"
                    placeholder="0"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Cephe Genişliği (m)">
                  <Input
                    {...register("storefrontWidth")}
                    type="number"
                    step="0.01"
                    placeholder="0"
                    className={inputClass}
                  />
                </FormField>
              </>
            )}
          </div>

          {/* Boolean alanlar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {isHouse && (
              <>
                <CheckboxField
                  label="Eşyalı"
                  checked={watch("furnished")}
                  onChange={(v) => setValue("furnished", v)}
                />
                <CheckboxField
                  label="Balkon"
                  checked={watch("hasBalcony")}
                  onChange={(v) => setValue("hasBalcony", v)}
                />
                <CheckboxField
                  label="Asansör"
                  checked={watch("hasElevator")}
                  onChange={(v) => setValue("hasElevator", v)}
                />
                <CheckboxField
                  label="Havuz"
                  checked={watch("hasPool")}
                  onChange={(v) => setValue("hasPool", v)}
                />
                <CheckboxField
                  label="Site İçinde"
                  checked={watch("inSite")}
                  onChange={(v) => setValue("inSite", v)}
                />
                <CheckboxField
                  label="Krediye Uygun"
                  checked={watch("creditEligible")}
                  onChange={(v) => setValue("creditEligible", v)}
                />
              </>
            )}
            <CheckboxField
              label="Otopark"
              checked={watch("hasParking")}
              onChange={(v) => setValue("hasParking", v)}
            />
            <CheckboxField
              label="Güvenlik"
              checked={watch("hasSecurity")}
              onChange={(v) => setValue("hasSecurity", v)}
            />
          </div>
        </div>
      )}

      {/* ─── Arsa / Tarla Özellikleri ──────────────────────────────────────── */}
      {isLand && (
        <div className="bg-navy-850 border border-[var(--border-subtle)] rounded-xl p-6">
          <SectionTitle>Arsa / Tarla Özellikleri</SectionTitle>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <FormField label="İmar Durumu">
              <select {...register("zoningStatus")} className={selectClass}>
                <option value="">Seçiniz</option>
                {ZONING_STATUS_OPTIONS.map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Tapu Durumu">
              <select {...register("deedStatus")} className={selectClass}>
                <option value="">Seçiniz</option>
                {DEED_STATUS_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="KAKS (Emsal)">
              <Input
                {...register("kaks")}
                type="number"
                step="0.01"
                min={0}
                placeholder="0.00"
                className={inputClass}
              />
            </FormField>

            <FormField label="TAKS">
              <Input
                {...register("taks")}
                type="number"
                step="0.01"
                min={0}
                placeholder="0.00"
                className={inputClass}
              />
            </FormField>

            <FormField label="Ada No">
              <Input {...register("islandNumber")} placeholder="Ada numarası" className={inputClass} />
            </FormField>

            <FormField label="Parsel No">
              <Input {...register("parcelNumber")} placeholder="Parsel numarası" className={inputClass} />
            </FormField>
          </div>
        </div>
      )}

      {/* ─── Ek Bilgiler ─────────────────────────────────────────────────────── */}
      <div className="bg-navy-850 border border-[var(--border-subtle)] rounded-xl p-6">
        <SectionTitle>Ek Bilgiler</SectionTitle>

        <FormField label="Sanal Tur URL" error={errors.virtualTourUrl?.message}>
          <Input
            {...register("virtualTourUrl")}
            placeholder="https://..."
            className={inputClass}
          />
        </FormField>
      </div>

      {/* ─── Kaydet / İptal ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 pt-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="px-8 py-2.5 rounded-full bg-gold-500 text-navy-900 font-semibold hover:bg-gold-400 disabled:opacity-50"
        >
          {isSubmitting
            ? "Kaydediliyor..."
            : isEdit
            ? "Güncelle"
            : "İlanı Yayınla"}
        </Button>

        <button
          type="button"
          onClick={() => router.push("/admin/ilanlar")}
          className="px-6 py-2.5 rounded-full border border-[var(--border-subtle)] text-silver-400 text-sm hover:text-cream-100 hover:border-silver-400 transition-colors"
        >
          İptal
        </button>
      </div>
    </form>
  );
}
