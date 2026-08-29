import { ProblemAnalysisSchema, type ProblemAnalysis } from "@/schemas/problem-brief.schema";
import type { ProblemBrief } from "@/schemas/problem-brief.schema";
import type { Property } from "@/schemas/property.schema";
import { RepairResultSchema, type RepairResult } from "@/schemas/repair-result.schema";
import { problemBriefSystemPrompt } from "./prompts/problem-brief";
import { repairAgentSystemPrompt } from "./prompts/repair-agent";
import { generateStructured } from "./openai-compatible";

type Input = { request_id: string; property: Property; description: string; category_hint?: string; clarification?: string; image_data_urls?: string[] };

function demoAnalysis(input: Input): ProblemAnalysis {
  const text = `${input.description} ${input.clarification || ""}`.toLowerCase();
  const category = input.category_hint?.toLowerCase() || "";
  const isDoor = /door|门/.test(text + category);
  const isWater = /leak|water|pipe|tap|漏水|水管|水龙头/.test(text + category);
  const isElectric = /socket|power|switch|electric|插座|电/.test(text + category);
  const isWall = /wall|ceiling|crack|paint|墙|天花/.test(text + category);
  const isAircon = /aircon|air conditioner|空调/.test(text + category);
  const item = isDoor ? "Door" : isWater ? (/tap|faucet|水龙头/.test(text) ? "Tap" : "Pipe") : isElectric ? "Power socket" : isWall ? "Wall / ceiling" : isAircon ? "Air conditioner" : "Unknown item";
  const locationMatch = text.match(/(bedroom|bathroom|kitchen|living room|balcony|卧室|厕所|浴室|厨房|客厅)/);
  const locationMap: Record<string,string> = { 卧室: "Bedroom", 厕所: "Bathroom", 浴室: "Bathroom", 厨房: "Kitchen", 客厅: "Living room" };
  const location = locationMatch ? (locationMap[locationMatch[1]] || locationMatch[1].replace(/^./, c => c.toUpperCase())) : "Unknown";
  const enough = item !== "Unknown item" && input.description.trim().length >= 12;
  return {
    problem_brief: {
      request_id: input.request_id, property_id: input.property.id, property: input.property.home_type,
      location, affected_item: item, observed_problem: input.description.trim(),
      condition: input.clarification?.trim() || "Based on homeowner description",
      customer_goal: `Restore the ${item.toLowerCase()} to safe, normal working condition`,
      dynamic_details: { category_hint: input.category_hint || null },
    },
    is_complete: enough,
    missing_questions: enough ? [] : [item === "Unknown item" ? "Which item or fixture is affected?" : "Where in the home is the issue located?"],
  };
}

export async function createProblemAnalysis(input: Input): Promise<ProblemAnalysis> {
  if (process.env.AI_DEMO_MODE === "true" || !process.env.QWEN_API_KEY) return demoAnalysis(input);
  return generateStructured({
    baseURL: process.env.QWEN_BASE_URL || "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
    apiKey: process.env.QWEN_API_KEY,
    model: process.env.QWEN_MODEL || "qwen3-vl-flash",
    schema: ProblemAnalysisSchema,
    system: problemBriefSystemPrompt,
    input: { selected_property: input.property, description: input.description, category_hint: input.category_hint, new_clarification: input.clarification },
    userContent: [
      { type: "text", text: JSON.stringify({ selected_property: input.property, description: input.description, category_hint: input.category_hint, new_clarification: input.clarification }) },
      ...(input.image_data_urls || []).slice(0, 4).map((url) => ({ type: "image_url", image_url: { url } })),
    ],
  });
}

function demoRepair(brief: ProblemBrief): RepairResult {
  const text = `${brief.affected_item} ${brief.observed_problem} ${brief.condition || ""}`.toLowerCase();
  if (/door/.test(text)) return { likely_issue: "Door alignment or hinge issue", urgency: "Low", recommended_work: "Inspect and adjust the hinges and door alignment. Trim the bottom edge only if adjustment is insufficient.", estimated_duration: "1–2 hours", site_visit_required: false, confidence: "Medium" };
  if (/leak|pipe|tap|water/.test(text)) return { likely_issue: "Worn fitting, seal, or loose pipe connection", urgency: /major|flood|burst/.test(text) ? "High" : "Medium", recommended_work: "Isolate the water source, inspect the fitting and surrounding pipework, then replace or reseal the failed component.", estimated_duration: "1–3 hours", site_visit_required: true, confidence: "Medium" };
  if (/socket|power|electric|switch/.test(text)) return { likely_issue: "Loose connection or failed electrical accessory", urgency: /spark|burn|smoke/.test(text) ? "High" : "Medium", recommended_work: "Stop using the affected point and have a licensed electrician test the circuit before replacing the accessory if required.", estimated_duration: "1–2 hours", site_visit_required: true, confidence: "Medium" };
  return { likely_issue: "Cause requires on-site inspection", urgency: "Medium", recommended_work: "Inspect the affected area and confirm the failure before carrying out repair work.", estimated_duration: "To be confirmed after inspection", site_visit_required: true, confidence: "Low" };
}

export async function analyseRepairWithQwen(brief: ProblemBrief): Promise<RepairResult> {
  if (process.env.AI_DEMO_MODE === "true" || !process.env.QWEN_API_KEY) return demoRepair(brief);
  return generateStructured({
    baseURL: process.env.QWEN_BASE_URL || "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
    apiKey: process.env.QWEN_API_KEY,
    model: process.env.QWEN_REPAIR_MODEL || process.env.QWEN_MODEL || "qwen3-vl-flash",
    schema: RepairResultSchema,
    system: repairAgentSystemPrompt,
    input: brief,
  });
}
