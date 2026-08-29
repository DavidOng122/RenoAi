import type { ProblemBrief } from "@/schemas/problem-brief.schema";
import type { PriceKnowledgeRow } from "./repository";

type ScoredMatch = { row: PriceKnowledgeRow; score: number };

const STOP_WORDS = new Set(["a", "an", "and", "at", "for", "from", "in", "is", "of", "on", "the", "to", "with"]);

function normalise(value: string) {
  return value
    .toLowerCase()
    .replace(/won't/g, "will not")
    .replace(/can't/g, "cannot")
    .replace(/doesn't/g, "does not")
    .replace(/\brubs?\b/g, "rubbing")
    .replace(/\bscrapes?\b/g, "scraping")
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter((word) => word && !STOP_WORDS.has(word))
    .join(" ");
}

function includesPhrase(text: string, phrase: string) {
  return ` ${text} `.includes(` ${phrase} `);
}

function bestPhraseScore(text: string, phrases: string[], weight: number) {
  return phrases.reduce((best, phrase) => {
    const normalisedPhrase = normalise(phrase);
    if (!normalisedPhrase || !includesPhrase(text, normalisedPhrase)) return best;
    return Math.max(best, normalisedPhrase.split(" ").length * weight);
  }, 0);
}

export function matchPriceRow(brief: ProblemBrief, rows: PriceKnowledgeRow[]) {
  const itemText = normalise(brief.affected_item);
  const problemText = normalise([brief.observed_problem, brief.condition, ...Object.values(brief.dynamic_details).map(String)].filter(Boolean).join(" "));

  const candidates: ScoredMatch[] = rows.flatMap((row) => {
    const itemScore = bestPhraseScore(itemText, row.affected_item, 2);
    const symptomScore = bestPhraseScore(problemText, row.keywords, 10);

    // A repair type is only priceable when both the item and a specific symptom match.
    if (!itemScore || !symptomScore) return [];
    return [{ row, score: itemScore + symptomScore }];
  }).sort((left, right) => right.score - left.score);

  const [best, second] = candidates;
  if (!best) return undefined;

  // Do not use JSON file order as an implicit tie-breaker. Close competing jobs are ambiguous.
  if (second && second.score >= best.score - 2) return undefined;
  return best.row;
}
