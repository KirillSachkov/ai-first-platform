// Decides which parts of the repository a change affects: which app tests, E2E, and the dependency
// audit to run. `pnpm verify` imports it. The CI `changes` job pipes the list of changed files into
// it and gets `part=true|false` lines for $GITHUB_OUTPUT. Markdown files never trigger tests.
import { text } from "node:stream/consumers";

const lockfile = "pnpm-lock.yaml";

// Files every app builds or tests with. A change here runs the tests of both apps.
const sharedFiles = new Set([
  lockfile,
  "pnpm-workspace.yaml",
  "package.json",
  ".pnpmfile.cjs",
  ".node-version",
  "knip.jsonc",
]);
// Shared tsconfig, oxlint and Prettier packages, and the CI itself.
const sharedDirectories = ["packages/", ".github/workflows/", ".github/actions/"];

// The Compose stack and the tests that run against it.
const stackFiles = new Set([
  "compose.yaml",
  ".env.example",
  ".dockerignore",
  "scripts/smoke.mjs",
  "scripts/with-stack-lock.mjs",
]);
const stackDirectories = ["e2e/", "infra/"];

export function changedParts(files) {
  const code = files.filter((file) => !file.endsWith(".md"));
  const shared = code.some(
    (file) => sharedFiles.has(file) || sharedDirectories.some((dir) => file.startsWith(dir)),
  );
  const api = shared || code.some((file) => file.startsWith("apps/api/"));
  const web = shared || code.some((file) => file.startsWith("apps/web/"));
  const stack = code.some(
    (file) => stackFiles.has(file) || stackDirectories.some((dir) => file.startsWith(dir)),
  );
  return { api, web, e2e: api || web || stack, lockfile: code.includes(lockfile) };
}

if (import.meta.main) {
  const files = (await text(process.stdin)).split("\n").filter(Boolean);
  for (const [part, affected] of Object.entries(changedParts(files))) {
    console.log(`${part}=${affected}`);
  }
}
