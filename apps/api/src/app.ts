import type { NestApplicationOptions } from "@nestjs/common";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import type { OpenAPIObject } from "@nestjs/swagger";

import { AppModule } from "./app.module.js";
import { createNestApp } from "./nest-app.js";
import type { Config } from "./shared/config/config.js";

/** The application with exactly its own modules. Only tests add modules, in test/start-app.ts. */
export async function createApp(
  config: Config,
  options: NestApplicationOptions = {},
): Promise<NestFastifyApplication> {
  return createNestApp(AppModule.forRoot(config), options);
}

/** The HTTP contract, generated from endpoint zod schemas. Paths are relative to the web app's /api. */
export function createOpenApiDocument(app: NestFastifyApplication): OpenAPIObject {
  const document = new DocumentBuilder()
    .setTitle("AI-first Platform API")
    .setVersion("0.1.0")
    .build();
  return SwaggerModule.createDocument(app, document);
}
