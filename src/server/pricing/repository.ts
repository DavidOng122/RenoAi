import rows from "../../../data/pricing/price-knowledge-base.json";

export type PriceKnowledgeRow = {
  job_code: string;
  affected_item: string[];
  keywords: string[];
  estimated_min_price: number;
  estimated_max_price: number;
  currency: "SGD";
};

export function getPriceRows(): PriceKnowledgeRow[] { return rows; }
