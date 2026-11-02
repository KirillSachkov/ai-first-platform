import { defineConfig, devices } from "@playwright/test";

// The stack reads its host ports from the root .env, the same file Docker Compose uses.
// Without the file, global-setup.ts explains how to create it.
try {
  process.loadEnvFile(new URL("../.env", import.meta.url));
} catch {
  // Defaults below match .env.example.
}
const isCi = Boolean(process.env.CI);

export default defineConfig({
  testDir: "./tests",
  // Starts the stack with Docker Compose. Set E2E_STACK=external when the stack is already up (CI step).
  globalSetup: "./global-setup.ts",
  // A test that passes only on a retry is a bug: fix it instead of retrying.
  retries: 0,
  failOnFlakyTests: true,
  forbidOnly: true,
  workers: isCi ? 1 : "50%",
  fullyParallel: true,
  reporter: isCi ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://127.0.0.1:${process.env.WEB_HOST_PORT ?? "5173"}`,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
