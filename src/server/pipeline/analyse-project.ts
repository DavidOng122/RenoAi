import type { ProblemBrief } from "@/schemas/problem-brief.schema";
import type { MediaItem, ProjectBrief } from "@/schemas/project-brief.schema";
import { analyseRepairWithQwen } from "@/server/ai/qwen";
import { estimatePrice } from "@/server/pricing/engine";

export async function analyseProject(problem: ProblemBrief, evidence: { photos: MediaItem[]; videos: MediaItem[] }): Promise<ProjectBrief> {
  const [repair, pricing] = await Promise.all([analyseRepairWithQwen(problem), estimatePrice(problem)]);
  return { request_id: problem.request_id, status: "ready", problem, repair, pricing, evidence, user_confirmation: { confirmed: true, confirmed_at: new Date().toISOString() } };
}
