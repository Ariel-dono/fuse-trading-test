import { expect, test } from 'vitest'
import { health } from '../src/routers/health.js'

test('Helps testing readiness and service availability', async () => {
  const res = await health.request(
    "/",
  )

  expect(await res.json()).toEqual({ "message": "Up and running!" })
})