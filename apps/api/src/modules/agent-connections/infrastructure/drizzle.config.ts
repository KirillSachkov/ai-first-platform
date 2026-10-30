import type { Config } from "drizzle-kit";

// Generate migrations with `pnpm db:generate`; src/migrate.ts applies them.
export default {
  dialect: "postgresql",
  schema: "src/modules/agent-connections/infrastructure/schema.ts",
  out: "src/modules/agent-connections/infrastructure/migrations",
  migrations: { schema: "agent_connections", table: "__drizzle_migrations" },
} satisfies Config;
