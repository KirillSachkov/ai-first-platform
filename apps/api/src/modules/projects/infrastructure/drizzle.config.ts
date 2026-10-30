import type { Config } from "drizzle-kit";

// Generate migrations with `pnpm db:generate`; src/migrate.ts applies them.
export default {
  dialect: "postgresql",
  schema: "src/modules/projects/infrastructure/schema.ts",
  out: "src/modules/projects/infrastructure/migrations",
  migrations: { schema: "projects", table: "__drizzle_migrations" },
} satisfies Config;
