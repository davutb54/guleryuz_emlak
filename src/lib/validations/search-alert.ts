import { z } from "zod";

export const searchAlertCreateSchema = z.object({
  name: z.string().min(1).max(100),
  filters: z.object({
    category: z.enum(["HOUSE", "LAND", "FIELD", "SHOP"]).optional(),
    type: z.enum(["SALE", "RENT"]).optional(),
    district: z.string().optional(),
    minPrice: z.number().positive().optional(),
    maxPrice: z.number().positive().optional(),
    rooms: z.array(z.string()).optional(),
  }),
  frequency: z.enum(["daily", "weekly"]).default("daily"),
});

export type SearchAlertCreateInput = z.infer<typeof searchAlertCreateSchema>;
