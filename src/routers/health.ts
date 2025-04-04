import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import type { Context } from "hono";

import { messageDefinition } from "../schemas/message.js";

export const health = new OpenAPIHono();

health.openapi(
  createRoute({
    method: "get",
    path: "/",
    responses: {
      200: {
        description: "Respond a message",
        content: {
          "application/json": {
            schema: messageDefinition,
          },
        },
      },
    },
  }),
  async (ctx: Context) =>
    ctx.json({
      message: "Up and running!",
    }),
);
