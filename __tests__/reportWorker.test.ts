import { expect, test, vi, beforeEach } from 'vitest'
import buildReport from '../src/workers/behaviors/report.cjs'
const { DuckDBInstance } = require("@duckdb/node-api");
const nodemailer = require('nodemailer');


beforeEach(() => {
  vi.clearAllMocks();
  vi.resetAllMocks();
  vi.restoreAllMocks();
  vi.mock(import("@duckdb/node-api"), async (importOriginal) => {
    const actual = await importOriginal()
    return {
      ...actual,
      DuckDBInstance: {
        fromCache: vi.fn()
      }
    }
  })

  vi.mock(import("nodemailer"), async (importOriginal) => {
    const actual = await importOriginal()
    return {
      ...actual,
      createTransport: vi.fn()
    }
  })

  vi.mock("luxon", () => ({
    DateTime: {
      utc: () => ({
        toISO: () => '2025-04-04T08:22:49.460Z'
      })
    }
  }))
});

test('Helps testing readiness and service availability', async () => {
  vi.spyOn(DuckDBInstance, "fromCache").mockImplementation(async (source) => ({
    connect: async () => ({
      runAndReadAll: async (query) => {
        console.log(query)
        return {
          getRowObjectsJson: () => [
            {
              "userId": "2039fdfd",
              "symbol": "NVDA",
              "quantity": "9",
              "price": 0.25,
              "total": 2.25
            }
          ]
        }
      },
      run: async (query) => { }
    })
  }))

  vi.spyOn(nodemailer, "createTransport").mockImplementation((config) => ({
    sendMail: (options, fn) => {
      expect(options).toStrictEqual({
        "from": "carherrera@outlook.es",
        "html": "<b>Failed Transactions:<br />\"userId\":\"2039fdfd\",\"symbol\":\"NVDA\",\"quantity\":\"9\",\"price\":0.25,\"total\":2.25<br /></b>",
        "subject": "Daily Transactions Report",
        "text": "Failed Transactions:<br />\"userId\":\"2039fdfd\",\"symbol\":\"NVDA\",\"quantity\":\"9\",\"price\":0.25,\"total\":2.25<br />",
        "to": [
          "herrerafariel.345@gmail.com",
        ]
      })
      return fn(null, {
        response: "Queued successfully"
      })
    }
  }))

  buildReport("reporterTest", "Starting")
})