// Real styles, so that the axe colour contrast check sees what the user sees.
import "@/app/styles/index.css";

import { afterAll, afterEach, beforeAll } from "vitest";

import { worker } from "./msw";

beforeAll(async () => {
  // A request without a handler fails the test instead of reaching a real network.
  await worker.start({ onUnhandledFrame: "error", quiet: true });
});

afterEach(() => {
  worker.resetHandlers();
});

afterAll(async () => {
  await worker.stop();
});
