import rows from "../../../data/pricing/price-knowledge-base.json";

export type PriceKnowledgeRow = (typeof rows)[number];
export function getPriceRows(): PriceKnowledgeRow[] { return rows; }
