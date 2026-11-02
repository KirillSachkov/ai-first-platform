import { readFile } from "node:fs/promises";
import { z } from "zod";

export type ServiceIdentity = Readonly<{ name: string; version: string }>;
export const SERVICE_IDENTITY = Symbol("ServiceIdentity");

const manifestSchema = z.object({ version: z.string() });

export async function readServiceIdentity(): Promise<ServiceIdentity> {
  const manifest = manifestSchema.parse(
    JSON.parse(await readFile(new URL("../../package.json", import.meta.url), "utf8")),
  );
  return { name: "api", version: manifest.version };
}
