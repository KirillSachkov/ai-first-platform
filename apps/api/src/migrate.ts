// One-shot migration run: applies every module's migrations as the schema-owning role, then exits.
// Each module keeps its migration history in its own Postgres schema (ADR-0003).
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import type { Config as DrizzleKitConfig } from "drizzle-kit";
import { pathToFileURL } from "node:url";
import { Pool } from "pg";

import { moduleDrizzleConfigs } from "./module-drizzle-configs.js";
import { parseMigrationsConfig } from "./shared/config/config.js";

const config = parseMigrationsConfig(process.env);
const pool = new Pool({ connectionString: config.databaseUrl });
const db = drizzle({ client: pool });

try {
  for (const configPath of await moduleDrizzleConfigs()) {
    const { default: kit } = (await import(pathToFileURL(configPath).href)) as {
      default: DrizzleKitConfig & { out: string; migrations: { schema: string; table: string } };
    };
    const { schema, table } = kit.migrations;
    await migrate(db, {
      migrationsFolder: kit.out,
      migrationsSchema: schema,
      migrationsTable: table,
    });
    // Default privileges give the application role data access to every table the owner creates;
    // the migration history is not application data.
    const appRole = sql.identifier(config.appRole);
    await db.execute(
      sql`REVOKE ALL ON TABLE ${sql.identifier(schema)}.${sql.identifier(table)} FROM ${appRole}`,
    );
    await db.execute(
      sql`REVOKE ALL ON SEQUENCE ${sql.identifier(schema)}.${sql.identifier(`${table}_id_seq`)} FROM ${appRole}`,
    );
    console.log(`Migrated schema ${schema}`);
  }
} finally {
  await pool.end();
}
