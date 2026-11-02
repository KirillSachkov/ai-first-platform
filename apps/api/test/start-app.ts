import type { Type } from "@nestjs/common";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";

import { createApp } from "../src/app.js";
import { parseConfig } from "../src/shared/config/config.js";
import { RabbitMqConnection } from "../src/shared/messaging/messaging.module.js";
import type { TestInfra } from "./infra.js";
import { postgresUrl } from "./postgres.js";
import { amqpUrl } from "./rabbitmq.js";

/**
 * Builds the application with the production factory and test settings: the database and vhost
 * `name`, the application role as in Compose, and no logs.
 */
export async function startApp(
  { postgres, rabbitmq }: TestInfra,
  name: string,
  extraModules: readonly Type[],
): Promise<NestFastifyApplication> {
  const config = parseConfig({
    DATABASE_URL: postgresUrl(postgres, postgres.app, name),
    RABBITMQ_URL: amqpUrl(rabbitmq, name),
    LOG_LEVEL: "silent",
  });
  const app = await createApp(config, { logger: false, extraModules });
  await app.init();
  await app.getHttpAdapter().getInstance().ready();
  // Startup does not wait for RabbitMQ. Tests do, so readiness does not depend on timing.
  await app.get(RabbitMqConnection).connected();
  return app;
}
