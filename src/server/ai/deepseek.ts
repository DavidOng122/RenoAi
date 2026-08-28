import type { ProblemBrief } from "@/schemas/problem-brief.schema";
import { RepairResultSchema, type RepairResult } from "@/schemas/repair-result.schema";
import { repairAgentSystemPrompt } from "./prompts/repair-agent";
import { generateStructured } from "./openai-compatible";

function demoRepair(brief: ProblemBrief): RepairResult {
  const text = `${brief.affected_item} ${brief.observed_problem} ${brief.condition || ""}`.toLowerCase();
  if (/door/.test(text)) return { likely_issue: "Door alignment or hinge issue", urgency: "Low", recommended_work: "Inspect and adjust the hinges and door alignment. Trim the bottom edge only if adjustment is insufficient.", estimated_duration: "1–2 hours", site_visit_required: false, confidence: "Medium" };
  if (/leak|pipe|tap|water/.test(text)) return { likely_issue: "Worn fitting, seal, or loose pipe connection", urgency: /major|flood|burst/.test(text) ? "High" : "Medium", recommended_work: "Isolate the water source, inspect the fitting and surrounding pipework, then replace or reseal the failed component.", estimated_duration: "1–3 hours", site_visit_required: true, confidence: "Medium" };
  if (/socket|power|electric|switch/.test(text)) return { likely_issue: "Loose connection or failed electrical accessory", urgency: /spark|burn|smoke/.test(text) ? "High" : "Medium", recommended_work: "Stop using the affected point and have a licensed electrician test the circuit before replacing the accessory if required.", estimated_duration: "1–2 hours", site_visit_required: true, confidence: "Medium" };
  return { likely_issue: "Cause requires on-site inspection", urgency: "Medium", recommended_work: "Inspect the affected area and confirm the failure before carrying out repair work.", estimated_duration: "To be confirmed after inspection", site_visit_required: true, confidence: "Low" };
}

export async function analyseRepair(brief: ProblemBrief): Promise<RepairResult> {
  if (process.env.AI_DEMO_MODE === "true" || !process.env.DEEPSEEK_API_KEY) return demoRepair(brief);
  return generateStructured({ baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com", apiKey: process.env.DEEPSEEK_API_KEY, model: process.env.DEEPSEEK_MODEL || "deepseek-v4-flash", schema: RepairResultSchema, system: repairAgentSystemPrompt, input: brief });
}
