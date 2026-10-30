// Generates a migration for every module whose Drizzle schema changed.
// Each module has its own drizzle-kit config, migrations folder and history table (ADR-0003).
import { execFileSync } from "node:child_process";

import { moduleDrizzleConfigs } from "../src/shared/database/module-drizzle-configs.js";

for (const configPath of await moduleDrizzleConfigs()) {
  execFileSync("drizzle-kit", ["generate", "--config", configPath, ...process.argv.slice(2)], {
    stdio: "inherit",
  });
}
