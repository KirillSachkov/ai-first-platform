import { z } from "zod";

// Every backend setting comes from the environment and is validated here once, at startup.
// Secrets and connection URLs have no defaults: a missing value stops the process.
const configSchema = z.object({
  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
  RABBITMQ_URL: z.url({ protocol: /^amqps?$/ }),
  HTTP_HOST: z.string().min(1).default("127.0.0.1"),
  HTTP_PORT: z.coerce.number().int().min(1).max(65_535).default(3000),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
});

const migrationsConfigSchema = z.object({
  MIGRATIONS_DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
});

export type Config = Readonly<{
  databaseUrl: string;
  rabbitmqUrl: string;
  http: Readonly<{ host: string; port: number }>;
  logLevel: z.infer<typeof configSchema>["LOG_LEVEL"];
}>;

export class ConfigError extends Error {
  override readonly name = "ConfigError";
}

export function parseConfig(env: NodeJS.ProcessEnv): Config {
  const { DATABASE_URL, RABBITMQ_URL, HTTP_HOST, HTTP_PORT, LOG_LEVEL } = parse(configSchema, env);
  return {
    databaseUrl: DATABASE_URL,
    rabbitmqUrl: RABBITMQ_URL,
    http: { host: HTTP_HOST, port: HTTP_PORT },
    logLevel: LOG_LEVEL,
  };
}

/** Settings of the one-shot migration run (src/migrate.ts), which connects as the schema owner. */
export function parseMigrationsConfig(env: NodeJS.ProcessEnv): { databaseUrl: string } {
  return { databaseUrl: parse(migrationsConfigSchema, env).MIGRATIONS_DATABASE_URL };
}

function parse<Schema extends z.ZodType>(schema: Schema, env: NodeJS.ProcessEnv): z.infer<Schema> {
  const result = schema.safeParse(env);
  if (result.success) return result.data;
  const problems = result.error.issues.map(
    (issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`,
  );
  throw new ConfigError(
    `Invalid backend configuration. Set these environment variables (see .env.example):\n${problems.join("\n")}`,
  );
}

/** Nest injection token for the validated {@link Config}. */
export const CONFIG = Symbol("Config");
