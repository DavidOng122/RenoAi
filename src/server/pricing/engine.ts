import type { ProblemBrief } from "@/schemas/problem-brief.schema";
import type { PriceResult } from "@/schemas/price-result.schema";
import { matchPriceRow } from "./matcher";
import { getPriceRows } from "./repository";

export async function estimatePrice(brief: ProblemBrief): Promise<PriceResult> {
  const rows = await getPriceRows();
  const match = matchPriceRow(brief, rows);
  if (!match) return { estimated_min_price: null, estimated_max_price: null, currency: "SGD", available: false };
  return {
    estimated_min_price: match.estimated_min_price,
    estimated_max_price: match.estimated_max_price,
    currency: match.currency,
    available: true,
  };
}
