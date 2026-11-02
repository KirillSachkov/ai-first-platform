// Applies every module's migrations as the schema-owning role.
// Each module keeps its migration history in its own Postgres schema (ADR-0003).
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { Pool } from "pg";
import { z } from "zod";

import { apiRoot, moduleDrizzleConfigs } from "./module-drizzle-configs.js";

/** Where a module keeps its migrations and their history. */
export type ModuleMigrations = Readonly<{ folder: string; schema: string; table: string }>;

// The parts of a module's drizzle-kit config that the migration run needs.
const drizzleConfigModuleSchema = z.object({
  default: z.object({
    out: z.string(),
    migrations: z.object({ schema: z.string(), table: z.string() }),
  }),
});

/** Every module's migrations, in a stable order. */
export async function moduleMigrations(): Promise<ModuleMigrations[]> {
  const configPaths = await moduleDrizzleConfigs();
  const configs = await Promise.all(
    configPaths.map(async (configPath) => {
      const url = pathToFileURL(path.resolve(apiRoot, configPath)).href;
      return drizzleConfigModuleSchema.parse(await import(url)).default;
    }),
  );
  return configs.map(({ out, migrations }) => ({
    folder: path.resolve(apiRoot, out),
    schema: migrations.schema,
    table: migrations.table,
  }));
}

/**
 * Connects to `databaseUrl` as the schema owner and migrates every module. Default privileges give
 * `appRole` data access to every table the owner creates; this revokes it from the migration
 * history, which is not application data.
 */
export async function migrateModules(
  options: Readonly<{
    databaseUrl: string;
    appRole: string;
    onMigrated?: (schema: string) => void;
  }>,
): Promise<void> {
  const pool = new Pool({ connectionString: options.databaseUrl });
  const db = drizzle({ client: pool });
  try {
    // Modules migrate one at a time, in a stable order, so a failure names the module and stops the run.
    /* oxlint-disable eslint/no-await-in-loop -- sequential by design, see above */
    for (const migrations of await moduleMigrations()) {
      await migrate(db, {
        migrationsFolder: migrations.folder,
        migrationsSchema: migrations.schema,
        migrationsTable: migrations.table,
      });
      await revokeHistory(db, migrations, options.appRole);
      options.onMigrated?.(migrations.schema);
    }
    /* oxlint-enable eslint/no-await-in-loop */
  } finally {
    await pool.end();
  }
}

async function revokeHistory(
  db: NodePgDatabase,
  { schema, table }: ModuleMigrations,
  role: string,
): Promise<void> {
  const appRole = sql.identifier(role);
  const history = sql`${sql.identifier(schema)}.${sql.identifier(table)}`;
  await db.execute(sql`REVOKE ALL ON TABLE ${history} FROM ${appRole}`);
  const { rows } = await db.execute<{ sequence: string | null }>(
    sql`SELECT pg_get_serial_sequence(${`"${schema}"."${table}"`}, 'id') AS sequence`,
  );
  const sequence = rows[0]?.sequence;
  if (typeof sequence === "string" && sequence !== "") {
    await db.execute(sql`REVOKE ALL ON SEQUENCE ${sql.raw(sequence)} FROM ${appRole}`);
  }
}
