# RenoAI

**A mobile-first repair triage assistant for Singapore homes.**

RenoAI turns an unclear repair report — a short message, a few photos, and an optional issue category — into a structured, homeowner-confirmed brief with a likely diagnosis, urgency, recommended work, expected duration, and a grounded SGD price range.

[Live demo](https://reno-ai-three.vercel.app) · [Architecture](docs/architecture.md)

## The problem

Home repair requests often begin with incomplete information: “the door is broken,” “the light stopped working,” or “there is water on the floor.” Homeowners may not know what details matter, how urgent the issue is, what a reasonable price looks like, or how to explain the job to a contractor.

That creates three avoidable problems:

- contractors spend time asking the same basic questions;
- homeowners receive inconsistent or difficult-to-compare quotes;
- an unconstrained AI can sound confident while inventing repair facts or prices.

## The solution

RenoAI creates a clear decision boundary between AI interpretation and price estimation:

1. The homeowner selects a property and describes the issue using text and visual evidence.
2. Qwen extracts a structured `ProblemBrief` and asks only the missing questions that could change the repair decision.
3. The homeowner edits and confirms the brief before any final assessment is generated.
4. Two independent processes run in parallel:
   - the Repair Agent produces the likely issue, urgency, scope, duration, and confidence;
   - the deterministic Price Engine matches the confirmed facts against a reviewed Singapore pricing knowledge base.
5. Both results are merged into one canonical `ProjectBrief` for the homeowner view, request history, contractor view, and printable PDF.

## Why RenoAI is different

### AI does not decide the price

Qwen never generates a price. The Price Engine requires both an affected-item match and a specific symptom match. If the evidence is ambiguous or two repair jobs score too closely, RenoAI returns **price unavailable** instead of guessing.

### The homeowner remains in control

The AI-generated brief is editable and requires explicit confirmation. The final assessment is based on that confirmed brief, not on hidden assumptions from the original conversation.

### One brief, multiple audiences

The homeowner result and contractor-ready view render the same `ProjectBrief`. No new diagnosis, scope, or pricing facts are invented when the view changes.

### Designed for real mobile use

The complete journey — Google sign-in, property setup, evidence capture, clarification, review, analysis, saved requests, and contractor handoff — is designed mobile-first.

## Product flow

```text
Property + text + photos + category hint
                    │
                    ▼
       Qwen structured extraction
                    │
          Missing critical detail?
             │ yes        │ no
             ▼            │
      One question at      │
          a time           │
             └──────┬──────┘
                    ▼
      Homeowner-confirmed ProblemBrief
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
   Qwen Repair Agent   Deterministic Price Engine
          │                   │
          └─────────┬─────────┘
                    ▼
             ProjectBrief
          ┌─────────┼─────────┐
          ▼         ▼         ▼
      User view  Requests  Contractor view / PDF
```

## Pricing knowledge base

The pricing pipeline deliberately separates raw research from production data:

| Stage | Records |
| --- | ---: |
| Raw internal and external records | 348 |
| Normalized repair jobs | 100 |
| Production-ready jobs | 51 |
| Held for human review | 49 |

Production coverage currently includes doors, plumbing, electrical work, walls and ceilings, air-conditioning, and common household repairs. The reviewed dataset is stored in Supabase for production and bundled locally as a resilient fallback. A generator keeps the database migration reproducible from the versioned knowledge file.

## Architecture

RenoAI uses typed boundaries rather than a single free-form agent:

```text
ProblemAnalysis
    └── ProblemBrief (user confirmed)
            ├── RepairResult  ← Qwen
            └── PriceResult   ← deterministic matcher
                    │
                    └── ProjectBrief
```

- **Structured output:** Zod validates every AI and API boundary.
- **Parallel analysis:** repair reasoning and pricing run independently from the same confirmed input.
- **Persistent records:** properties and repair requests sync through Supabase.
- **Private evidence:** uploads use signed Supabase Storage URLs and owner-scoped paths.
- **Authentication:** Auth.js handles Google OAuth; application secrets remain server-side.
- **Resilient pricing:** Supabase is the production source, with a validated bundled fallback.

## Tech stack

| Layer | Technology |
| --- | --- |
| Web application | Next.js 16, React 19, TypeScript |
| AI | Qwen Vision-Language model through an OpenAI-compatible endpoint |
| Validation | Zod |
| Authentication | Auth.js with Google OAuth |
| Database and storage | Supabase Postgres, Row Level Security, Supabase Storage |
| Deployment | Vercel |
| Pricing validation | Versioned JSON data, reproducible SQL migration, optional Daytona sandbox workflow |

## Run locally

Requirements: Node.js 20+ and a Google OAuth web client.

```bash
git clone https://github.com/DavidOng122/RenoAi.git
cd RenoAi
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Minimum local configuration:

```dotenv
AUTH_SECRET=replace_with_a_long_random_value
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret

# Use the deterministic demo repair flow without a Qwen key.
AI_DEMO_MODE=true
```

To enable the live Qwen pipeline:

```dotenv
QWEN_API_KEY=your_qwen_api_key
QWEN_BASE_URL=https://dashscope-intl.aliyuncs.com/compatible-mode/v1
QWEN_MODEL=qwen3-vl-flash
AI_DEMO_MODE=false
```

To enable cloud records, evidence storage, and the production price source:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Apply the migrations in `supabase/migrations` before using Supabase-backed features. Never commit `.env.local`, and never expose `QWEN_API_KEY`, `AUTH_SECRET`, or OAuth client secrets through `NEXT_PUBLIC_*` variables.

## Useful commands

```bash
npm run dev                       # Start the local development server
npm run build                     # Run the production build and type checks
npm run generate:price-migration  # Rebuild the Supabase price migration
node scripts/validate-pricing.mjs # Validate all production pricing rows
```

## Repository map

```text
src/app                 Pages and API routes
src/features            UI organized by product flow
src/schemas             Shared Zod contracts
src/server/ai           Qwen client, prompts, and structured generation
src/server/pipeline     Confirmed-brief orchestration
src/server/pricing      Deterministic matching and Supabase repository
src/server/supabase.ts  Owner-scoped database and storage clients
data/pricing            Raw, normalized, reviewed, and production price data
supabase/migrations     Database, RLS, storage, and pricing migrations
docs/architecture.md    Route map, ownership rules, and request lifecycle
```

## Current scope

RenoAI is a decision-support MVP, not a contractor marketplace and not a substitute for an on-site professional inspection. Price ranges are indicative, safety-sensitive cases should be handled by qualified tradespeople, and low-confidence cases are surfaced rather than hidden.
