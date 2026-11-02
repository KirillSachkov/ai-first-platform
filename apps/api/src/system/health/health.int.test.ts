import { describe, expect, it } from "vitest";

import { useTestApp } from "../../../test/test-app.js";
import { readinessResponseSchema } from "./health.schemas.js";

describe("readiness at GET /health/ready", () => {
  const api = useTestApp();

  it("reports ready when PostgreSQL and RabbitMQ answer", async () => {
    const response = await api.inject({ method: "GET", url: "/health/ready" });

    expect(response.statusCode).toBe(200);
    expect(readinessResponseSchema.parse(response.json())).toStrictEqual({
      status: "ready",
      dependencies: { database: { status: "ok" }, rabbitmq: { status: "ok" } },
    });
  });
});
