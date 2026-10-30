import { z } from "zod";

export const systemStatusResponseSchema = z.object({
  service: z.string(),
  version: z.string(),
  serverTime: z.iso.datetime(),
  dependencies: z.object({
    database: z.enum(["ok", "unavailable"]),
    rabbitmq: z.enum(["ok", "unavailable"]),
  }),
});
export type SystemStatusResponse = z.infer<typeof systemStatusResponseSchema>;
