import { z } from "zod";

export const PriceResultSchema = z.object({
  estimated_min_price: z.number().nullable(),
  estimated_max_price: z.number().nullable(),
  currency: z.literal("SGD"),
  available: z.boolean(),
});

export type PriceResult = z.infer<typeof PriceResultSchema>;
