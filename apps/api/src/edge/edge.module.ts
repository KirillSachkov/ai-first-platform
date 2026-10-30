import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";

import { EdgeGuard } from "./edge.guard.js";

@Module({
  providers: [{ provide: APP_GUARD, useClass: EdgeGuard }],
})
export class EdgeModule {}
