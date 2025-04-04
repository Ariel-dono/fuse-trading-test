import { expect, test, vi, beforeEach } from 'vitest'
import gatherAvailableStock from '../src/workers/behaviors/stock.cjs'
const { DuckDBInstance } = require("@duckdb/node-api");

beforeEach(() => {
  vi.clearAllMocks();
  vi.resetAllMocks();
  vi.restoreAllMocks();

  vi.stubGlobal('fetch', vi.fn(async (url, config) => {
    return {
      status: 200,
      json: async () => ({
        "data": {
          "items": [
            {
              "code": "NVDA",
              "lastUpdated": "2025-04-03 07:12:00.296",
              "change": 0,
              "price": 0.25,
              "name": "NVIDIA Corporation",
              "sector": "Technology",
              "symbol": "NVDA"
            },
          ],
        }
      })
    } as Response
  }
  ));

  vi.mock(import("@duckdb/node-api"), async (importOriginal) => {
    const actual = await importOriginal()
    return {
      ...actual,
      DuckDBInstance: {
        fromCache: vi.fn()
      }
    }
  })
})

test('Helps testing readiness and service availability', async () => {
  vi.spyOn(DuckDBInstance, "fromCache").mockImplementation(async (source) => ({
    connect: async () => {
      let queries = [
        'CREATE TABLE IF NOT EXISTS PortfolioTransactions (userId TEXT, symbol TEXT, quantity INT, price FLOAT, total FLOAT, transactionDate DATETIME)',
        'CREATE TABLE IF NOT EXISTS PortfolioFailedTransactions (userId TEXT, symbol TEXT, quantity INT, price FLOAT, total FLOAT, transactionDate DATETIME)',
        'CREATE TABLE IF NOT EXISTS AvailableStock (code TEXT PRIMARY KEY, lastUpdated DATETIME, change INT, price FLOAT, name TEXT, sector TEXT, symbol TEXT)',
        "INSERT INTO AvailableStock VALUES ('NVDA', '2025-04-03 07:12:00.296', '0', 0.25, 'NVIDIA Corporation', 'Technology', 'NVDA') "
        + "ON CONFLICT DO UPDATE SET change = EXCLUDED.change, price = EXCLUDED.price, lastUpdated = EXCLUDED.lastUpdated"
      ]
      let times:number = 0
      return {
        run: async (query) => {
          console.log(query)
          expect(query).toStrictEqual(queries[times])
          times+=1
        }
      }
    }
  }))

  await gatherAvailableStock("stockGatherWorker", "Starting")
})