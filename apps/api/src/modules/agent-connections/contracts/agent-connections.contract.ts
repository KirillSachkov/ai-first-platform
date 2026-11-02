/** Nest token for {@link AgentConnectionsContract}. */
export const AGENT_CONNECTIONS = Symbol("AgentConnectionsContract");

export interface AgentConnectionsContract {
  /** Resolves a connection token to a valid connection and its owner, or null. */
  resolveConnection: (
    connectionToken: string,
  ) => Promise<{ agentConnectionId: string; ownerEmployeeId: string } | null>;
}
