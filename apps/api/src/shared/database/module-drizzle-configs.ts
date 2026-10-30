import { glob } from "node:fs/promises";

/** Paths, relative to apps/api, of every module's drizzle-kit config. */
export async function moduleDrizzleConfigs(): Promise<string[]> {
  const paths: string[] = [];
  for await (const path of glob("src/modules/*/infrastructure/drizzle.config.ts")) paths.push(path);
  return paths.toSorted();
}
