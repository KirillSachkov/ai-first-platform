import { z } from "zod";

const dependencyReportSchema = z.object({
  status: z.enum(["ok", "unavailable"]),
  error: z.string().optional().describe("Why the check failed; absent when the dependency is ok."),
});

export const livenessResponseSchema = z.object({ status: z.literal("ok") });

export const readinessResponseSchema = z.object({
  status: z.enum(["ready", "unavailable"]),
  dependencies: z.object({ database: dependencyReportSchema, rabbitmq: dependencyReportSchema }),
});
export type ReadinessResponse = z.infer<typeof readinessResponseSchema>;
