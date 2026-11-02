/** Nest token for {@link EmployeesContract}. */
export const EMPLOYEES = Symbol("EmployeesContract");

export type AccountStatus = "active" | "inactive";

/** Synchronous queries other modules and the edge layer may call. */
export interface EmployeesContract {
  /** Resolves a sign-in session to its employee, or null when the session is not valid. */
  authenticateSession: (sessionToken: string) => Promise<{ employeeId: string } | null>;
  getAccountStatus: (employeeId: string) => Promise<AccountStatus | null>;
}
