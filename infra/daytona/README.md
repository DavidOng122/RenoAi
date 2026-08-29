# Daytona pricing validation worker

Daytona is used only for the offline pricing-data workflow. It must not run in the RenoAI request path and must not produce user-facing price estimates.

Create a Daytona sandbox from this repository, then execute:

```bash
node scripts/validate-pricing.mjs
```

The job validates the production pricing database before a human reviewer merges it. It does not read `price-needs-review.json` and does not modify `price-knowledge-base.json`.

Required Daytona secret:

```text
DAYTONA_API_KEY
```

Use the Daytona dashboard or SDK to create the sandbox. Keep the sandbox API key outside the repository and outside browser-exposed environment variables.
