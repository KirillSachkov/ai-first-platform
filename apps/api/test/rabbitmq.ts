// Test vhosts on the shared RabbitMQ container, managed through its HTTP management API.
import { z } from "zod";

import { namePrefix } from "./infra.js";
import type { RabbitMqServer } from "./infra.js";

type ManagementRequest = Readonly<{
  method: "GET" | "PUT" | "DELETE";
  path: string;
  body?: unknown;
}>;

async function management(server: RabbitMqServer, request: ManagementRequest): Promise<Response> {
  const { name, password } = server.user;
  const url = `http://${server.host}:${server.managementPort}/api${request.path}`;
  const response = await fetch(url, {
    method: request.method,
    headers: {
      authorization: `Basic ${Buffer.from(`${name}:${password}`).toString("base64")}`,
      "content-type": "application/json",
    },
    ...(request.body === undefined ? {} : { body: JSON.stringify(request.body) }),
  });
  if (!response.ok && response.status !== 404) {
    throw new Error(`RabbitMQ ${request.method} ${request.path} failed: ${response.status}`);
  }
  return response;
}

/** Creates a vhost and gives the test user full permissions in it. */
export async function createVhost(server: RabbitMqServer, name: string): Promise<void> {
  const vhost = encodeURIComponent(name);
  await management(server, { method: "PUT", path: `/vhosts/${vhost}` });
  await management(server, {
    method: "PUT",
    path: `/permissions/${vhost}/${encodeURIComponent(server.user.name)}`,
    body: { configure: ".*", write: ".*", read: ".*" },
  });
}

/** Deletes the test vhosts whose names `select` picks. */
export async function deleteVhosts(
  server: RabbitMqServer,
  select: (name: string) => boolean,
): Promise<void> {
  const response = await management(server, { method: "GET", path: "/vhosts?columns=name" });
  const vhosts = z.array(z.object({ name: z.string() })).parse(await response.json());
  await Promise.all(
    vhosts
      .filter(({ name }) => name.startsWith(namePrefix) && select(name))
      .map(async ({ name }) =>
        management(server, { method: "DELETE", path: `/vhosts/${encodeURIComponent(name)}` }),
      ),
  );
}

export function amqpUrl(server: RabbitMqServer, vhost: string): string {
  const { name, password } = server.user;
  const credentials = `${encodeURIComponent(name)}:${encodeURIComponent(password)}`;
  return `amqp://${credentials}@${server.host}:${server.amqpPort}/${encodeURIComponent(vhost)}`;
}
