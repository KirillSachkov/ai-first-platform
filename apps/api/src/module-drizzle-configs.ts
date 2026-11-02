import { glob } from "node:fs/promises";

/**
 * Paths, relative to apps/api, of every module's drizzle-kit config. Like app.module.ts, this is
 * composition-root code: it locates module internals by convention so that adding a module needs
 * no edit here.
 */
export async function moduleDrizzleConfigs(): Promise<string[]> {
  const paths: string[] = [];
  for await (const path of glob("src/modules/*/infrastructure/drizzle.config.ts")) {
    paths.push(path);
  }
  return paths.toSorted();
}
