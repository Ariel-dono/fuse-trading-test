import { z } from "@hono/zod-openapi";

export const nextTokenParamsSchema = z.object({
  nextToken: z
    .string()
    .optional()
    .openapi({
      param: {
        name: "nextToken",
        in: "path",
      },
      example: "sdflkasdkl=",
    }),
});

export const stock = z.object({
  lastUpdated: z.string(),
  change: z.number(),
  price: z.number(),
  name: z.string(),
  sector: z.string(),
  symbol: z.string(),
});

export const stockList = z.object({
  nextToken: z.string(),
  items: z.array(stock),
});

export const purchase = z.object({
  price: z.number(),
  quantity: z.number(),
  symbol: z.string(),
  userId: z.string(),
});

export const order = z.object({
  total: z.number(),
  quantity: z.number(),
  price: z.number(),
  symbol: z.string(),
});

export const purchaseResult = z.object({
  message: z.string(),
  order: order,
});
