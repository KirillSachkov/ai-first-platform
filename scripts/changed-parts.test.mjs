import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { changedParts } from "./changed-parts.mjs";

const nothing = { api: false, web: false, e2e: false, lockfile: false };

describe("changedParts", () => {
  it("runs no tests when only documentation changes", () => {
    assert.deepEqual(
      changedParts(["README.md", "docs/adr/0005-tests.md", "apps/api/AGENTS.md"]),
      nothing,
    );
  });

  it("runs api tests and E2E when api code changes", () => {
    assert.deepEqual(changedParts(["apps/api/src/main.ts"]), { ...nothing, api: true, e2e: true });
  });

  it("runs web tests and E2E when web code changes", () => {
    assert.deepEqual(changedParts(["apps/web/vitest.config.ts"]), {
      ...nothing,
      web: true,
      e2e: true,
    });
  });

  it("runs everything and the audit when the lockfile changes", () => {
    assert.deepEqual(changedParts(["pnpm-lock.yaml"]), {
      api: true,
      web: true,
      e2e: true,
      lockfile: true,
    });
  });

  for (const file of [
    "pnpm-workspace.yaml",
    "package.json",
    ".pnpmfile.cjs",
    ".node-version",
    "knip.jsonc",
    "packages/typescript-config/base.json",
    "packages/oxlint-config/plugins/platform.mjs",
    ".github/workflows/ci.yml",
    ".github/actions/setup/action.yml",
  ]) {
    it(`runs tests of both apps when shared config ${file} changes`, () => {
      assert.deepEqual(changedParts([file]), { ...nothing, api: true, web: true, e2e: true });
    });
  }

  for (const file of [
    "compose.yaml",
    ".env.example",
    "e2e/tests/system-status.test.ts",
    "infra/postgres/create-app-role.sh",
    "scripts/smoke.mjs",
    "scripts/with-stack-lock.mjs",
  ]) {
    it(`runs only E2E when stack file ${file} changes`, () => {
      assert.deepEqual(changedParts([file]), { ...nothing, e2e: true });
    });
  }
});
