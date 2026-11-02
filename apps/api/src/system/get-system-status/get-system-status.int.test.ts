import { describe, expect, it } from "vitest";

import { useTestApp } from "../../../test/test-app.js";
import { systemStatusResponseSchema } from "./get-system-status.schemas.js";

describe("system status at GET /system/status", () => {
  const api = useTestApp({ clock: { now: () => new Date("2026-11-02T10:00:00.000Z") } });

  it("names the service, tells the server time, and reports every dependency as ok", async () => {
    const response = await api.inject({ method: "GET", url: "/system/status" });

    expect(response.statusCode).toBe(200);
    expect(systemStatusResponseSchema.parse(response.json())).toStrictEqual({
      service: "api",
      version: "0.1.0",
      serverTime: "2026-11-02T10:00:00.000Z",
      dependencies: { database: "ok", rabbitmq: "ok" },
    });
  });
});
