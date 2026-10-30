import {
  Global,
  Inject,
  Injectable,
  Logger,
  Module,
  type OnApplicationShutdown,
} from "@nestjs/common";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { withTimeout } from "../async/with-timeout.js";
import { CONFIG, type Config } from "../config/config.js";

/** Drizzle instance for the application role. Each module queries only its own Postgres schema. */
export type Database = NodePgDatabase;
export const DATABASE = Symbol("Database");
const POOL = Symbol("PgPool");
const HEALTH_POOL = Symbol("PgHealthPool");

@Injectable()
export class DatabaseHealth {
  constructor(@Inject(HEALTH_POOL) private readonly pool: Pool) {}

  async ping(timeoutMs: number): Promise<void> {
    await withTimeout(this.pool.query("SELECT 1"), timeoutMs);
  }
}

// Pools connect lazily and open a new connection per checkout, so the backend starts without a
// reachable database and recovers on its own once the database returns.
function createPool(
  config: Config,
  name: string,
  options: { max?: number; queryTimeoutMs?: number },
) {
  const logger = new Logger(name);
  const pool = new Pool({
    connectionString: config.databaseUrl,
    connectionTimeoutMillis: 2_000,
    keepAlive: true,
    ...(options.max === undefined ? {} : { max: options.max }),
    ...(options.queryTimeoutMs === undefined ? {} : { query_timeout: options.queryTimeoutMs }),
  });
  // Without a listener, an idle client's network error would crash the process.
  pool.on("error", (error) => logger.warn(`Idle database client failed: ${error.message}`));
  return pool;
}

@Global()
@Module({
  providers: [
    {
      provide: POOL,
      inject: [CONFIG],
      useFactory: (config: Config) => createPool(config, "Database", {}),
    },
    // Health checks get their own single connection, so a hanging database cannot tie up the
    // connections that features use. The query timeout is only a backstop that frees the
    // connection; DependencyChecks applies the timeout that decides the reported status.
    {
      provide: HEALTH_POOL,
      inject: [CONFIG],
      useFactory: (config: Config) =>
        createPool(config, "DatabaseHealth", { max: 1, queryTimeoutMs: 5_000 }),
    },
    {
      provide: DATABASE,
      inject: [POOL],
      useFactory: (pool: Pool): Database => drizzle({ client: pool }),
    },
    DatabaseHealth,
  ],
  exports: [DATABASE, DatabaseHealth],
})
export class DatabaseModule implements OnApplicationShutdown {
  constructor(
    @Inject(POOL) private readonly pool: Pool,
    @Inject(HEALTH_POOL) private readonly healthPool: Pool,
  ) {}

  async onApplicationShutdown(): Promise<void> {
    await Promise.all([this.pool.end(), this.healthPool.end()]);
  }
}
