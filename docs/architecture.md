# RenoAi MVP architecture

## Route map

| User flow | Route |
| --- | --- |
| First property setup | `/onboarding` |
| Property selection and repair input | `/home` / `/repair/new` |
| Complete missing problem details | `/repair/[requestId]/clarify` |
| Review and confirm the Problem Brief | `/repair/[requestId]/review` |
| Analysis progress | `/repair/[requestId]/processing` |
| Homeowner result | `/repair/[requestId]/result` |
| Request list and request detail | `/requests` / `/requests/[requestId]` |
| Contractor-ready display | `/requests/[requestId]/contractor` |

## Data ownership

1. Qwen generates `ProblemBrief` and checks completeness from selected property, description, evidence, and the optional category hint.
2. The homeowner may edit the Problem Brief, then confirms it before analysis begins.
3. Qwen receives only the confirmed Problem Brief and produces `RepairResult`; it never calculates prices.
4. The Price Engine receives the same confirmed Problem Brief and produces `PriceResult` without an LLM or RepairResult input.
5. Both results merge into a single canonical `ProjectBrief`.
6. User view, contractor view, and PDF render `ProjectBrief` without adding new repair facts.

## Request lifecycle

`draft -> collecting_info -> review -> analysing -> ready`

## Directory ownership

- `src/app`: page and API route entry points.
- `src/features`: flow-specific UI modules.
- `src/server`: AI clients, orchestration, pricing, PDF, data access, and storage.
- `src/schemas`: shared application contracts.
- `src/components`: reusable UI primitives.
- `src/lib`: client utilities and environment configuration.
- `data/pricing`: MVP pricing knowledge data.
- `tests`: tests grouped by domain and pipeline.
