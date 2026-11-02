// What global-setup.ts hands to test files, and the names of test databases and vhosts.
import { createHash } from "node:crypto";

import { apiRoot } from "../src/module-drizzle-configs.js";

export type Credentials = Readonly<{ name: string; password: string }>;

/** A PostgreSQL server and its schema owner, which is enough for administration. */
export type PostgresServer = Readonly<{ host: string; port: number; owner: Credentials }>;

export type RabbitMqServer = Readonly<{
  host: string;
  amqpPort: number;
  managementPort: number;
  user: Credentials;
}>;

/** What global-setup.ts hands to test files through `inject("infra")`. */
export type TestInfra = Readonly<{
  /** Prefix of every database and vhost of this test run. */
  runPrefix: string;
  postgres: PostgresServer & Readonly<{ app: Credentials; templateDatabase: string }>;
  rabbitmq: RabbitMqServer;
}>;

declare module "vitest" {
  interface ProvidedContext {
    infra: TestInfra;
  }
}

// Names: it_<worktree>_<process>_<label>_<created at, epoch seconds>. They stay within the
// 63-byte PostgreSQL identifier limit and let the startup sweep find leftovers by age.
export const namePrefix = "it_";

function shortHash(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 8);
}

/** Unique per worktree and test-run process. */
export function runPrefix(pid: number): string {
  return `${namePrefix}${shortHash(apiRoot)}_${pid}`;
}

/** A database or vhost name for `label` (a test file path or "template") in this run. */
export function resourceName(prefix: string, label: string, now = new Date()): string {
  return `${prefix}_${shortHash(label)}_${Math.floor(now.getTime() / 1000)}`;
}

/** True for a name this infrastructure created more than `maxAgeMs` before `now`. */
export function isStale(name: string, now: Date, maxAgeMs: number): boolean {
  if (!name.startsWith(namePrefix)) {
    return false;
  }
  const createdAtSeconds = Number(name.slice(name.lastIndexOf("_") + 1));
  return Number.isInteger(createdAtSeconds) && now.getTime() - createdAtSeconds * 1000 > maxAgeMs;
}
