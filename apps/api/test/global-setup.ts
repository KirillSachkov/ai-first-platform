// Global setup of the integration project: shared containers, the migrated template database, and
// cleanup of earlier runs.
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { RabbitMQContainer } from "@testcontainers/rabbitmq";
import type { StartedTestContainer } from "testcontainers";
import type { TestProject } from "vitest/node";

import { migrateModules } from "../src/migrate-modules.js";
import { isStale, resourceName, runPrefix } from "./infra.js";
import type { PostgresServer, RabbitMqServer } from "./infra.js";
import { withMachineLock } from "./machine-lock.js";
import { createDatabase, dropDatabases, postgresUrl, withOwnerClient } from "./postgres.js";
import { deleteVhosts } from "./rabbitmq.js";

// Same images as compose.yaml.
const POSTGRES_IMAGE = "postgres:18.6-alpine3.24";
const RABBITMQ_IMAGE = "rabbitmq:4.4.0-management-alpine";
const OWNER = { name: "platform_migrations", password: "test-owner-password" };
const APP = { name: "platform_app", password: "test-app-password" };
const RABBITMQ_USER = { name: "platform", password: "test-rabbitmq-password" };
const DAY_MS = 24 * 60 * 60 * 1000;

export default async function setup(project: TestProject): Promise<() => Promise<void>> {
  // Locally, containers outlive the run and serve every worktree. CI gets fresh containers per run.
  const reuse = process.env.CI === undefined;
  const containers = await withMachineLock(async () => startContainers(reuse));
  const { postgres, rabbitmq } = containers;
  const prefix = runPrefix(process.pid);
  const templateDatabase = resourceName(prefix, "template");
  const ofThisRun = (name: string) => name.startsWith(`${prefix}_`);

  await removeStale(postgres, rabbitmq);
  await createTemplate(postgres, templateDatabase);
  project.provide("infra", {
    runPrefix: prefix,
    postgres: { ...postgres, app: APP, templateDatabase },
    rabbitmq,
  });

  return async () => {
    await Promise.all([dropDatabases(postgres, ofThisRun), deleteVhosts(rabbitmq, ofThisRun)]);
    if (!reuse) {
      await Promise.all(containers.started.map(async (container) => container.stop()));
    }
  };
}

async function startContainers(reuse: boolean): Promise<{
  postgres: PostgresServer;
  rabbitmq: RabbitMqServer;
  started: StartedTestContainer[];
}> {
  const postgresContainer = new PostgreSqlContainer(POSTGRES_IMAGE)
    .withUsername(OWNER.name)
    .withPassword(OWNER.password)
    .withDatabase("postgres");
  const rabbitmqContainer = new RabbitMQContainer(RABBITMQ_IMAGE).withEnvironment({
    RABBITMQ_DEFAULT_USER: RABBITMQ_USER.name,
    RABBITMQ_DEFAULT_PASS: RABBITMQ_USER.password,
  });
  const [startedPostgres, startedRabbitmq] = await Promise.all([
    (reuse ? postgresContainer.withReuse() : postgresContainer).start(),
    (reuse ? rabbitmqContainer.withReuse() : rabbitmqContainer).start(),
  ]);
  const postgres = {
    host: startedPostgres.getHost(),
    port: startedPostgres.getMappedPort(5432),
    owner: OWNER,
  };
  await createAppRole(postgres);
  return {
    postgres,
    rabbitmq: {
      host: startedRabbitmq.getHost(),
      amqpPort: startedRabbitmq.getMappedPort(5672),
      managementPort: startedRabbitmq.getMappedPort(15_672),
      user: RABBITMQ_USER,
    },
    started: [startedPostgres, startedRabbitmq],
  };
}

// Roles belong to the whole PostgreSQL cluster, so every run on a reused container shares this one.
async function createAppRole(postgres: PostgresServer): Promise<void> {
  await withOwnerClient(postgres, async (client) =>
    client.query(`
      DO $$ BEGIN
        CREATE ROLE "${APP.name}" LOGIN PASSWORD '${APP.password}';
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$`),
  );
}

/** Removes databases and vhosts older than a day: leftovers of crashed runs in any worktree. */
async function removeStale(postgres: PostgresServer, rabbitmq: RabbitMqServer): Promise<void> {
  const now = new Date();
  const stale = (name: string) => isStale(name, now, DAY_MS);
  await Promise.all([dropDatabases(postgres, stale), deleteVhosts(rabbitmq, stale)]);
}

// Each test file copies this database. The privileges match infra/postgres/create-app-role.sh,
// which runs only in the Compose database; default privileges are stored per database.
async function createTemplate(postgres: PostgresServer, template: string): Promise<void> {
  await createDatabase(postgres, template);
  const grant = `ALTER DEFAULT PRIVILEGES FOR ROLE "${OWNER.name}" GRANT`;
  await withOwnerClient(
    postgres,
    async (client) =>
      client.query(`
        ${grant} USAGE ON SCHEMAS TO "${APP.name}";
        ${grant} SELECT, INSERT, UPDATE, DELETE ON TABLES TO "${APP.name}";
        ${grant} USAGE, SELECT ON SEQUENCES TO "${APP.name}";`),
    template,
  );
  await migrateModules({ databaseUrl: postgresUrl(postgres, OWNER, template), appRole: APP.name });
}
