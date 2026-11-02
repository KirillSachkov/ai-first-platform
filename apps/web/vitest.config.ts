import { playwright } from "@vitest/browser-playwright";
import { msw } from "msw/vite";
import type { TestProjectInlineConfiguration } from "vitest/config";
import { defineConfig, mergeConfig } from "vitest/config";

import appConfig from "./vite.config.ts";

// Pure functions and entity models; no browser.
const unit: TestProjectInlineConfiguration = {
  extends: true,
  test: {
    name: "unit",
    include: ["src/**/*.unit.test.ts"],
    environment: "node",
  },
};

// A page or feature in real Chromium with the real router and Query; MSW answers HTTP.
const component: TestProjectInlineConfiguration = {
  extends: true,
  test: {
    name: "component",
    include: ["src/**/*.component.test.tsx"],
    setupFiles: ["./test/component-setup.ts"],
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      instances: [{ browser: "chromium" }],
    },
  },
};

export default defineConfig((env) =>
  mergeConfig(
    // The app config brings the router, React and Tailwind plugins. Its dev server settings
    // (fixed port 5173, /api proxy) are for `pnpm dev` only and would clash with a running app.
    { ...appConfig(env), server: {} },
    {
      // Serves /mockServiceWorker.js from the test server; nothing reaches the production build.
      plugins: [msw({ mode: "worker-only" })],
      // Pre-bundled up front: a dependency found mid-run makes Vite reload the test page.
      optimizeDeps: {
        include: [
          "@tanstack/react-query",
          "@tanstack/react-router",
          "axe-core",
          "clsx",
          "msw/browser",
          "openapi-fetch",
          "openapi-msw",
          "openapi-react-query",
          "tailwind-merge",
          "vitest-browser-react",
        ],
      },
      test: {
        // Several agents test in parallel on one machine.
        maxWorkers: 4,
        projects: [unit, component],
      },
    },
  ),
);
