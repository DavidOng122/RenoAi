import { ProblemAnalysisSchema, type ProblemAnalysis } from "@/schemas/problem-brief.schema";
import type { ProblemBrief } from "@/schemas/problem-brief.schema";
import type { Property } from "@/schemas/property.schema";
import { RepairResultSchema, type RepairResult } from "@/schemas/repair-result.schema";
import { problemBriefSystemPrompt } from "./prompts/problem-brief";
import { repairAgentSystemPrompt } from "./prompts/repair-agent";
import { generateStructured } from "./openai-compatible";

type ClarificationAnswer = { question: string; answer: string };
type Input = {
  request_id: string;
  property: Property;
  description: string;
  category_hint?: string;
  clarification?: string;
  existing_problem_brief?: ProblemBrief;
  existing_brief?: ProblemBrief;
  clarification_history?: ClarificationAnswer[];
  image_data_urls?: string[];
};

function normaliseQuestion(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function demoAnalysis(input: Input): ProblemAnalysis {
  const text = `${input.description} ${input.clarification || ""}`.toLowerCase();
  const existingBrief = input.existing_problem_brief || input.existing_brief;
  const selectedType = input.category_hint?.toLowerCase();
  let item = "Unknown item";
  if (selectedType?.includes("water")) item = /tap|faucet|水龙头/.test(text) ? "Tap" : /sink|basin|水槽/.test(text) ? "Sink / drainage" : /pipe|水管/.test(text) ? "Pipe" : "Plumbing fixture";
  else if (selectedType?.includes("electrical")) item = /light|lamp|灯/.test(text) ? "Light fitting" : /switch|开关/.test(text) ? "Light switch" : /socket|outlet|插座/.test(text) ? "Power socket" : "Electrical fixture";
  else if (selectedType?.includes("door") || selectedType?.includes("cabinet")) item = /cabinet|cupboard|柜/.test(text) ? "Cabinet" : "Door";
  else if (selectedType?.includes("wall") || selectedType?.includes("ceiling")) item = /ceiling|天花/.test(text) ? "Ceiling" : "Wall";
  else if (selectedType?.includes("tile") || selectedType?.includes("floor")) item = /tile|瓷砖/.test(text) ? "Floor tile" : "Flooring";
  else if (/door|门/.test(text)) item = "Door";
  else if (/leak|water|pipe|tap|漏水|水管|水龙头/.test(text)) item = /tap|faucet|水龙头/.test(text) ? "Tap" : "Pipe";
  else if (/socket|power|switch|electric|插座|电/.test(text)) item = "Power socket";
  else if (/wall|ceiling|crack|paint|墙|天花/.test(text)) item = "Wall / ceiling";
  else if (/tile|floor|瓷砖|地板/.test(text)) item = "Tiles / floor";
  else if (/aircon|air conditioner|空调/.test(text)) item = "Air conditioner";
  const locationMatch = text.match(/(bedroom|bathroom|kitchen|living room|balcony|卧室|厕所|浴室|厨房|客厅)/);
  const locationMap: Record<string,string> = { 卧室: "Bedroom", 厕所: "Bathroom", 浴室: "Bathroom", 厨房: "Kitchen", 客厅: "Living room" };
  let location = locationMatch ? (locationMap[locationMatch[1]] || locationMatch[1].replace(/^./, c => c.toUpperCase())) : "Unknown";
  if (item === "Unknown item" && existingBrief?.affected_item && existingBrief.affected_item !== "Unknown") item = existingBrief.affected_item;
  if (location === "Unknown" && existingBrief?.location && existingBrief.location !== "Unknown") location = existingBrief.location;
  const missingQuestions: string[] = [];
  if (item === "Unknown item") missingQuestions.push("Which item or fixture is affected?");
  if (location === "Unknown") missingQuestions.push("Where in the home is the issue located?");
  if (input.description.trim().length < 12) missingQuestions.push("What happened, and what is the item doing now?");
  const enough = missingQuestions.length === 0;
  return {
    problem_brief: {
      request_id: input.request_id, property_id: input.property.id, property: input.property.home_type,
      location, affected_item: item, observed_problem: input.description.trim() || existingBrief?.observed_problem || "Unknown",
      condition: input.clarification?.trim() || existingBrief?.condition || "Based on homeowner description",
      customer_goal: existingBrief?.customer_goal && existingBrief.customer_goal !== "Unknown"
        ? existingBrief.customer_goal
        : `Restore the ${item.toLowerCase()} to safe, normal working condition`,
      dynamic_details: {
        ...(existingBrief?.dynamic_details || {}),
        selected_issue_type: input.category_hint || null,
        issue_type_source: input.category_hint ? "user_selected" : "ai_inferred",
      },
    },
    is_complete: enough,
    missing_questions: missingQuestions.slice(0, 3),
  };
}

export async function createProblemAnalysis(input: Input): Promise<ProblemAnalysis> {
  const existingBrief = input.existing_problem_brief || input.existing_brief;
  const analysis = process.env.AI_DEMO_MODE === "true" || !process.env.QWEN_API_KEY
    ? demoAnalysis(input)
    : await generateStructured({
    baseURL: process.env.QWEN_BASE_URL || "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
    apiKey: process.env.QWEN_API_KEY,
    model: process.env.QWEN_MODEL || "qwen3-vl-flash",
    schema: ProblemAnalysisSchema,
    system: problemBriefSystemPrompt,
    input: {
      selected_property: input.property,
      description: input.description,
      selected_issue_type: input.category_hint,
      category_hint: input.category_hint,
      existing_problem_brief: existingBrief,
      clarification_history: input.clarification_history,
      new_clarification: input.clarification,
    },
    userContent: [
      {
        type: "text",
        text: JSON.stringify({
          selected_property: input.property,
          description: input.description,
          selected_issue_type: input.category_hint,
          category_hint: input.category_hint,
          existing_problem_brief: existingBrief,
          clarification_history: input.clarification_history,
          new_clarification: input.clarification,
        }),
      },
      ...(input.image_data_urls || []).slice(0, 4).map((url) => ({ type: "image_url", image_url: { url } })),
    ],
    });

  const askedBefore = new Set((input.clarification_history || []).map(({ question }) => normaliseQuestion(question)));
  const missingQuestions = analysis.missing_questions.filter((question) => !askedBefore.has(normaliseQuestion(question)));

  // Unknown is an accepted value. Do not trap the homeowner in a loop when the model only repeats answered questions.
  if (!analysis.is_complete && askedBefore.size > 0 && missingQuestions.length === 0) {
    return { ...analysis, is_complete: true, missing_questions: [] };
  }
  return { ...analysis, missing_questions: missingQuestions };
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
