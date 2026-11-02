import { defineConfig } from "vitest/config";

// Unit tests sit next to the code as `*.test.ts` and need no Docker.
// Integration tests are `*.int.test.ts`: they start the app in process on real PostgreSQL and
// RabbitMQ from Testcontainers (test/global-setup.ts).
export default defineConfig({
  test: {
    // Several agents run tests on one machine at the same time.
    maxWorkers: 4,
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          include: ["src/**/*.test.ts"],
          exclude: ["src/**/*.int.test.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "integration",
          include: ["src/**/*.int.test.ts"],
          globalSetup: ["test/global-setup.ts"],
        },
      },
    ],
  },
});
