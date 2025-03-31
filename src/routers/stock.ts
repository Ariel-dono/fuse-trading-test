import { OpenAPIHono, createRoute } from "@hono/zod-openapi";

import type { Context } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";

import { messageDefinition } from "../schemas/message.js";
import { getSettingsDefinition } from "../utils/settings.js";

const settings = getSettingsDefinition();

export const stock = new OpenAPIHono();

const securityDefinition = [
  {
    Bearer: [],
  },
];

stock.use(cors());
stock.use(secureHeaders());
stock.use(
  bearerAuth({
    verifyToken: async (token: string) => {
      return token === settings.authToken;
    },
  }),
);
stock.openAPIRegistry.registerComponent("securitySchemes", "Bearer", {
  type: "http",
  scheme: "bearer",
});

stock.openapi(
  createRoute({
    method: "get",
    path: "/available",
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
    security: securityDefinition,
  }),
  (ctx: Context) =>
    ctx.json({
      message: "Getting the available stock list!",
    }),
);

stock.openapi(
  createRoute({
    method: "get",
    path: "/portfolio",
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
    security: securityDefinition,
  }),
  (ctx: Context) =>
    ctx.json({
      message: "Getting the portfolio!",
    }),
);

stock.openapi(
  createRoute({
    method: "post",
    path: "/purchase",
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
    security: securityDefinition,
  }),
  (ctx: Context) =>
    ctx.json({
      message: "Stock puchase successful!",
    }),
);
