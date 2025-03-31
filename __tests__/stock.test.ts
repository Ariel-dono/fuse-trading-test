import { expect, test, vi } from 'vitest'
import { stock } from '../src/routers/stock.js'

vi.mock('../src/utils/settings.js', () => ({
  getSettingsDefinition: ()=>({
    authToken: 'dynamic-token'
  })
}))

const TOKEN = 'dynamic-token'

const HEADERS_DEFINITION = {
  "headers": {
    "Authorization": `Bearer ${TOKEN}`
  }
}

test('Integration of available stock listing capabilities', async () => {
  const res = await stock.request(
    "/available",
    HEADERS_DEFINITION
  )
  expect(await res.json()).toEqual({ "message": "Getting the available stock list!" })
})

test('Getting the current stock portfolio', async () => {
  const res = await stock.request(
    "/portfolio",
    HEADERS_DEFINITION
  )
  expect(await res.json()).toEqual({ "message": "Getting the portfolio!" })
})

test('Integration of stock purchasing capabilities', async () => {
  const res = await stock.request(
    "/purchase",
    {
      method: 'POST',
      ...HEADERS_DEFINITION
    }
  )
  expect(await res.json()).toEqual({ "message": "Stock puchase successful!" })
})