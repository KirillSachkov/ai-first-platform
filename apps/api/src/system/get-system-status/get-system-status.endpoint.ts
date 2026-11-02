import { Controller, Get, HttpStatus, Inject } from "@nestjs/common";
import { ApiResponse, ApiTags } from "@nestjs/swagger";

import { PublicEndpoint } from "../../shared/http/endpoint-access.js";
import { GetSystemStatusHandler } from "./get-system-status.handler.js";
import { systemStatusResponseSchema } from "./get-system-status.schemas.js";
import type { SystemStatusResponse } from "./get-system-status.schemas.js";

/**
 * Exemplar slice: the endpoint declares its access and HTTP contract (zod schemas, exported to
 * OpenAPI) and delegates to the handler. Copy this shape for module features.
 */
@ApiTags("system")
@Controller("system")
export class GetSystemStatusEndpoint {
  constructor(@Inject(GetSystemStatusHandler) private readonly handler: GetSystemStatusHandler) {}

  /** Service identity and dependency state, shown on the frontend /system page. */
  @Get("status")
  @PublicEndpoint()
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Service identity and dependency state",
    standardSchema: systemStatusResponseSchema,
  })
  getSystemStatus(): Promise<SystemStatusResponse> {
    return this.handler.execute();
  }
}
