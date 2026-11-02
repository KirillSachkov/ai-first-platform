// E2E sample: a browser against the stack that Docker Compose runs (see global-setup.ts).
// Expected values come from the specs, never from the code under test:
// - #19 and the #22 acceptance criteria: web serves the SPA, and the status page shows the backend
//   answer through the proxy;
// - #13: the backend is `api`, and on a healthy stack the database and RabbitMQ are `ok`.
// How the page words a state is checked once, in the component test of the page.
//
// Test data rule: a test creates the data it needs through the public API, with unique values
// from uniqueValue() (support/unique-value.ts). A test never resets or truncates the database,
// so tests do not depend on each other or on the run order.
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

/** The value that follows `term` in a description list on the page. */
function valueOf(page: Page, term: string) {
  return page.getByRole("term").filter({ hasText: term }).locator("xpath=following-sibling::dd[1]");
}

test.describe("system status", { tag: "@smoke" }, () => {
  test("web serves the SPA", async ({ request }) => {
    const root = await request.get("/");
    const deepLink = await request.get("/system");

    expect(root.status()).toBe(200);
    expect(root.headers()["content-type"]).toContain("text/html");
    // An SPA answers every client route with the same document and routes in the browser.
    expect(deepLink.status()).toBe(200);
    expect(await deepLink.text()).toBe(await root.text());
  });

  test("the status page shows the backend answer through the proxy", async ({ page }) => {
    const answer = page.waitForResponse(
      (response) => new URL(response.url()).pathname === "/api/system/status",
    );

    await page.goto("/system");

    const response = await answer;
    expect(response.status()).toBe(200);
    expect(await response.json()).toMatchObject({
      service: "api",
      dependencies: { database: "ok", rabbitmq: "ok" },
    });
    await expect(valueOf(page, "Сервис")).toHaveText(/^api \d+\.\d+\.\d+/u);
    await expect(valueOf(page, "База данных")).not.toBeEmpty();
    await expect(valueOf(page, "RabbitMQ")).not.toBeEmpty();
    await expect(page.getByRole("alert")).toHaveCount(0);
  });
});
