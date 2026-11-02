import { Module } from "@nestjs/common";
import type { DynamicModule } from "@nestjs/common";
import { LoggerModule } from "nestjs-pino";

import { EdgeModule } from "./edge/edge.module.js";
import { AccessModule } from "./modules/access/access.module.js";
import { AgentConnectionsModule } from "./modules/agent-connections/agent-connections.module.js";
import { EmployeesModule } from "./modules/employees/employees.module.js";
import { ProjectsModule } from "./modules/projects/projects.module.js";
import { CONFIG } from "./shared/config/config.js";
import type { Config } from "./shared/config/config.js";
import { ConfigModule } from "./shared/config/config.module.js";
import { DatabaseModule } from "./shared/database/database.module.js";
import { MessagingModule } from "./shared/messaging/messaging.module.js";
import { systemClock } from "./shared/time/clock.js";
import type { Clock } from "./shared/time/clock.js";
import { ClockModule } from "./shared/time/clock.module.js";
import { SystemModule } from "./system/system.module.js";

@Module({})
export class AppModule {
  /** `clock` is the system clock; an integration test passes a fixed one (test/start-app.ts). */
  static forRoot(config: Config, clock: Clock = systemClock): DynamicModule {
    return {
      module: AppModule,
      imports: [
        ConfigModule.forRoot(config),
        ClockModule.forRoot(clock),
        LoggerModule.forRootAsync({
          inject: [CONFIG],
          useFactory: (appConfig: Config) => ({
            pinoHttp: {
              level: appConfig.logLevel,
              // Compose probes /health every few seconds; logging them drowns real requests.
              autoLogging: { ignore: (request) => request.url?.startsWith("/health/") ?? false },
            },
          }),
        }),
        DatabaseModule,
        MessagingModule,
        EdgeModule,
        SystemModule,
        EmployeesModule,
        ProjectsModule,
        AgentConnectionsModule,
        AccessModule,
      ],
    };
  }
}
