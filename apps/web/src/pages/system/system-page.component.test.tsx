import { HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { expectNoAxeViolations } from "../../../test/axe";
import { http, testFinished, worker } from "../../../test/msw";
import { renderApp } from "../../../test/render-app";

describe("system page", () => {
  it("shows the service and dependency states from the response", async () => {
    worker.use(
      http.get("/system/status", ({ response }) =>
        response(200).json({
          service: "api",
          version: "0.1.0",
          serverTime: "2026-11-02T10:00:00.000Z",
          dependencies: { database: "ok", rabbitmq: "unavailable" },
        }),
      ),
    );

    const screen = await renderApp("/system");

    // Values follow the terms Сервис, Время сервера, База данных, RabbitMQ. The server time is
    // formatted in the browser locale, so the test does not pin its text.
    const values = screen.getByRole("definition");
    await expect.element(values.nth(0)).toHaveTextContent("api 0.1.0");
    await expect.element(values.nth(2)).toHaveTextContent("доступна");
    await expect.element(values.nth(3)).toHaveTextContent("недоступна");
    await expectNoAxeViolations(screen.container);
  });

  it("shows loading while the response is pending", async () => {
    const finished = testFinished();
    worker.use(
      http.get("/system/status", async ({ response }) => {
        await finished;
        return response.untyped(HttpResponse.error());
      }),
    );

    const screen = await renderApp("/system");

    await expect.element(screen.getByRole("status")).toHaveTextContent("Загрузка…");
    await expectNoAxeViolations(screen.container);
  });

  it("shows an alert when the backend is unreachable", async () => {
    worker.use(
      // The dev proxy answers 502 without a body when the backend is down. The OpenAPI schema
      // declares only 200 for this endpoint, so the response is deliberately untyped.
      http.get("/system/status", ({ response }) =>
        response.untyped(new HttpResponse(null, { status: 502, statusText: "Bad Gateway" })),
      ),
    );

    const screen = await renderApp("/system");

    await expect
      .element(screen.getByRole("alert"))
      .toHaveTextContent("Backend недоступен: HTTP 502 Bad Gateway");
    await expectNoAxeViolations(screen.container);
  });
});
