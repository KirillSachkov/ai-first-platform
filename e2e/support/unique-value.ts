import { randomUUID } from "node:crypto";

/**
 * Returns a value no other test or run produces, for data a test creates through the public API.
 * E2E tests share one database and never reset it, so unique values keep them independent.
 */
export function uniqueValue(prefix: string): string {
  return `${prefix}-${randomUUID()}`;
}
