import { readFile } from "node:fs/promises";

const file = new URL("../data/pricing/price-knowledge-base.json", import.meta.url);
const rows = JSON.parse(await readFile(file, "utf8"));
const codes = new Set();

for (const [index, row] of rows.entries()) {
  const label = `Record ${index + 1}`;
  if (!row.job_code || codes.has(row.job_code)) throw new Error(`${label}: job_code must be present and unique.`);
  if (!Array.isArray(row.affected_item) || row.affected_item.length === 0) throw new Error(`${label}: affected_item must be a non-empty array.`);
  if (!Array.isArray(row.keywords) || row.keywords.length === 0) throw new Error(`${label}: keywords must be a non-empty array.`);
  if (!Number.isFinite(row.estimated_min_price) || !Number.isFinite(row.estimated_max_price) || row.estimated_min_price < 0 || row.estimated_max_price < row.estimated_min_price) throw new Error(`${label}: invalid price range.`);
  if (row.currency !== "SGD") throw new Error(`${label}: currency must be SGD.`);
  codes.add(row.job_code);
}

console.log(`Validated ${rows.length} production pricing jobs with ${codes.size} unique job codes.`);
