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

import { CONFIG, type Config } from "../config/config.js";
import { withTimeout } from "../health/with-timeout.js";

/** Drizzle instance for the application role. Each module queries only its own Postgres schema. */
export type Database = NodePgDatabase;
export const DATABASE = Symbol("Database");
const POOL = Symbol("PgPool");

@Injectable()
export class DatabaseHealth {
  constructor(@Inject(POOL) private readonly pool: Pool) {}

  async ping(timeoutMs: number): Promise<void> {
    await withTimeout(this.pool.query("SELECT 1"), timeoutMs);
  }
}

// The pool connects lazily and opens a new connection per checkout, so the backend starts
// without a reachable database and recovers on its own once the database returns.
@Global()
@Module({
  providers: [
    {
      provide: POOL,
      inject: [CONFIG],
      useFactory: (config: Config) => {
        const logger = new Logger("Database");
        const pool = new Pool({
          connectionString: config.databaseUrl,
          connectionTimeoutMillis: 2_000,
        });
        // Without a listener, an idle client's network error would crash the process.
        pool.on("error", (error) => logger.warn(`Idle database client failed: ${error.message}`));
        return pool;
      },
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
  constructor(@Inject(POOL) private readonly pool: Pool) {}

  async onApplicationShutdown(): Promise<void> {
    await this.pool.end();
  }
}
