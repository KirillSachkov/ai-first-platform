// E2E sample: a browser against the stack that Docker Compose runs (see global-setup.ts).
// Expected values come from the spec (#19) and the page text in apps/web, not from the backend code.
//
// Test data rule: a test creates the data it needs through the public API, with unique values
// from uniqueValue() (support/unique-value.ts). A test never resets or truncates the database,
// so tests do not depend on each other or on the run order.
import { expect, test } from "@playwright/test";

test.describe("system status", { tag: "@smoke" }, () => {
  test("web serves the SPA", async ({ request }) => {
    const response = await request.get("/");

    expect(response.status()).toBe(200);
    expect(await response.text()).toContain('<div id="root"></div>');
  });

  test("the status page shows the backend answer through the proxy", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveURL("/system");
    await expect(page.getByText("Состояние системы")).toBeVisible();
    const status = page.getByRole("definition");
    await expect(status).toHaveText([/^api \d+\.\d+\.\d+$/u, /.+/u, "доступна", "доступна"]);
  });
});
