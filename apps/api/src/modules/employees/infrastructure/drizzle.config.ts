import type { Config } from "drizzle-kit";

// Generate migrations with `pnpm db:generate`; src/migrate.ts applies them.
export default {
  dialect: "postgresql",
  schema: "src/modules/employees/infrastructure/schema.ts",
  out: "src/modules/employees/infrastructure/migrations",
  migrations: { schema: "employees", table: "__drizzle_migrations" },
} satisfies Config;
