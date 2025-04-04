import { serve } from "@hono/node-server";
import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";

import { logger } from "hono/logger";

import { health } from "./routers/health.js";
import { stock } from "./routers/stock.js";

const app = new OpenAPIHono();
app.use(logger());

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
