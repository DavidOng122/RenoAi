import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const inputPath = join(projectRoot, "data", "pricing", "price-knowledge-base.json");
const outputPath = join(projectRoot, "supabase", "migrations", "202608290002_price_knowledge.sql");
const rows = JSON.parse(readFileSync(inputPath, "utf8"));

const sqlString = (value) => `'${String(value).replaceAll("'", "''")}'`;
const sqlArray = (values) => `array[${values.map(sqlString).join(", ")}]::text[]`;

const values = rows.map((row, index) => `(
  ${sqlString(row.job_code)},
  ${index},
  ${sqlArray(row.affected_item)},
  ${sqlArray(row.keywords)},
  ${Number(row.estimated_min_price)},
  ${Number(row.estimated_max_price)},
  ${sqlString(row.currency)}
)`).join(",\n");

const migration = `create table if not exists public.reno_price_knowledge (
  job_code text primary key,
  sort_order integer not null default 0,
  affected_item text[] not null default '{}',
  keywords text[] not null default '{}',
  estimated_min_price integer not null check (estimated_min_price >= 0),
  estimated_max_price integer not null check (estimated_max_price >= estimated_min_price),
  currency text not null default 'SGD',
  updated_at timestamptz not null default now()
);

alter table public.reno_price_knowledge
add column if not exists sort_order integer not null default 0;

alter table public.reno_price_knowledge enable row level security;

grant select on public.reno_price_knowledge to anon;

drop policy if exists "Public read access to RenoAI price knowledge" on public.reno_price_knowledge;
create policy "Public read access to RenoAI price knowledge"
on public.reno_price_knowledge for select to anon
using (true);

insert into public.reno_price_knowledge (
  job_code,
  sort_order,
  affected_item,
  keywords,
  estimated_min_price,
  estimated_max_price,
  currency
)
values
${values}
on conflict (job_code) do update set
  sort_order = excluded.sort_order,
  affected_item = excluded.affected_item,
  keywords = excluded.keywords,
  estimated_min_price = excluded.estimated_min_price,
  estimated_max_price = excluded.estimated_max_price,
  currency = excluded.currency,
  updated_at = now();
`;

writeFileSync(outputPath, migration);
console.log(`Wrote ${rows.length} price rows to ${outputPath}`);
