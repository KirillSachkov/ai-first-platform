import type { IntegrationEvent } from "../../../shared/messaging/integration-event.js";

// Published through the outbox; Access and AgentConnections subscribe (ADR-0003).
export type InvitationAccepted = IntegrationEvent<
  "employees.invitation_accepted",
  1,
  { employeeId: string; intendedProjectIds: readonly string[] }
>;

export type EmployeeAccessTerminated = IntegrationEvent<
  "employees.access_terminated",
  1,
  { employeeId: string }
>;

export type EmployeeAccessRestored = IntegrationEvent<
  "employees.access_restored",
  1,
  { employeeId: string }
>;
