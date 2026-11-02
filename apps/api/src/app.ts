import { StandardSchemaValidationPipe } from "@nestjs/common";
import type { NestApplicationOptions } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import type { OpenAPIObject } from "@nestjs/swagger";
import { Logger } from "nestjs-pino";

import { AppModule } from "./app.module.js";
import type { Config } from "./shared/config/config.js";

export async function createApp(
  config: Config,
  options: NestApplicationOptions = {},
): Promise<NestFastifyApplication> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule.forRoot(config),
    new FastifyAdapter(),
    { bufferLogs: true, ...options },
  );
  if (options.logger !== false) {
    app.useLogger(app.get(Logger));
  }
  // Validates every @Body/@Query/@Param that declares a zod `schema`.
  app.useGlobalPipes(new StandardSchemaValidationPipe());
  app.enableShutdownHooks();
  return app;
}

/** The HTTP contract, generated from endpoint zod schemas. Paths are relative to the web app's /api. */
export function createOpenApiDocument(app: NestFastifyApplication): OpenAPIObject {
  const document = new DocumentBuilder()
    .setTitle("AI-first Platform API")
    .setVersion("0.1.0")
    .build();
  return SwaggerModule.createDocument(app, document);
}
