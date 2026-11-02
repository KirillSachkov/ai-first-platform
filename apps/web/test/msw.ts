import { setupWorker } from "msw/browser";
import { createOpenApiHttp } from "openapi-msw";
import { onTestFinished } from "vitest";

import type { paths } from "@/shared/api/schema.gen";

/**
 * Request handlers typed by the generated OpenAPI schema: an unknown path or a response body
 * that does not match the schema for its status does not compile.
 */
export const http = createOpenApiHttp<paths>({ baseUrl: "/api" });

/** Intercepts the page's HTTP requests; each test adds its handlers with `worker.use`. */
export const worker = setupWorker();

/**
 * Resolves when the current test finishes. A handler awaits it to keep a request pending for the
 * whole test. Use it instead of `delay("infinite")`: `worker.stop()` hangs on a request that never ends.
 */
export function testFinished() {
  return new Promise<void>((resolve) => {
    onTestFinished(() => {
      resolve();
    });
  });
}
