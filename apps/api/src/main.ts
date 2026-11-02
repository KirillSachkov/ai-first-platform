import { createApp } from "./app.js";
import { ConfigError, parseConfig } from "./shared/config/config.js";
import type { Config } from "./shared/config/config.js";

function loadConfig(): Config {
  try {
    return parseConfig(process.env);
  } catch (error) {
    if (error instanceof ConfigError) {
      console.error(error.message);
      process.exit(1);
    }
    throw error;
  }
}

const config = loadConfig();
const app = await createApp(config);
await app.listen({ host: config.http.host, port: config.http.port });
