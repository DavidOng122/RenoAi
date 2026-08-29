import { z } from "zod";

export const PropertySchema = z.object({
  id: z.string(),
  user_id: z.string(),
  name: z.string(),
  home_type: z.enum(["HDB", "Condo", "Landed", "Other"]),
  address: z.object({
    postal_code: z.string(),
    address_line: z.string(),
    unit_number: z.string().optional(),
  }),
  created_at: z.string(),
});

export type Property = z.infer<typeof PropertySchema>;
