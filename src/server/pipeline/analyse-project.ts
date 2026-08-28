import type { ProblemBrief } from "@/schemas/problem-brief.schema";
import type { MediaItem, ProjectBrief } from "@/schemas/project-brief.schema";
import { analyseRepair } from "@/server/ai/deepseek";
import { estimatePrice } from "@/server/pricing/engine";

export async function analyseProject(problem: ProblemBrief, evidence: { photos: MediaItem[]; videos: MediaItem[] }): Promise<ProjectBrief> {
  const [repair, pricing] = await Promise.all([analyseRepair(problem), estimatePrice(problem)]);
  return { request_id: problem.request_id, status: "ready", problem, repair, pricing, evidence, user_confirmation: { confirmed: true, confirmed_at: new Date().toISOString() } };
}
