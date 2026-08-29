import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { Daytona } from "@daytona/sdk";

const REPOSITORY_URL = process.env.DAYTONA_REPO_URL ?? "https://github.com/DavidOng122/RenoAi.git";
const REPOSITORY_PATH = "workspace/RenoAi";
const BRANCH = process.env.DAYTONA_REPO_BRANCH ?? "main";
const COMMAND = "node scripts/validate-pricing.mjs";

async function loadDaytonaEnvironment() {
  try {
    const contents = await readFile(resolve(".env.local"), "utf8");

    for (const line of contents.split(/\r?\n/)) {
      const match = line.match(/^\s*(DAYTONA_[A-Z_]+)\s*=\s*(.*?)\s*$/);
      if (!match || process.env[match[1]]) continue;

      const [, name, rawValue] = match;
      const value = rawValue.replace(/^(?:"|')|(?:"|')$/g, "");
      if (value) process.env[name] = value;
    }
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
}

async function main() {
  await loadDaytonaEnvironment();

  if (!process.env.DAYTONA_API_KEY) {
    throw new Error("DAYTONA_API_KEY is missing. Add it to .env.local or set it in this terminal session.");
  }

  const daytona = new Daytona();
  const sandbox = await daytona.create({ language: "typescript" });
  console.log(`Created Daytona sandbox: ${sandbox.id}`);
  console.log(`Cloning ${REPOSITORY_URL} (${BRANCH})…`);

  await sandbox.git.clone(REPOSITORY_URL, REPOSITORY_PATH, BRANCH);

  console.log("Running the production pricing knowledge-base validator…");
  const result = await sandbox.process.executeCommand(COMMAND, REPOSITORY_PATH, undefined, 120);
  if (result.result) console.log(result.result);

  if (result.exitCode !== 0) {
    throw new Error(`Pricing validation failed with exit code ${result.exitCode}. Sandbox: ${sandbox.id}`);
  }

  console.log(`Pricing validation passed. Sandbox remains available for inspection: ${sandbox.id}`);
  console.log("Delete the sandbox from the Daytona dashboard when you no longer need it.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
