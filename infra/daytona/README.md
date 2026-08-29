# Daytona pricing validation worker

Daytona is used only for the offline pricing-data workflow. It must not run in the RenoAI request path and must not produce user-facing price estimates.

The repo now includes a real Daytona launcher. From the repository root, run:

```bash
npm run daytona:validate-pricing
```

It creates an isolated TypeScript sandbox, clones the public `main` branch of this repository into it, then runs `node scripts/validate-pricing.mjs` there. The job validates the production pricing database before a human reviewer merges it. It does not read `price-needs-review.json` and does not modify `price-knowledge-base.json`.

Required Daytona secret:

```text
DAYTONA_API_KEY
```

Optional settings are `DAYTONA_API_URL` (defaults to Daytona's cloud API), `DAYTONA_TARGET` (for example, `us`) and `DAYTONA_REPO_BRANCH` (defaults to `main`). The launcher reads only `DAYTONA_*` entries from `.env.local`; it never sends any application, Qwen, Supabase, or OAuth secret to the sandbox.

The sandbox is intentionally retained after a run so its logs can be inspected. Delete it from the Daytona dashboard when finished. Keep the sandbox API key outside the repository and outside browser-exposed environment variables.
