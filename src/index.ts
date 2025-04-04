import { DuckDBInstance } from "@duckdb/node-api";

import { serve } from "@hono/node-server";
import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";

import { logger } from "hono/logger";

import type { ContentfulStatusCode } from "hono/utils/http-status";

import { health } from "./routers/health.js";
import { stock } from "./routers/stock.js";

import "./workers/report.cjs";
import "./workers/stock.cjs";
import init from "./workers/behaviors/initialize.cjs";

type Env = {
  Variables: {
    db: DuckDBInstance;
  };
};

const app = new OpenAPIHono<Env>();
app.use(logger());

app.use(async (ctx, next) => {
  const instance = await DuckDBInstance.fromCache("trading.db");
  const conn = await instance.connect();
  init(conn);

  ctx.set("db", conn);
  try {
    await next();
  } catch (err) {
    return ctx.json(
      {
        message: err,
      },
      500 as ContentfulStatusCode,
    );
  } finally {
    conn.disconnectSync();
  }
});

app.route("/health", health);
app.route("/stock", stock);

app.get(
  "/ui",
  swaggerUI({
    url: "/doc",
  }),
);

app.doc("/doc", {
  info: {
    title: "Fuse trading test API",
    version: "v1",
  },
  openapi: "3.1.0",
});

serve(app);
