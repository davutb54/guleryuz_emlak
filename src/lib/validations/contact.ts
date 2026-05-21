import { z } from "zod";

export const contactSchema = z
  .object({
    name: z.string().min(2, "Ad en az 2 karakter olmalı").max(100),
    email: z
      .string()
      .email("Geçerli bir e-posta adresi girin")
      .optional()
      .or(z.literal("")),
    phone: z
      .string()
      .regex(/^[0-9\s\+\-\(\)]{7,20}$/, "Geçerli bir telefon numarası girin")
      .optional()
      .or(z.literal("")),
    subject: z.string().max(200).optional().or(z.literal("")),
    message: z
      .string()
      .min(10, "Mesaj en az 10 karakter olmalı")
      .max(2000, "Mesaj en fazla 2000 karakter olabilir"),
  })
  .refine((data) => !!(data.email?.trim()) || !!(data.phone?.trim()), {
    message: "E-posta veya telefon numarasından en az birini girin",
    path: ["email"],
  });

export type ContactFormData = z.infer<typeof contactSchema>;
