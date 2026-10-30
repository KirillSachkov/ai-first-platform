import { createApp } from "./app.js";
import { ConfigError, parseConfig } from "./shared/config/config.js";

let config;
try {
  config = parseConfig(process.env);
} catch (error) {
  if (!(error instanceof ConfigError)) throw error;
  console.error(error.message);
  process.exit(1);
}

const app = await createApp(config);
await app.listen({ host: config.http.host, port: config.http.port });
