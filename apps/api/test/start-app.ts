// The test-only entry point of the application. Production code builds the application with
// createApp from src/app.ts and cannot import this file (`pnpm boundaries`).
import { Module } from "@nestjs/common";
import type { Type } from "@nestjs/common";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";

import { AppModule } from "../src/app.module.js";
import { createNestApp } from "../src/nest-app.js";
import { parseConfig } from "../src/shared/config/config.js";
import { RabbitMqConnection } from "../src/shared/messaging/messaging.module.js";
import type { TestInfra } from "./infra.js";
import { postgresUrl } from "./postgres.js";
import { amqpUrl } from "./rabbitmq.js";

/** What a test changes in the application it starts. */
export type TestAppOptions = Readonly<{
  /** Modules that exist only for the test, for example an endpoint without declared access. */
  extraModules?: readonly Type[];
}>;

// The root of the application under test: the application's own modules plus the test's modules.
@Module({})
class TestRootModule {}

/**
 * Builds the application from its own root module with test settings: the database and vhost
 * `name`, the application role as in Compose, and no logs. Registers the test's extra modules
 * next to the application's own.
 */
export async function startApp(
  { postgres, rabbitmq }: TestInfra,
  name: string,
  { extraModules = [] }: TestAppOptions,
): Promise<NestFastifyApplication> {
  const config = parseConfig({
    DATABASE_URL: postgresUrl(postgres, postgres.app, name),
    RABBITMQ_URL: amqpUrl(rabbitmq, name),
    LOG_LEVEL: "silent",
  });
  const app = await createNestApp(
    { module: TestRootModule, imports: [AppModule.forRoot(config), ...extraModules] },
    { logger: false },
  );
  await app.init();
  await app.getHttpAdapter().getInstance().ready();
  // Startup does not wait for RabbitMQ. Tests do, so readiness does not depend on timing.
  await app.get(RabbitMqConnection).connected();
  return app;
}
