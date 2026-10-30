import { pgSchema } from "drizzle-orm/pg-core";

/** Postgres schema that holds every table of this module. Other modules never query it. */
export const agentConnectionsSchema = pgSchema("agent_connections");
