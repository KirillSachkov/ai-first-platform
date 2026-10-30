/**
 * Facts the edge layer establishes before a request reaches a feature (ADR-0004).
 * Features receive this as input and never re-check sign-in, account activity or access themselves.
 */
export type RequestContext = Readonly<{
  employeeId: string;
  /** Set when an agent connection made the request on the employee's behalf. */
  agentConnectionId: string | null;
  isAdministrator: boolean;
  /** Projects the employee currently participates in. */
  projectIds: readonly string[];
}>;
