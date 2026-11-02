import { Controller, Get, Module } from "@nestjs/common";
import { describe, expect, it } from "vitest";

import { useTestApp } from "../../test/test-app.js";

// An endpoint that declares no access, registered only for this test (ADR-0004).
@Controller("edge-test")
class UndeclaredAccessEndpoint {
  @Get()
  get(): { reached: true } {
    return { reached: true };
  }
}

@Module({ controllers: [UndeclaredAccessEndpoint] })
class EdgeTestModule {}

describe("edge access check", () => {
  const api = useTestApp({ extraModules: [EdgeTestModule] });

  it("rejects an endpoint without declared access with 401", async () => {
    const response = await api.inject({ method: "GET", url: "/edge-test" });

    expect(response.statusCode).toBe(401);
  });

  it("serves a public endpoint", async () => {
    const response = await api.inject({ method: "GET", url: "/health/live" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toStrictEqual({ status: "ok" });
  });
});
