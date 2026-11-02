import { describe, expect, it } from "vitest";

import { useTestApp } from "../../../test/test-app.js";
import { systemStatusResponseSchema } from "./get-system-status.schemas.js";

describe("system status at GET /system/status", () => {
  const api = useTestApp({ clock: { now: () => new Date("2026-11-02T10:00:00.000Z") } });

  it("names the service, tells the server time, and reports every dependency as ok", async () => {
    const response = await api.inject({ method: "GET", url: "/system/status" });

    expect(response.statusCode).toBe(200);
    const { version, ...status } = systemStatusResponseSchema.parse(response.json());
    expect(status).toStrictEqual({
      service: "api",
      serverTime: "2026-11-02T10:00:00.000Z",
      dependencies: { database: "ok", rabbitmq: "ok" },
    });
    // Issue #13 asks for the service version but fixes no value, and the number changes with
    // every release. So the test checks only the form of an npm package version (semver).
    expect(version).toMatch(/^\d+\.\d+\.\d+(?:-[\w.]+)?$/u);
  });
});
