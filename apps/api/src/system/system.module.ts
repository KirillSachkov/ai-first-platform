import { Module } from "@nestjs/common";

import { DependencyChecks } from "../shared/health/dependency-checks.js";
import { GetSystemStatusEndpoint } from "./get-system-status/get-system-status.endpoint.js";
import { GetSystemStatusHandler } from "./get-system-status/get-system-status.handler.js";
import { HealthEndpoint } from "./health/health.endpoint.js";
import { readServiceIdentity, SERVICE_IDENTITY } from "./service-identity.js";

/** Technical endpoints outside the domain modules: health checks and the system status page. */
@Module({
  controllers: [HealthEndpoint, GetSystemStatusEndpoint],
  providers: [
    DependencyChecks,
    GetSystemStatusHandler,
    { provide: SERVICE_IDENTITY, useFactory: readServiceIdentity },
  ],
})
export class SystemModule {}
