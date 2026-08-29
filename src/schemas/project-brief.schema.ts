import { z } from "zod";
import { ProblemBriefSchema } from "./problem-brief.schema";
import { RepairResultSchema } from "./repair-result.schema";
import { PriceResultSchema } from "./price-result.schema";

export const MediaItemSchema = z.object({
  id: z.string(),
  type: z.enum(["photo", "video"]),
  storage_url: z.string(),
  storage_path: z.string().optional(),
  thumbnail_url: z.string().optional(),
});

export const ProjectBriefSchema = z.object({
  request_id: z.string(),
  status: z.literal("ready"),
  problem: ProblemBriefSchema,
  repair: RepairResultSchema,
  pricing: PriceResultSchema,
  evidence: z.object({ photos: z.array(MediaItemSchema), videos: z.array(MediaItemSchema) }),
  user_confirmation: z.object({ confirmed: z.boolean(), confirmed_at: z.string() }),
});

export type MediaItem = z.infer<typeof MediaItemSchema>;
export type ProjectBrief = z.infer<typeof ProjectBriefSchema>;
export type RequestStatus = "draft" | "collecting_info" | "review" | "analysing" | "ready";
