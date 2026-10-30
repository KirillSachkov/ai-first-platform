import { readFileSync } from "node:fs";

export type ServiceIdentity = Readonly<{ name: string; version: string }>;
export const SERVICE_IDENTITY = Symbol("ServiceIdentity");

export function readServiceIdentity(): ServiceIdentity {
  const manifest = JSON.parse(
    readFileSync(new URL("../../package.json", import.meta.url), "utf8"),
  ) as { version: string };
  return { name: "api", version: manifest.version };
}
