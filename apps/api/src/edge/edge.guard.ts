import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import type { CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { ENDPOINT_ACCESS } from "../shared/http/endpoint-access.js";
import type { EndpointAccess } from "../shared/http/endpoint-access.js";

/**
 * Edge layer (ADR-0004). For a protected endpoint it will, in order: authenticate the session
 * through Employees or the connection token through AgentConnections, check that the owner's
 * account is active, load the access context from Access, check the endpoint's declared access,
 * and attach the RequestContext for the feature.
 * No sign-in method exists yet, so only endpoints marked @PublicEndpoint() are served.
 */
@Injectable()
export class EdgeGuard implements CanActivate {
  constructor(@Inject(Reflector) private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const access = this.reflector.getAllAndOverride<EndpointAccess | undefined>(ENDPOINT_ACCESS, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (access === "public") {
      return true;
    }
    throw new UnauthorizedException();
  }
}
