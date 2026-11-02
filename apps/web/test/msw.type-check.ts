// Compile-time checks of the typed MSW handlers. `pnpm lint` type-checks this file; nothing runs it.
// Each `@ts-expect-error` fails the check once a handler stops rejecting the mismatch.
// oxlint-disable typescript/no-unsafe-return -- a rejected call has the type error by design.
import { http } from "./msw";

http.get("/system/status", ({ response }) =>
  response(200).json({
    service: "api",
    version: "0.1.0",
    serverTime: "2026-11-02T10:00:00.000Z",
    // @ts-expect-error -- the schema allows only "ok" and "unavailable" for a dependency.
    dependencies: { database: "down", rabbitmq: "ok" },
  }),
);

http.get("/system/status", ({ response }) =>
  // @ts-expect-error -- the schema declares no 404 response for this endpoint.
  response(404).empty(),
);

// @ts-expect-error -- the schema has no such path.
http.get("/system/statuses", ({ response }) => response(200).empty());
