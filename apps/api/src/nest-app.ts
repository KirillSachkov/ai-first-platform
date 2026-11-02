import { StandardSchemaValidationPipe } from "@nestjs/common";
import type { DynamicModule, NestApplicationOptions } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { Logger } from "nestjs-pino";

/**
 * Creates the Nest application on Fastify around `rootModule`, with the application's logger,
 * validation and shutdown hooks. Only src/app.ts and the integration tests (test/start-app.ts)
 * choose the root module; `pnpm boundaries` rejects other importers.
 */
export async function createNestApp(
  rootModule: DynamicModule,
  options: NestApplicationOptions = {},
): Promise<NestFastifyApplication> {
  const app = await NestFactory.create<NestFastifyApplication>(rootModule, new FastifyAdapter(), {
    bufferLogs: true,
    ...options,
  });
  if (options.logger !== false) {
    app.useLogger(app.get(Logger));
  }
  // Validates every @Body/@Query/@Param that declares a zod `schema`.
  app.useGlobalPipes(new StandardSchemaValidationPipe());
  app.enableShutdownHooks();
  return app;
}
