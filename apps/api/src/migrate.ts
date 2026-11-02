// One-shot migration run: applies every module's migrations as the schema-owning role, then exits.
import { migrateModules } from "./migrate-modules.js";
import { parseMigrationsConfig } from "./shared/config/config.js";

const config = parseMigrationsConfig(process.env);
await migrateModules({
  databaseUrl: config.databaseUrl,
  appRole: config.appRole,
  onMigrated: (schema) => console.log(`Migrated schema ${schema}`),
});
