import { Global, Module } from "@nestjs/common";
import type { DynamicModule } from "@nestjs/common";

import { CLOCK } from "./clock.js";
import type { Clock } from "./clock.js";

@Global()
@Module({})
export class ClockModule {
  static forRoot(clock: Clock): DynamicModule {
    return {
      module: ClockModule,
      providers: [{ provide: CLOCK, useValue: clock }],
      exports: [CLOCK],
    };
  }
}
