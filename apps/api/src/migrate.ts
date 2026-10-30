// One-shot migration run: applies every module's migrations as the schema-owning role, then exits.
// Each module keeps its migration history in its own Postgres schema (ADR-0003).
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import type { Config as DrizzleKitConfig } from "drizzle-kit";
import { pathToFileURL } from "node:url";
import { Pool } from "pg";

import { parseMigrationsConfig } from "./shared/config/config.js";
import { moduleDrizzleConfigs } from "./shared/database/module-drizzle-configs.js";

const config = parseMigrationsConfig(process.env);
const pool = new Pool({ connectionString: config.databaseUrl });
const db = drizzle({ client: pool });

try {
  for (const configPath of await moduleDrizzleConfigs()) {
    const { default: kit } = (await import(pathToFileURL(configPath).href)) as {
      default: DrizzleKitConfig & { out: string; migrations: { schema: string; table: string } };
    };
    await migrate(db, {
      migrationsFolder: kit.out,
      migrationsSchema: kit.migrations.schema,
      migrationsTable: kit.migrations.table,
    });
    console.log(`Migrated schema ${kit.migrations.schema}`);
  }
} finally {
  await pool.end();
}
