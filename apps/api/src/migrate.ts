// One-shot migration run: applies every module's migrations as the schema-owning role, then exits.
// Each module keeps its migration history in its own Postgres schema (ADR-0003).
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { pathToFileURL } from "node:url";
import { Pool } from "pg";
import { z } from "zod";

import { moduleDrizzleConfigs } from "./module-drizzle-configs.js";
import { parseMigrationsConfig } from "./shared/config/config.js";

const config = parseMigrationsConfig(process.env);
const pool = new Pool({ connectionString: config.databaseUrl });
const db = drizzle({ client: pool });

// The parts of a module's drizzle-kit config that the migration run needs.
const drizzleConfigModuleSchema = z.object({
  default: z.object({
    out: z.string(),
    migrations: z.object({ schema: z.string(), table: z.string() }),
  }),
});

try {
  // Modules migrate one at a time, in a stable order, so a failure names the module and stops the run.
  /* oxlint-disable eslint/no-await-in-loop -- sequential by design, see above */
  for (const configPath of await moduleDrizzleConfigs()) {
    const { default: kit } = drizzleConfigModuleSchema.parse(
      await import(pathToFileURL(configPath).href),
    );
    const { schema, table } = kit.migrations;
    await migrate(db, {
      migrationsFolder: kit.out,
      migrationsSchema: schema,
      migrationsTable: table,
    });
    // Default privileges give the application role data access to every table the owner creates;
    // the migration history is not application data.
    const appRole = sql.identifier(config.appRole);
    const history = sql`${sql.identifier(schema)}.${sql.identifier(table)}`;
    await db.execute(sql`REVOKE ALL ON TABLE ${history} FROM ${appRole}`);
    const { rows } = await db.execute<{ sequence: string | null }>(
      sql`SELECT pg_get_serial_sequence(${`"${schema}"."${table}"`}, 'id') AS sequence`,
    );
    const sequence = rows[0]?.sequence;
    if (typeof sequence === "string" && sequence !== "") {
      await db.execute(sql`REVOKE ALL ON SEQUENCE ${sql.raw(sequence)} FROM ${appRole}`);
    }
    console.log(`Migrated schema ${schema}`);
  }
  /* oxlint-enable eslint/no-await-in-loop */
} finally {
  await pool.end();
}
