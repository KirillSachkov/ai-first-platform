import { SetMetadata } from "@nestjs/common";

export const ENDPOINT_ACCESS = "platform:endpoint-access";

export type EndpointAccess = "public";

/**
 * Marks an endpoint that the edge layer serves without sign-in. Every other endpoint is rejected
 * until it declares its required access; see apps/api/src/edge/edge.guard.ts.
 */
export const PublicEndpoint = () => SetMetadata(ENDPOINT_ACCESS, "public" satisfies EndpointAccess);
