"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, type ContactFormData } from "@/lib/validations/contact";
import { submitContact } from "@/lib/actions/contact";
import { Send, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function ContactForm() {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [kvkkAccepted, setKvkkAccepted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema) as any,
  });

  const onSubmit = (data: ContactFormData) => {
    setServerError(null);
    startTransition(async () => {
      const result = await submitContact(data);
      if ("error" in result) {
        setServerError(result.error ?? "Bilinmeyen hata.");
      } else {
        setSuccess(true);
        reset();
      }
    });
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center mb-6">
          <CheckCircle className="w-8 h-8 text-gold-500" />
        </div>
        <h3 className="font-display text-2xl text-cream-50 mb-3">
          Mesajınız İletildi
        </h3>
        <p className="text-silver-400 text-sm leading-relaxed max-w-sm">
          En kısa sürede ekibimiz sizinle iletişime geçecektir. Teşekkür
          ederiz.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-8 text-gold-500 hover:text-gold-400 text-sm font-sans underline underline-offset-4 transition-colors"
        >
          Yeni mesaj gönder
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-5">
      {/* Ad Soyad */}
      <div>
        <label className="block text-xs font-sans text-silver-400 uppercase tracking-wider mb-2">
          Ad Soyad <span className="text-gold-500">*</span>
        </label>
        <input
          {...register("name")}
          type="text"
          placeholder="Adınız ve soyadınız"
          className="w-full bg-navy-900 border border-navy-600 focus:border-gold-500 rounded-xl px-4 py-3 text-cream-100 placeholder:text-navy-500 font-sans text-sm outline-none transition-colors"
        />
        {errors.name && (
          <p className="text-red-400 text-xs mt-1.5">{errors.name.message}</p>
        )}
      </div>

      {/* E-posta + Telefon — yan yana, en az biri zorunlu */}
      <div>
        <p className="text-xs font-sans text-silver-500 mb-3">
          <span className="text-gold-500">*</span>{" "}
          E-posta veya telefon numarasından en az birini giriniz
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-sans text-silver-400 uppercase tracking-wider mb-2">
              E-posta
            </label>
            <input
              {...register("email")}
              type="email"
              placeholder="ornek@email.com"
              className="w-full bg-navy-900 border border-navy-600 focus:border-gold-500 rounded-xl px-4 py-3 text-cream-100 placeholder:text-navy-500 font-sans text-sm outline-none transition-colors"
            />
            {errors.email && (
              <p className="text-red-400 text-xs mt-1.5">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-sans text-silver-400 uppercase tracking-wider mb-2">
              Telefon
            </label>
            <input
              {...register("phone")}
              type="tel"
              placeholder="+90 5xx xxx xx xx"
              className="w-full bg-navy-900 border border-navy-600 focus:border-gold-500 rounded-xl px-4 py-3 text-cream-100 placeholder:text-navy-500 font-sans text-sm outline-none transition-colors"
            />
            {errors.phone && (
              <p className="text-red-400 text-xs mt-1.5">{errors.phone.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Konu */}
      <div>
        <label className="block text-xs font-sans text-silver-400 uppercase tracking-wider mb-2">
          Konu
        </label>
        <input
          {...register("subject")}
          type="text"
          placeholder="Mesajınızın konusu"
          className="w-full bg-navy-900 border border-navy-600 focus:border-gold-500 rounded-xl px-4 py-3 text-cream-100 placeholder:text-navy-500 font-sans text-sm outline-none transition-colors"
        />
      </div>

      {/* Mesaj */}
      <div>
        <label className="block text-xs font-sans text-silver-400 uppercase tracking-wider mb-2">
          Mesaj <span className="text-gold-500">*</span>
        </label>
        <textarea
          {...register("message")}
          rows={5}
          placeholder="Mesajınızı buraya yazın..."
          className="w-full bg-navy-900 border border-navy-600 focus:border-gold-500 rounded-xl px-4 py-3 text-cream-100 placeholder:text-navy-500 font-sans text-sm outline-none transition-colors resize-none"
        />
        {errors.message && (
          <p className="text-red-400 text-xs mt-1.5">
            {errors.message.message}
          </p>
        )}
      </div>

      {/* KVKK onayı */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={kvkkAccepted}
          onChange={(e) => setKvkkAccepted(e.target.checked)}
          className="mt-0.5 shrink-0 w-4 h-4 rounded border border-navy-600 bg-navy-900 accent-gold-500 cursor-pointer"
        />
        <span className="text-xs text-silver-500 leading-relaxed">
          <Link href="/kvkk" target="_blank" className="text-gold-500 hover:text-gold-400 underline underline-offset-2 transition-colors">
            KVKK Aydınlatma Metni
          </Link>
          &apos;ni okudum, kişisel verilerimin işlenmesini kabul ediyorum.
        </span>
      </label>

      {/* Sunucu hatası */}
      {serverError && (
        <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending || !kvkkAccepted}
        className="w-full flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-400 disabled:opacity-60 disabled:cursor-not-allowed text-navy-900 font-sans font-semibold py-3.5 px-6 rounded-full transition-colors text-sm"
      >
        <Send className="w-4 h-4" />
        {isPending ? "Gönderiliyor..." : "Mesajı Gönder"}
      </button>
    </form>
  );
}
