/* eslint-disable @typescript-eslint/no-unused-vars */

import * as storage from "hono/context-storage"
import type { Response } from "node-fetch";
import fetch from "node-fetch";
import { expect, test, vi, beforeEach } from 'vitest'
import { stock } from '../src/routers/stock.js'

vi.mock('../src/utils/settings.js', () => ({
  getSettingsDefinition: () => ({
    authToken: 'dynamic-token'
  })
}))

const TOKEN = 'dynamic-token'

const HEADERS_DEFINITION = {
  "headers": {
    "Authorization": `Bearer ${TOKEN}`
  }
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.resetAllMocks();
  vi.restoreAllMocks();
  vi.mock(import("hono/context-storage"), async (importOriginal) => {
    const actual = await importOriginal()
    return {
      ...actual,
      getContext: vi.fn()
    }
  })

  vi.mock("node-fetch", {
    default: vi.fn()
  })
});

test('Integration of available stock listing capabilities', async () => {
  vi.spyOn(storage, "getContext").mockImplementationOnce(
    <T>() => {
      const actual = require("hono/context-storage")
      return {
        ...actual,
        "var": {
          db: {
            "runAndReadAll": (query) => ({
              getRowObjectsJson: () => [
                {
                  "code": "2025-04-01T05:34:50.733Z:NVDA",
                  "lastUpdated": "2025-04-01",
                  "change": 0,
                  "price": 0.25,
                  "name": "NVIDIA Corporation",
                  "sector": "Technology",
                  "symbol": "NVDA"
                },
              ]
            })
          }
        }
      }
    }
  )

  const res = await stock.request(
    "/available",
    HEADERS_DEFINITION
  )
  expect(await res.json()).toEqual([
    {
      "code": "2025-04-01T05:34:50.733Z:NVDA",
      "lastUpdated": "2025-04-01",
      "change": 0,
      "price": 0.25,
      "name": "NVIDIA Corporation",
      "sector": "Technology",
      "symbol": "NVDA"
    },
  ])
})


test('Getting the current stock portfolio', async () => {
  const spy = vi.spyOn(storage, "getContext")
  spy.mockImplementationOnce(
    <T>() => {
      const actual = require("hono/context-storage")
      return {
        ...actual,
        "var": {
          db: {
            "runAndReadAll": (query) => ({
              getRowObjectsJson: () => [
                {
                  "userId": "2039fdfd",
                  "symbol": "NVDA",
                  "quantity": 72,
                  "price": 0.25,
                  "total": 18
                }
              ]
            })
          }
        }
      }
    }
  )

  const res = await stock.request(
    "/portfolio",
    HEADERS_DEFINITION
  )
  expect(await res.json()).toEqual([
    {
      "userId": "2039fdfd",
      "symbol": "NVDA",
      "quantity": 72,
      "price": 0.25,
      "total": 18
    }
  ])
})

test('Integration of stock purchasing capabilities', async () => {
  vi.mocked(fetch).mockImplementationOnce(async (url, initData) => {
    return {
      status: 200,
      json: async () => ({
        "data": {
          "order": {
            "symbol": "NVDA",
            "quantity": 8,
            "price": 0.25,
            "total": 2.0
          }
        },
        "message": "test successful",
      })
    } as Response
  })

  const spy = vi.spyOn(storage, "getContext")
  spy.mockImplementationOnce(
    <T>() => {
      const actual = require("hono/context-storage")
      return {
        ...actual,
        "var": {
          db: {
            "run": (query) => {
              expect(query).toStrictEqual(
                "INSERT INTO PortfolioTransactions VALUES ('2039fdfd', 'NVDA', 8, 0.25, 2)"
              )
            }
          }
        }
      }
    }
  )

  const res = await stock.request(
    "/purchase",
    {
      method: 'POST',
      ...HEADERS_DEFINITION,
      body: JSON.stringify(
        {
          "price": 0.25,
          "symbol": "NVDA",
          "quantity": 3,
          "userId": "2039fdfd"
        }
      )
    }
  )
  expect(await res.json()).toStrictEqual({
    "message": "test successful",
    "order": {
      "price": 0.25,
      "quantity": 8,
      "symbol": "NVDA",
      "total": 2
    }
  })
})