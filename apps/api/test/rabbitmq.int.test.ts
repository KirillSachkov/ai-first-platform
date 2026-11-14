import { RabbitMQContainer } from "@testcontainers/rabbitmq";
import type { StartedRabbitMQContainer } from "@testcontainers/rabbitmq";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { z } from "zod";

import type { RabbitMqServer } from "./infra.js";
import { createVhost, deleteVhosts } from "./rabbitmq.js";

// This suite owns a fresh broker: foreign-name fixtures never touch the shared test broker.
const running: { container?: StartedRabbitMQContainer; server?: RabbitMqServer } = {};
const user = { name: "platform", password: "test-rabbitmq-password" };

describe("test resource cleanup on RabbitMQ", () => {
  beforeAll(async () => {
    const container = await new RabbitMQContainer("rabbitmq:4.4.0-management-alpine")
      .withEnvironment({ RABBITMQ_DEFAULT_USER: user.name, RABBITMQ_DEFAULT_PASS: user.password })
      .start();
    running.container = container;
    running.server = {
      host: container.getHost(),
      amqpPort: container.getMappedPort(5672),
      managementPort: container.getMappedPort(15_672),
      user,
    };
  }, 60_000);

  afterAll(async () => {
    await running.container?.stop();
  });

  it("serializes concurrent cleanup and preserves unselected and non-test vhosts", async () => {
    const groups = Array.from({ length: 4 }, (_groupValue, group) =>
      Array.from({ length: 8 }, (_itemValue, item) => `it_cleanup_${group}_${item}`),
    );
    await Promise.all(
      [...groups.flat(), "it_another_run", "foreign"].map(async (name) =>
        createVhost(broker(), name),
      ),
    );
    const active = new Set<string[]>();
    let maximumActive = 0;
    const results = await Promise.allSettled(
      groups.map(async (names) => {
        try {
          await deleteVhosts(broker(), (name) => {
            // Observe the public selection callback until its cleanup finishes deleting real vhosts.
            active.add(names);
            maximumActive = Math.max(maximumActive, active.size);
            return [...names, "foreign"].includes(name);
          });
        } finally {
          active.delete(names);
        }
      }),
    );
    expect(results).toStrictEqual(
      Array.from({ length: 4 }, () => ({ status: "fulfilled", value: undefined })),
    );
    expect(maximumActive).toBe(1);
    await expect(vhostNames()).resolves.toStrictEqual(["/", "foreign", "it_another_run"]);
  }, 30_000);

  it("finishes all attempted deletions before reporting a RabbitMQ failure and releasing the lock", async () => {
    const protectedName = "it_error_00_protected";
    const deletable = Array.from({ length: 16 }, (_value, item) => `it_error_remove_${item}`);
    await Promise.all(
      [protectedName, ...deletable].map(async (name) => createVhost(broker(), name)),
    );
    // The real broker refuses DELETE with HTTP 412 while this protection is enabled.
    await expect(protection(protectedName, "POST")).resolves.toBe(204);
    await expect(deleteVhosts(broker(), (name) => name.startsWith("it_error_"))).rejects.toThrow(
      /RabbitMQ/u,
    );
    const names = await vhostNames();
    expect(names.filter((name) => name.startsWith("it_error_"))).toStrictEqual([
      "it_error_00_protected",
    ]);
    await expect(protection(protectedName, "DELETE")).resolves.toBe(204);
    await deleteVhosts(broker(), (name) => name === protectedName);
    await expect(vhostNames()).resolves.not.toContain(protectedName);
  });

  it("propagates selection errors and releases the lock for the next cleanup", async () => {
    await createVhost(broker(), "it_failure");
    await expect(
      deleteVhosts(broker(), () => {
        throw new Error("selection failed");
      }),
    ).rejects.toThrow("selection failed");
    await deleteVhosts(broker(), (name) => name === "it_failure");
    await expect(vhostNames()).resolves.not.toContain("it_failure");
  });
});

async function vhostNames(): Promise<string[]> {
  const server = broker();
  const response = await fetch(
    `http://${server.host}:${server.managementPort}/api/vhosts?columns=name`,
    {
      headers: {
        authorization: `Basic ${Buffer.from(`${user.name}:${user.password}`).toString("base64")}`,
      },
    },
  );
  expect(response.status).toBe(200);
  return z
    .array(z.object({ name: z.string() }))
    .parse(await response.json())
    .map(({ name }) => name)
    .toSorted();
}

function broker(): RabbitMqServer {
  if (running.server === undefined) {
    throw new Error("The owned test broker has not started");
  }
  return running.server;
}

async function protection(name: string, method: "POST" | "DELETE"): Promise<number> {
  const server = broker();
  const response = await fetch(
    `http://${server.host}:${server.managementPort}/api/vhosts/${encodeURIComponent(name)}/deletion/protection`,
    {
      method,
      headers: {
        authorization: `Basic ${Buffer.from(`${user.name}:${user.password}`).toString("base64")}`,
      },
    },
  );
  await response.text();
  return response.status;
}
