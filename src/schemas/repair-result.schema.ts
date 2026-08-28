import { z } from "zod";

export const RepairResultSchema = z.object({
  likely_issue: z.string(),
  urgency: z.enum(["Low", "Medium", "High"]),
  recommended_work: z.string(),
  estimated_duration: z.string(),
  site_visit_required: z.boolean(),
  confidence: z.enum(["Low", "Medium", "High"]),
});

export type RepairResult = z.infer<typeof RepairResultSchema>;
