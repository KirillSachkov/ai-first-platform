import { HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import type { RenderResult } from "vitest-browser-react";

import { expectNoAxeViolations } from "../../../test/axe";
import { http, testFinished, worker } from "../../../test/msw";
import { renderApp } from "../../../test/render-app";

/**
 * The value that follows `term` in a description list, as a reader pairs them. ARIA does not let a
 * `definition` take a name, so the test cannot ask for it by role and name.
 */
async function valueOf(screen: RenderResult, term: string): Promise<HTMLElement> {
  const termElement = screen.getByRole("term").filter({ hasText: term });
  await expect.element(termElement).toBeVisible();
  const value = termElement.element().nextElementSibling;
  if (!(value instanceof HTMLElement && value.tagName === "DD")) {
    throw new Error(`No value follows the term "${term}".`);
  }
  return value;
}

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

    // The server time is formatted in the browser locale, so the test does not pin its text.
    await expect.element(await valueOf(screen, "Сервис")).toHaveTextContent("api 0.1.0");
    await expect.element(await valueOf(screen, "Время сервера")).not.toBeEmptyDOMElement();
    await expect.element(await valueOf(screen, "База данных")).toHaveTextContent("доступна");
    await expect.element(await valueOf(screen, "RabbitMQ")).toHaveTextContent("недоступна");
    await expectNoAxeViolations(screen.container);
  });

  it("shows loading while the response is pending", async () => {
    const finished = testFinished();
    worker.use(
      http.get("/system/status", async ({ response }) => {
        await finished;
        // The request never completes during the test; after it, a network error ends it. A network
        // error has no HTTP status in the OpenAPI schema, so the response is deliberately untyped.
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
