import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";

const repoRoot = new URL("..", import.meta.url);

/**
 * Starts the stack from compose.yaml and waits until every service is healthy. The stack keeps
 * running after the tests, as after `pnpm smoke`; stop it with `docker compose down`.
 * With E2E_STACK=external the setup does nothing: CI starts the stack in its own step.
 */
export default function globalSetup(): void {
  if (process.env.E2E_STACK === "external") {
    return;
  }
  if (!existsSync(new URL(".env", repoRoot))) {
    throw new Error("No .env in the repository root. Create it with `cp .env.example .env`.");
  }
  execFileSync("docker", ["compose", "up", "--build", "--detach", "--wait"], {
    cwd: repoRoot,
    stdio: "inherit",
  });
}
