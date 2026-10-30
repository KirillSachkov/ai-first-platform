// Writes the OpenAPI document generated from endpoint zod schemas to openapi/openapi.json.
// With --check, fails instead when the committed document differs from the code.
import { mkdir, readFile, writeFile } from "node:fs/promises";

import { createApp, createOpenApiDocument } from "../src/app.js";
import { parseConfig } from "../src/shared/config/config.js";

const outputPath = "openapi/openapi.json";

// Building the document needs no live dependencies; connections are opened lazily.
const app = await createApp(
  parseConfig({ DATABASE_URL: "postgres://localhost/unused", RABBITMQ_URL: "amqp://localhost" }),
  { logger: false, abortOnError: false },
);
const generated = `${JSON.stringify(createOpenApiDocument(app), null, 2)}\n`;
await app.close();

if (process.argv.includes("--check")) {
  const committed = await readFile(outputPath, "utf8").catch(() => "");
  if (committed !== generated) {
    console.error(
      `${outputPath} is out of date with the endpoint schemas. Run \`pnpm api:generate\` from the repository root and commit the result.`,
    );
    process.exit(1);
  }
} else {
  await mkdir("openapi", { recursive: true });
  await writeFile(outputPath, generated);
}
