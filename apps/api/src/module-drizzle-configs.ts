import { glob } from "node:fs/promises";
import path from "node:path";

/** The apps/api directory. Drizzle-kit configs use paths relative to it. */
export const apiRoot = path.resolve(import.meta.dirname, "..");

/**
 * Paths, relative to apps/api, of every module's drizzle-kit config. Like app.module.ts, this is
 * composition-root code: it locates module internals by convention so that adding a module needs
 * no edit here.
 */
export async function moduleDrizzleConfigs(): Promise<string[]> {
  const paths: string[] = [];
  for await (const configPath of glob("src/modules/*/infrastructure/drizzle.config.ts", {
    cwd: apiRoot,
  })) {
    paths.push(configPath);
  }
  return paths.toSorted();
}
