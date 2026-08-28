import type { ProblemBrief } from "@/schemas/problem-brief.schema";
import type { PriceKnowledgeRow } from "./repository";

export function matchPriceRow(brief: ProblemBrief, rows: PriceKnowledgeRow[]) {
  const itemText = brief.affected_item.toLowerCase();
  const problemText = `${brief.observed_problem} ${brief.condition || ""} ${Object.values(brief.dynamic_details).join(" ")}`.toLowerCase();
  return rows.map((row) => ({ row, score: row.affected_item_terms.filter((term) => itemText.includes(term.toLowerCase())).length * 3 + row.problem_terms.filter((term) => problemText.includes(term.toLowerCase())).length }))
    .filter(({ score }) => score >= 4).sort((a, b) => b.score - a.score)[0]?.row;
}
