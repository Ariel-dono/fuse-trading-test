import type { DuckDBInstance } from "@duckdb/node-api";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";

import type { Context } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { contextStorage, getContext } from "hono/context-storage";

import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";

import type { ContentfulStatusCode } from "hono/utils/http-status";

import fetch from "node-fetch";

import { messageDefinition } from "../schemas/message.js";
import {
  stockList,
  purchaseResult,
  purchase,
  nextTokenParamsSchema,
} from "../schemas/stock.js";
import { getSettingsDefinition } from "../utils/service/settings.js";
import { DateTime } from "luxon";

type Env = {
  Variables: {
    db: DuckDBInstance;
  };
};

const settings = getSettingsDefinition();

export const stock = new OpenAPIHono();

const securityDefinition = [
  {
    Bearer: [],
  },
];

stock.use(cors());
stock.use(secureHeaders());
stock.use(contextStorage());

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
    request: {
      params: nextTokenParamsSchema,
    },
    responses: {
      200: {
        description: "Respond a message",
        content: {
          "application/json": {
            schema: stockList,
          },
        },
      },
    },
    security: securityDefinition,
  }),
  async (ctx: Context) => {
    const db = getContext<Env>().var.db;
    const reader = await db.runAndReadAll("SELECT * from AvailableStock");

    const rows = reader.getRowObjectsJson();

    return ctx.json(rows);
  },
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
  async (ctx: Context) => {
    const db = getContext<Env>().var.db;
    const reader = await db.runAndReadAll(
      "SELECT userId, symbol, sum(quantity) as quantity, price, sum(total) as total from PortfolioTransactions" +
      " group by userId, symbol, price",
    );

    const rows = reader.getRowObjectsJson();

    return ctx.json(rows);
  },
);

stock.openapi(
  createRoute({
    method: "post",
    path: "/purchase",
    request: {
      body: {
        content: {
          "application/json": {
            schema: purchase,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Respond a message",
        content: {
          "application/json": {
            schema: purchaseResult,
          },
        },
      },
    },
    security: securityDefinition,
  }),
  async (ctx: Context) => {
    const validatedBody = await ctx.req.json();

    const db = getContext<Env>().var.db;
    const reader = await db.runAndReadAll(`SELECT * from AvailableStock where symbol = '${validatedBody.symbol}'`);
    const latestPriceDefinition = reader.getRowObjectsJson()[0];
    const diff = Math.abs(validatedBody.price - latestPriceDefinition.price)
    const diffPercentage = (diff / validatedBody.price)

    if (diffPercentage < 0.2) {
      const requestConfig = {
        headers: {
          "x-api-key": settings.clientToken!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validatedBody),
        method: "post",
      };

      let purchaseUrl: string = `${settings.clientUrl}${settings.purchaseStockPath}`;

      purchaseUrl = purchaseUrl.replace(":symbol", validatedBody.symbol);

      const response = await fetch(purchaseUrl, requestConfig);

      if (response.status == 200) {
        const res = await response.json();
        const data = res.data.order;
        await db.run(
          `INSERT INTO PortfolioTransactions VALUES ` +
          `('${validatedBody.userId}', '${data.symbol}', ${data.quantity}, ${data.price}, ${data.total}, '${DateTime.utc().toISO()}')`,
        );
        return ctx.json({
          message: res.message,
          order: data,
        });
      } else {
        return ctx.json(
          {
            message: await response.text(),
          },
          response.status as ContentfulStatusCode,
        );
      }
    } else {
      await db.run(
        `INSERT INTO PortfolioFailedTransactions VALUES ` +
          `('${validatedBody.userId}', '${validatedBody.symbol}', ${validatedBody.quantity}, ${validatedBody.price}, ${validatedBody.quantity * validatedBody.price}, '${DateTime.utc().toISO()}')`,
      );
      return ctx.json(
        {
          message: "Failure: Price difference bigger than 2%",
        },
        400 as ContentfulStatusCode,
      );
    }
  },
);
