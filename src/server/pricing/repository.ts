import "server-only";

import localRows from "../../../data/pricing/price-knowledge-base.json";
import { createRenoPublicSupabase } from "@/server/supabase";

export type PriceKnowledgeRow = {
  job_code: string;
  affected_item: string[];
  keywords: string[];
  estimated_min_price: number;
  estimated_max_price: number;
  currency: "SGD";
};

let cachedRemoteRows: PriceKnowledgeRow[] | undefined;
let remoteRowsPromise: Promise<PriceKnowledgeRow[]> | undefined;

function isPriceRow(row: unknown): row is PriceKnowledgeRow {
  if (!row || typeof row !== "object") return false;
  const candidate = row as Partial<PriceKnowledgeRow>;
  return (
    typeof candidate.job_code === "string"
    && Array.isArray(candidate.affected_item)
    && candidate.affected_item.every((item) => typeof item === "string")
    && Array.isArray(candidate.keywords)
    && candidate.keywords.every((keyword) => typeof keyword === "string")
    && typeof candidate.estimated_min_price === "number"
    && typeof candidate.estimated_max_price === "number"
    && candidate.currency === "SGD"
  );
}

const bundledRows = localRows.filter(isPriceRow);

async function loadRemoteRows() {
  const { data, error } = await createRenoPublicSupabase()
    .from("reno_price_knowledge")
    .select("job_code, affected_item, keywords, estimated_min_price, estimated_max_price, currency")
    .order("sort_order");

  if (error) throw error;
  if (!data?.length) throw new Error("Supabase price knowledge table is empty");
  if (!data.every(isPriceRow)) throw new Error("Supabase price knowledge has an invalid row");
  return data;
}

export async function getPriceRows(): Promise<PriceKnowledgeRow[]> {
  if (cachedRemoteRows) return cachedRemoteRows;

  remoteRowsPromise ??= loadRemoteRows()
    .then((rows) => {
      cachedRemoteRows = rows;
      return rows;
    })
    .catch((error: unknown) => {
      remoteRowsPromise = undefined;
      throw error;
    });

  try {
    return await remoteRowsPromise;
  } catch (error) {
    console.error("Unable to load Supabase price knowledge; using bundled fallback.", error);
    return bundledRows;
  }
}
