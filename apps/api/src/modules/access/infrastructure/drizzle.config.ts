import type { Config } from "drizzle-kit";

// Generate migrations with `pnpm db:generate`; src/migrate.ts applies them.
export default {
  dialect: "postgresql",
  schema: "src/modules/access/infrastructure/schema.ts",
  out: "src/modules/access/infrastructure/migrations",
  migrations: { schema: "access", table: "__drizzle_migrations" },
} satisfies Config;
