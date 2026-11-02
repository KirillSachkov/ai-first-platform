import { describe, expect, it } from "vitest";

import { ConfigError, parseConfig } from "./config.js";

const validEnv = {
  DATABASE_URL: "postgres://platform_app:local-app-password@127.0.0.1:5433/platform",
  RABBITMQ_URL: "amqp://platform:local-rabbitmq-password@127.0.0.1:5672",
};

const header = "Invalid backend configuration. Set these environment variables (see .env.example):";

describe(parseConfig, () => {
  it("reads a valid environment and applies defaults to optional settings", () => {
    expect(parseConfig(validEnv)).toStrictEqual({
      databaseUrl: "postgres://platform_app:local-app-password@127.0.0.1:5433/platform",
      rabbitmqUrl: "amqp://platform:local-rabbitmq-password@127.0.0.1:5672",
      http: { host: "127.0.0.1", port: 3000 },
      logLevel: "info",
    });
  });

  it.each([
    {
      problem: "a missing database URL, which holds the database password",
      env: { RABBITMQ_URL: validEnv.RABBITMQ_URL },
      message: `${header}\n  - DATABASE_URL: is not set`,
    },
    {
      problem: "a missing RabbitMQ URL, which holds the broker password",
      env: { DATABASE_URL: validEnv.DATABASE_URL },
      message: `${header}\n  - RABBITMQ_URL: is not set`,
    },
    {
      problem: "a database URL that is not a URL",
      env: { ...validEnv, DATABASE_URL: "localhost:5433" },
      message: `${header}\n  - DATABASE_URL: must be a postgres:// or postgresql:// URL`,
    },
    {
      problem: "a RabbitMQ URL with the wrong protocol",
      env: { ...validEnv, RABBITMQ_URL: "http://platform:local-rabbitmq-password@127.0.0.1:5672" },
      message: `${header}\n  - RABBITMQ_URL: must be an amqp:// or amqps:// URL`,
    },
    {
      problem: "both URLs missing",
      env: {},
      message: `${header}\n  - DATABASE_URL: is not set\n  - RABBITMQ_URL: is not set`,
    },
  ])("rejects $problem with a message that names the variable", ({ env, message }) => {
    expect(() => parseConfig(env)).toThrow(new ConfigError(message));
  });
});
