/** Nest token for {@link AccessContract}. */
export const ACCESS = Symbol("AccessContract");

export type AccessContext = Readonly<{ isAdministrator: boolean; projectIds: readonly string[] }>;

export interface AccessContract {
  /** Current administrator flag and project memberships of an active employee. */
  getAccessContext(employeeId: string): Promise<AccessContext>;
  /**
   * Revokes administrator rights before Employees deactivates the account. Fails when the employee
   * is the last administrator; the check and the revocation run under one lock on the admin set.
   */
  releaseAdminRightsForTermination(
    employeeId: string,
  ): Promise<{ released: true } | { released: false; reason: "last_administrator" }>;
}
