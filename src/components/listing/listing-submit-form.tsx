"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { listingSubmissionSchema, type ListingSubmissionInput } from "@/lib/validations/listing-submission";
import { submitListingRequest } from "@/lib/actions/listing-submission";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ESKISEHIR_DISTRICTS,
  ROOMS_OPTIONS,
  HEATING_OPTIONS,
  FACADE_OPTIONS,
  DEED_STATUS_OPTIONS,
  ZONING_STATUS_OPTIONS,
  getNeighborhoods,
} from "@/lib/data/eskisehir";
import { cn } from "@/lib/utils";
import { CheckCircle, AlertCircle } from "lucide-react";

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
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold text-gold-400 uppercase tracking-wider border-b border-[var(--border-subtle)] pb-2 mb-4">
      {children}
    </h3>
  );
}

const selectClass =
  "w-full h-10 px-3 bg-navy-800 border border-[var(--border-subtle)] rounded-xl text-sm text-cream-100 focus:outline-none focus:border-gold-500/60 [&>option]:bg-navy-800";

const checkboxClass = "w-4 h-4 rounded border-[var(--border-subtle)] bg-navy-800 accent-gold-500 cursor-pointer";

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        className={checkboxClass}
        checked={value ?? false}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="text-sm text-cream-200">{label}</span>
    </label>
  );
}

interface ListingSubmitFormProps {
  defaultContactName?: string;
  defaultContactEmail?: string;
  defaultContactPhone?: string;
}

