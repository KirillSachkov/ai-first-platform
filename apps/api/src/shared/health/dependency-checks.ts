import { Inject, Injectable } from "@nestjs/common";

import { DatabaseHealth } from "../database/database.module.js";
import { RabbitMqHealth } from "../messaging/messaging.module.js";

export type DependencyStatus = "ok" | "unavailable";
export type DependencyReport = Readonly<{ status: DependencyStatus; error?: string }>;
export type DependencyReports = Readonly<{
  database: DependencyReport;
  rabbitmq: DependencyReport;
}>;

const CHECK_TIMEOUT_MS = 2_000;

/** Probes every external dependency the backend needs to serve requests. */
@Injectable()
export class DependencyChecks {
  constructor(
    @Inject(DatabaseHealth) private readonly database: DatabaseHealth,
    @Inject(RabbitMqHealth) private readonly rabbitmq: RabbitMqHealth,
  ) {}

  async run(): Promise<{ ready: boolean; dependencies: DependencyReports }> {
    const [database, rabbitmq] = await Promise.all([
      probe(() => this.database.ping(CHECK_TIMEOUT_MS)),
      probe(() => this.rabbitmq.ping(CHECK_TIMEOUT_MS)),
    ]);
    return {
      ready: database.status === "ok" && rabbitmq.status === "ok",
      dependencies: { database, rabbitmq },
    };
  }
}

async function probe(check: () => Promise<void>): Promise<DependencyReport> {
  try {
    await check();
    return { status: "ok" };
  } catch (error) {
    return {
      status: "unavailable",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
