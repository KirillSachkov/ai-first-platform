import { Global, Module } from "@nestjs/common";
import type { DynamicModule } from "@nestjs/common";

import { CONFIG } from "./config.js";
import type { Config } from "./config.js";

@Global()
@Module({})
export class ConfigModule {
  static forRoot(config: Config): DynamicModule {
    return {
      module: ConfigModule,
      providers: [{ provide: CONFIG, useValue: config }],
      exports: [CONFIG],
    };
  }
}
