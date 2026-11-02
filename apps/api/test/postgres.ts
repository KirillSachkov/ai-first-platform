// Test databases on the shared PostgreSQL container.
import { Client } from "pg";

import { moduleMigrations } from "../src/migrate-modules.js";
import { connectionUrl, namePrefix } from "./infra.js";
import type { Credentials, PostgresServer } from "./infra.js";

export function postgresUrl(server: PostgresServer, user: Credentials, database: string): string {
  return connectionUrl({
    scheme: "postgres",
    user,
    host: server.host,
    port: server.port,
    path: database,
  });
}

/** Runs `work` with an owner connection to `database`, by default the maintenance database. */
export async function withOwnerClient<Result>(
  server: PostgresServer,
  work: (client: Client) => Promise<Result>,
  database = "postgres",
): Promise<Result> {
  const client = new Client({ connectionString: postgresUrl(server, server.owner, database) });
  await client.connect();
  try {
    return await work(client);
  } finally {
    await client.end();
  }
}

export async function createDatabase(
  server: PostgresServer,
  name: string,
  template?: string,
): Promise<void> {
  const from = template === undefined ? "" : ` TEMPLATE "${template}"`;
  await withOwnerClient(server, (client) => client.query(`CREATE DATABASE "${name}"${from}`));
}

/** Drops the test databases whose names `select` picks. */
export async function dropDatabases(
  server: PostgresServer,
  select: (name: string) => boolean,
): Promise<void> {
  await withOwnerClient(server, async (client) => {
    const { rows } = await client.query<{ name: string }>(
      "SELECT datname AS name FROM pg_database WHERE starts_with(datname, $1)",
      [namePrefix],
    );
    for (const { name } of rows.filter((row) => select(row.name))) {
      // oxlint-disable-next-line eslint/no-await-in-loop -- a connection runs one statement at a time
      await client.query(`DROP DATABASE IF EXISTS "${name}" WITH (FORCE)`);
    }
  });
}

/**
 * Empties every table of every module, so each test starts from empty data. The application role
 * has no TRUNCATE privilege, so `ownerClient` connects as the schema owner. Migration history stays.
 */
export async function truncateModuleTables(ownerClient: Client): Promise<void> {
  const migrations = await moduleMigrations();
  const { rows } = await ownerClient.query<{ table: string }>(
    `SELECT format('%I.%I', schemaname, tablename) AS table
       FROM pg_tables
      WHERE schemaname = ANY($1) AND tablename <> ALL($2)`,
    [migrations.map(({ schema }) => schema), migrations.map(({ table }) => table)],
  );
  if (rows.length > 0) {
    await ownerClient.query(
      `TRUNCATE ${rows.map(({ table }) => table).join(", ")} RESTART IDENTITY CASCADE`,
    );
  }
}
