import { Inject, Injectable } from "@nestjs/common";

import { DependencyChecks } from "../../shared/health/dependency-checks.js";
import { SERVICE_IDENTITY, type ServiceIdentity } from "../service-identity.js";
import type { SystemStatusResponse } from "./get-system-status.schemas.js";

@Injectable()
export class GetSystemStatusHandler {
  constructor(
    @Inject(DependencyChecks) private readonly checks: DependencyChecks,
    @Inject(SERVICE_IDENTITY) private readonly identity: ServiceIdentity,
  ) {}

  async execute(): Promise<SystemStatusResponse> {
    const { dependencies } = await this.checks.run();
    return {
      service: this.identity.name,
      version: this.identity.version,
      serverTime: new Date().toISOString(),
      dependencies: {
        database: dependencies.database.status,
        rabbitmq: dependencies.rabbitmq.status,
      },
    };
  }
}
