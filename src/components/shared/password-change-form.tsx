"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { KeyRound, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { changePassword } from "@/lib/actions/user";

const schema = z
  .object({
    currentPassword: z.string().min(1, "Mevcut şifre gerekli"),
    newPassword: z.string().min(8, "En az 8 karakter olmalı"),
    confirmPassword: z.string().min(1, "Şifreyi tekrar girin"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function PasswordChangeForm() {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) as any });

  function onSubmit(data: FormData) {
    setServerError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await changePassword(data.currentPassword, data.newPassword);
      if (result.success) {
        setSuccess(true);
        reset();
      } else {
        setServerError(result.error);
      }
    });
  }

  return (
    <div className="bg-navy-850 border border-[rgba(212,167,68,0.1)] rounded-xl p-6">
      <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-silver-300 mb-6">
        <KeyRound size={15} strokeWidth={1.5} className="text-gold-500" />
        Şifre Değiştir
      </h2>

      {success && (
        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3 mb-5">
          <CheckCircle2 size={16} className="text-green-400 shrink-0" />
          <p className="text-green-400 text-sm">Şifreniz başarıyla güncellendi.</p>
        </div>
      )}

      {serverError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-5">
          <p className="text-red-400 text-sm">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Mevcut Şifre */}
        <div>
          <label className="block text-xs font-medium text-silver-400 mb-1.5">
            Mevcut Şifre
          </label>
          <div className="relative">
            <input
              type={showCurrent ? "text" : "password"}
              {...register("currentPassword")}
              className="w-full bg-navy-800 border border-navy-600 focus:border-gold-500/60 rounded-lg px-3 py-2.5 text-cream-100 text-sm placeholder-navy-500 outline-none transition-colors pr-10"
              placeholder="Mevcut şifrenizi girin"
            />
            <button
              type="button"
              onClick={() => setShowCurrent((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-silver-600 hover:text-silver-400 transition-colors"
              tabIndex={-1}
            >
              {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.currentPassword && (
            <p className="text-red-400 text-xs mt-1">{errors.currentPassword.message}</p>
          )}
        </div>

        {/* Yeni Şifre */}
        <div>
          <label className="block text-xs font-medium text-silver-400 mb-1.5">
            Yeni Şifre
          </label>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              {...register("newPassword")}
              className="w-full bg-navy-800 border border-navy-600 focus:border-gold-500/60 rounded-lg px-3 py-2.5 text-cream-100 text-sm placeholder-navy-500 outline-none transition-colors pr-10"
              placeholder="En az 8 karakter"
            />
            <button
              type="button"
              onClick={() => setShowNew((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-silver-600 hover:text-silver-400 transition-colors"
              tabIndex={-1}
            >
              {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.newPassword && (
            <p className="text-red-400 text-xs mt-1">{errors.newPassword.message}</p>
          )}
        </div>

        {/* Şifre Tekrar */}
        <div>
          <label className="block text-xs font-medium text-silver-400 mb-1.5">
            Yeni Şifre (Tekrar)
          </label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              {...register("confirmPassword")}
              className="w-full bg-navy-800 border border-navy-600 focus:border-gold-500/60 rounded-lg px-3 py-2.5 text-cream-100 text-sm placeholder-navy-500 outline-none transition-colors pr-10"
              placeholder="Yeni şifrenizi tekrar girin"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-silver-600 hover:text-silver-400 transition-colors"
              tabIndex={-1}
            >
              {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full mt-2 px-5 py-2.5 bg-gold-500 hover:bg-gold-400 disabled:opacity-50 disabled:cursor-not-allowed text-navy-900 font-semibold text-sm rounded-lg transition-colors"
        >
          {isPending ? "Güncelleniyor..." : "Şifreyi Güncelle"}
        </button>
      </form>
    </div>
  );
}
