// Test application factory for integration tests: the real application in process, on this test
// file's own database copy and RabbitMQ vhost.
import type { Type } from "@nestjs/common";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import path from "node:path";
import { Client } from "pg";
import { afterAll, beforeAll, beforeEach, inject, TestRunner } from "vitest";

import { apiRoot } from "../src/module-drizzle-configs.js";
import { resourceName } from "./infra.js";
import { createDatabase, dropDatabases, postgresUrl, truncateModuleTables } from "./postgres.js";
import { createVhost, deleteVhosts } from "./rabbitmq.js";
import { startApp } from "./start-app.js";

type InjectOptions = Parameters<NestFastifyApplication["inject"]>[0];
type InjectResponse = Awaited<ReturnType<NestFastifyApplication["inject"]>>;

export type TestApp = Readonly<{
  /** Sends an HTTP request to the application without a network (Fastify `inject`). */
  inject: (request: InjectOptions) => Promise<InjectResponse>;
}>;

/**
 * Registers hooks that give this test file the application with its own database copy and vhost,
 * and empty module tables before each test. Call once at the top of a test file or `describe`.
 * `extraModules` registers modules that exist only for the test, for example an endpoint without
 * declared access.
 */
export function useTestApp(options: Readonly<{ extraModules?: readonly Type[] }> = {}): TestApp {
  const infra = inject("infra");
  const testFile = path.relative(apiRoot, TestRunner.getCurrentSuite().file.filepath);
  const name = resourceName(infra.runPrefix, testFile);
  const running: { app?: NestFastifyApplication; owner?: Client } = {};

  beforeAll(async () => {
    await Promise.all([
      createDatabase(infra.postgres, name, infra.postgres.templateDatabase),
      createVhost(infra.rabbitmq, name),
    ]);
    running.owner = new Client({
      connectionString: postgresUrl(infra.postgres, infra.postgres.owner, name),
    });
    await running.owner.connect();
    running.app = await startApp(infra, name, options.extraModules ?? []);
  });

  beforeEach(async () => {
    if (running.owner !== undefined) {
      await truncateModuleTables(running.owner);
    }
  });

  afterAll(async () => {
    await running.app?.close();
    await running.owner?.end();
    await Promise.all([
      dropDatabases(infra.postgres, (database) => database === name),
      deleteVhosts(infra.rabbitmq, (vhost) => vhost === name),
    ]);
  });

  return {
    inject: async (request) => {
      if (running.app === undefined) {
        throw new Error("The test application is not running: call api.inject inside a test.");
      }
      return running.app.inject(request);
    },
  };
}