export default function ListingSubmitForm({
  defaultContactName,
  defaultContactEmail,
  defaultContactPhone,
}: ListingSubmitFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ListingSubmissionInput>({
    resolver: zodResolver(listingSubmissionSchema) as Resolver<ListingSubmissionInput>,
    defaultValues: {
      currency: "TRY",
      city: "Eskişehir",
      contactName: defaultContactName ?? "",
      contactEmail: defaultContactEmail ?? "",
      contactPhone: defaultContactPhone ?? "",
    },
  });

  const category = watch("category");
  const district = watch("district");
  const neighborhoods = district ? getNeighborhoods(district) : [];

  const isHouse = category === "HOUSE";
  const isLand = category === "LAND" || category === "FIELD";
  const isShop = category === "SHOP";

  async function onSubmit(data: ListingSubmissionInput) {
    setServerError(null);
    const result = await submitListingRequest(data);
    if (result.success) {
      setSubmitted(true);
    } else {
      setServerError(result.error);
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <CheckCircle size={56} className="text-gold-400" strokeWidth={1.5} />
        <h2 className="text-2xl font-display text-cream-50">Talebiniz Alındı!</h2>
        <p className="text-silver-400 max-w-md">
          İlan talebiniz başarıyla iletildi. Ekibimiz inceledikten sonra en kısa sürede sizinle
          iletişime geçecektir.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* İletişim bilgileri */}
      <div>
        <SectionTitle>İletişim Bilgileri</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Ad Soyad" required error={errors.contactName?.message}>
            <Input
              {...register("contactName")}
              placeholder="Ad Soyadınız"
              className={cn(errors.contactName && "border-red-500/60")}
            />
          </FormField>
          <FormField label="Telefon" required error={errors.contactPhone?.message}>
            <Input
              {...register("contactPhone")}
              placeholder="+90 5XX XXX XX XX"
              className={cn(errors.contactPhone && "border-red-500/60")}
            />
          </FormField>
          <FormField label="E-posta" required error={errors.contactEmail?.message}>
            <Input
              {...register("contactEmail")}
              type="email"
              placeholder="ornek@email.com"
              className={cn(errors.contactEmail && "border-red-500/60")}
            />
          </FormField>
        </div>
      </div>

      {/* İlan türü */}
      <div>
        <SectionTitle>İlan Türü</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Kategori" required error={errors.category?.message}>
            <select
              {...register("category")}
              className={cn(selectClass, errors.category && "border-red-500/60")}
              defaultValue=""
            >
              <option value="" disabled>Seçiniz</option>
              <option value="HOUSE">Ev / Daire</option>
              <option value="LAND">Arsa</option>
              <option value="FIELD">Tarla</option>
              <option value="SHOP">Dükkan / İşyeri</option>
            </select>
          </FormField>
          <FormField label="İlan Türü" required error={errors.type?.message}>
            <select
              {...register("type")}
              className={cn(selectClass, errors.type && "border-red-500/60")}
              defaultValue=""
            >
              <option value="" disabled>Seçiniz</option>
              <option value="SALE">Satılık</option>
              <option value="RENT">Kiralık</option>
            </select>
          </FormField>
        </div>
      </div>

      {/* İlan bilgileri */}
      <div>
        <SectionTitle>İlan Bilgileri</SectionTitle>
        <div className="space-y-4">
          <FormField label="Başlık" required error={errors.titleTr?.message}>
            <Input
              {...register("titleTr")}
              placeholder="Örn: Odunpazarı'nda 3+1 Satılık Daire"
              className={cn(errors.titleTr && "border-red-500/60")}
            />
          </FormField>
          <FormField label="Açıklama" error={errors.descriptionTr?.message}>
            <textarea
              {...register("descriptionTr")}
              rows={4}
              placeholder="İlan hakkında detaylı bilgi veriniz..."
              className={cn(
                "w-full px-3 py-2.5 bg-navy-800 border border-[var(--border-subtle)] rounded-xl text-sm text-cream-100 placeholder-silver-600 focus:outline-none focus:border-gold-500/60 resize-none",
                errors.descriptionTr && "border-red-500/60"
              )}
            />
          </FormField>
        </div>
      </div>

      {/* Konum */}
      <div>
        <SectionTitle>Konum</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="İlçe" required error={errors.district?.message}>
            <select
              {...register("district")}
              className={cn(selectClass, errors.district && "border-red-500/60")}
              defaultValue=""
            >
              <option value="" disabled>İlçe Seçiniz</option>
              {ESKISEHIR_DISTRICTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </FormField>
          {neighborhoods.length > 0 && (
            <FormField label="Mahalle" error={errors.neighborhood?.message}>
              <select
                {...register("neighborhood")}
                className={selectClass}
                defaultValue=""
              >
                <option value="">Seçiniz (opsiyonel)</option>
                {neighborhoods.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </FormField>
          )}
          <FormField label="Açık Adres" error={errors.address?.message}>
            <Input
              {...register("address")}
              placeholder="Sokak, No (opsiyonel)"
            />
          </FormField>
        </div>
      </div>

      {/* Fiyat & Alan */}
      <div>
        <SectionTitle>Fiyat & Alan</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Fiyat (₺)" required error={errors.price?.message}>
            <Input
              {...register("price")}
              type="number"
              min={0}
              placeholder="0"
              className={cn(errors.price && "border-red-500/60")}
            />
          </FormField>
          <FormField label="Brüt Alan (m²)" required error={errors.area?.message}>
            <Input
              {...register("area")}
              type="number"
              min={0}
              placeholder="0"
              className={cn(errors.area && "border-red-500/60")}
            />
          </FormField>
          {(isHouse || isShop) && (
            <FormField label="Net Alan (m²)" error={errors.netArea?.message}>
              <Input
                {...register("netArea")}
                type="number"
                min={0}
                placeholder="0"
              />
            </FormField>
          )}
        </div>
      </div>

      {/* Ev/Daire özellikleri */}
      {isHouse && (
        <div>
          <SectionTitle>Daire Özellikleri</SectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <FormField label="Oda Sayısı" error={errors.rooms?.message}>
              <select {...register("rooms")} className={selectClass} defaultValue="">
                <option value="">Seçiniz</option>
                {ROOMS_OPTIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Banyo Sayısı" error={errors.bathrooms?.message}>
              <Input {...register("bathrooms")} type="number" min={0} placeholder="0" />
            </FormField>
            <FormField label="Bina Yaşı" error={errors.buildingAge?.message}>
              <Input {...register("buildingAge")} type="number" min={0} placeholder="0" />
            </FormField>
            <FormField label="Bulunduğu Kat" error={errors.floor?.message}>
              <Input {...register("floor")} type="number" placeholder="0" />
            </FormField>
            <FormField label="Toplam Kat" error={errors.totalFloors?.message}>
              <Input {...register("totalFloors")} type="number" min={1} placeholder="0" />
            </FormField>
            <FormField label="Isıtma" error={errors.heating?.message}>
              <select {...register("heating")} className={selectClass} defaultValue="">
                <option value="">Seçiniz</option>
                {HEATING_OPTIONS.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Cephe" error={errors.facade?.message}>
              <select {...register("facade")} className={selectClass} defaultValue="">
                <option value="">Seçiniz</option>
                {FACADE_OPTIONS.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Tapu Durumu" error={errors.deedStatus?.message}>
              <select {...register("deedStatus")} className={selectClass} defaultValue="">
                <option value="">Seçiniz</option>
                {DEED_STATUS_OPTIONS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Toggle label="Balkon" value={watch("hasBalcony") ?? false} onChange={(v) => setValue("hasBalcony", v)} />
            <Toggle label="Asansör" value={watch("hasElevator") ?? false} onChange={(v) => setValue("hasElevator", v)} />
            <Toggle label="Otopark" value={watch("hasParking") ?? false} onChange={(v) => setValue("hasParking", v)} />
            <Toggle label="Güvenlik" value={watch("hasSecurity") ?? false} onChange={(v) => setValue("hasSecurity", v)} />
            <Toggle label="Yüzme Havuzu" value={watch("hasPool") ?? false} onChange={(v) => setValue("hasPool", v)} />
            <Toggle label="Site İçi" value={watch("inSite") ?? false} onChange={(v) => setValue("inSite", v)} />
            <Toggle label="Eşyalı" value={watch("furnished") ?? false} onChange={(v) => setValue("furnished", v)} />
            <Toggle label="Krediye Uygun" value={watch("creditEligible") ?? false} onChange={(v) => setValue("creditEligible", v)} />
          </div>
        </div>
      )}

      {/* Arsa/Tarla özellikleri */}
      {isLand && (
        <div>
          <SectionTitle>Arsa / Tarla Bilgileri</SectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <FormField label="İmar Durumu" error={errors.zoningStatus?.message}>
              <select {...register("zoningStatus")} className={selectClass} defaultValue="">
                <option value="">Seçiniz</option>
                {ZONING_STATUS_OPTIONS.map((z) => (
                  <option key={z} value={z}>{z}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Ada No" error={errors.islandNumber?.message}>
              <Input {...register("islandNumber")} placeholder="Ada numarası" />
            </FormField>
            <FormField label="Parsel No" error={errors.parcelNumber?.message}>
              <Input {...register("parcelNumber")} placeholder="Parsel numarası" />
            </FormField>
          </div>
        </div>
      )}

      {/* Dükkan özellikleri */}
      {isShop && (
        <div>
          <SectionTitle>Dükkan / İşyeri Bilgileri</SectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <FormField label="Isıtma" error={errors.heating?.message}>
              <select {...register("heating")} className={selectClass} defaultValue="">
                <option value="">Seçiniz</option>
                {HEATING_OPTIONS.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Tapu Durumu" error={errors.deedStatus?.message}>
              <select {...register("deedStatus")} className={selectClass} defaultValue="">
                <option value="">Seçiniz</option>
                {DEED_STATUS_OPTIONS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Toggle label="Güvenlik" value={watch("hasSecurity") ?? false} onChange={(v) => setValue("hasSecurity", v)} />
            <Toggle label="Otopark" value={watch("hasParking") ?? false} onChange={(v) => setValue("hasParking", v)} />
          </div>
        </div>
      )}

      {serverError && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          <AlertCircle size={16} strokeWidth={1.5} />
          {serverError}
        </div>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-12 text-base font-semibold"
      >
        {isSubmitting ? "Gönderiliyor..." : "İlan Talebini Gönder"}
      </Button>

      <p className="text-xs text-silver-500 text-center">
        Talebiniz ekibimiz tarafından incelenecek ve uygun bulunması halinde yayınlanacaktır.
        İletişim bilgileriniz yalnızca sizinle iletişim kurmak amacıyla kullanılacaktır.
      </p>
    </form>
  );
}
