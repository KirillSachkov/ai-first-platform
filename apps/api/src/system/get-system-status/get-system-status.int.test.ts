import { describe, expect, it } from "vitest";

import { useTestApp } from "../../../test/test-app.js";
import { systemStatusResponseSchema } from "./get-system-status.schemas.js";

describe("system status at GET /system/status", () => {
  const api = useTestApp();

  it("names the service and reports every dependency as ok", async () => {
    const response = await api.inject({ method: "GET", url: "/system/status" });

    expect(response.statusCode).toBe(200);
    // The schema also checks that serverTime is an ISO date-time.
    expect(systemStatusResponseSchema.parse(response.json())).toMatchObject({
      service: "api",
      version: "0.1.0",
      dependencies: { database: "ok", rabbitmq: "ok" },
    });
  });
});
