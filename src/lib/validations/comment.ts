import { z } from "zod";

export const commentCreateSchema = z.object({
  listingId: z.string().min(1),
  content: z
    .string()
    .min(10, "Yorum en az 10 karakter olmalıdır.")
    .max(1000, "Yorum en fazla 1000 karakter olabilir."),
  rating: z.number().int().min(1).max(5).optional(),
});

export type CommentCreateInput = z.infer<typeof commentCreateSchema>;
