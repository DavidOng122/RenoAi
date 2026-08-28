import type { ZodType } from "zod";

export async function generateStructured<T>({ baseURL, apiKey, model, system, input, schema, userContent }: {
  baseURL: string; apiKey: string; model: string; system: string; input: unknown; schema: ZodType<T>; userContent?: unknown;
}): Promise<T> {
  const response = await fetch(`${baseURL.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: `${system}\nReturn one valid JSON object. No markdown fences.` },
        { role: "user", content: userContent || JSON.stringify(input) },
      ],
    }),
  });
  if (!response.ok) throw new Error(`AI provider returned ${response.status}: ${await response.text()}`);
  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content !== "string") throw new Error("AI provider returned no JSON content");
  return schema.parse(JSON.parse(content.replace(/^```json\s*|\s*```$/g, "")));
}
