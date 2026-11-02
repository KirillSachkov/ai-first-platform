import { Inject, Injectable } from "@nestjs/common";

import { DependencyChecks } from "../../shared/health/dependency-checks.js";
import { CLOCK } from "../../shared/time/clock.js";
import type { Clock } from "../../shared/time/clock.js";
import { SERVICE_IDENTITY } from "../service-identity.js";
import type { ServiceIdentity } from "../service-identity.js";
import type { SystemStatusResponse } from "./get-system-status.schemas.js";

@Injectable()
export class GetSystemStatusHandler {
  constructor(
    @Inject(DependencyChecks) private readonly checks: DependencyChecks,
    @Inject(SERVICE_IDENTITY) private readonly identity: ServiceIdentity,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  async execute(): Promise<SystemStatusResponse> {
    const { dependencies } = await this.checks.run();
    return {
      service: this.identity.name,
      version: this.identity.version,
      serverTime: this.clock.now().toISOString(),
      dependencies: {
        database: dependencies.database.status,
        rabbitmq: dependencies.rabbitmq.status,
      },
    };
  }
}
