// `pnpm verify`: the check an agent runs before a pull request. Static checks, then the Vitest tests
// of the apps the branch changes relative to main (changed-parts.mjs decides). No E2E, no smoke.
// `pnpm verify:full` (`--full`): the main level of CI on this machine. All tests, E2E, smoke,
// dependency audit, and gitleaks over the whole history.
import { execFileSync } from "node:child_process";

import { changedParts } from "./changed-parts.mjs";

const apps = { api: "@platform/api", web: "@platform/web" };

try {
  run("pnpm", "check");
  run("pnpm", "test:scripts");
  if (process.argv.includes("--full")) {
    run("pnpm", "test");
    run("pnpm", "test:e2e");
    run("pnpm", "smoke");
    run("pnpm", "audit", "--audit-level", "high");
    run("gitleaks", "git", "--redact", "--no-banner", ".");
  } else {
    const base = mainBase();
    const parts = changedParts(changedFiles(base));
    const filters = Object.entries(apps)
      .filter(([part]) => parts[part])
      .flatMap(([, name]) => ["--filter", name]);
    if (filters.length === 0) {
      console.log(`\nNo app changes since ${base}; Vitest tests skipped.`);
    } else {
      run("pnpm", ...filters, "test");
    }
  }
  console.log("\nverify passed.");
} catch (error) {
  console.error(`\nverify failed: ${error.message}`);
  process.exitCode = 1;
}

function run(command, ...args) {
  console.log(`\n> ${command} ${args.join(" ")}`);
  try {
    execFileSync(command, args, { stdio: "inherit" });
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new Error(`${command} is not installed`, { cause: error });
    }
    throw new Error(`${command} ${args.join(" ")} exited with ${error.status}`, { cause: error });
  }
}

function git(...args) {
  return execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
}

// The fork point from main: origin/main when the remote is known, the local main otherwise.
function mainBase() {
  for (const ref of ["origin/main", "main"]) {
    try {
      return git("merge-base", "HEAD", ref).trim();
    } catch {
      // Try the next reference.
    }
  }
  throw new Error("cannot find main or origin/main to compare with");
}

// Committed, staged, unstaged, and untracked changes since the fork point.
function changedFiles(base) {
  const tracked = git("diff", "--name-only", base);
  const untracked = git("ls-files", "--others", "--exclude-standard");
  return `${tracked}${untracked}`.split("\n").filter(Boolean);
}
