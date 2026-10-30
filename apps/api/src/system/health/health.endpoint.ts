import { Controller, Get, HttpStatus, Inject, Res } from "@nestjs/common";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import type { FastifyReply } from "fastify";
import type { z } from "zod";

import { DependencyChecks } from "../../shared/health/dependency-checks.js";
import { PublicEndpoint } from "../../shared/http/endpoint-access.js";
import {
  livenessResponseSchema,
  readinessResponseSchema,
  type ReadinessResponse,
} from "./health.schemas.js";

@ApiTags("system")
@Controller("health")
@PublicEndpoint()
export class HealthEndpoint {
  constructor(@Inject(DependencyChecks) private readonly checks: DependencyChecks) {}

  /** The process is up. Never touches external dependencies. */
  @Get("live")
  @ApiResponse({
    status: HttpStatus.OK,
    description: "The process is alive",
    standardSchema: livenessResponseSchema,
  })
  live(): z.infer<typeof livenessResponseSchema> {
    return { status: "ok" };
  }

  /** The backend can serve requests: the database and RabbitMQ answer within their timeouts. */
  @Get("ready")
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Every dependency is available",
    standardSchema: readinessResponseSchema,
  })
  @ApiResponse({
    status: HttpStatus.SERVICE_UNAVAILABLE,
    description: "At least one dependency is unavailable",
    standardSchema: readinessResponseSchema,
  })
  async ready(@Res({ passthrough: true }) reply: FastifyReply): Promise<ReadinessResponse> {
    const { ready, dependencies } = await this.checks.run();
    reply.status(ready ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE);
    return { status: ready ? "ready" : "unavailable", dependencies };
  }
}
