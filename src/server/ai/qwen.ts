import { ProblemAnalysisSchema, type ProblemAnalysis } from "@/schemas/problem-brief.schema";
import type { Property } from "@/schemas/property.schema";
import { problemBriefSystemPrompt } from "./prompts/problem-brief";
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
