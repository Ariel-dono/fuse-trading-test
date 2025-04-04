import { z } from "@hono/zod-openapi";

export const messageDefinition = z.object({
  message: z.string(),
});
