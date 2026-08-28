import { z } from "zod";

export const ProblemBriefSchema = z.object({
  request_id: z.string(),
  property_id: z.string(),
  property: z.string(),
  location: z.string(),
  affected_item: z.string(),
  observed_problem: z.string(),
  duration: z.string().optional(),
  condition: z.string().optional(),
  customer_goal: z.string(),
  dynamic_details: z.record(z.union([z.string(), z.number(), z.boolean(), z.null()])),
});

export const ProblemAnalysisSchema = z.object({
  problem_brief: ProblemBriefSchema,
  is_complete: z.boolean(),
  missing_questions: z.array(z.string()).max(3),
});

export type ProblemBrief = z.infer<typeof ProblemBriefSchema>;
export type ProblemAnalysis = z.infer<typeof ProblemAnalysisSchema>;
