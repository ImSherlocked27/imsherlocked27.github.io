import { describe, expect, it } from 'vitest'
import { checkAllowance, recordUsage, SESSION_CAP, DAILY_CAP } from './rateLimit'
import type { KVLike } from './rateLimit'

function createFakeKV(initial: Record<string, string> = {}): KVLike {
  const store = new Map(Object.entries(initial))
  return {
    async get(key) {
      return store.has(key) ? store.get(key)! : null
    },
    async put(key, value) {
      store.set(key, value)
    },
  }
}

const BASE = {
  sessionId: 's1',
  ip: '1.2.3.4',
  projectId: 'logistics-analytics',
  now: Date.parse('2026-07-01T00:00:00Z'),
}

describe('checkAllowance', () => {
  it('allows a first message and reports remaining count', async () => {
    const kv = createFakeKV()
    const result = await checkAllowance({ kv, ...BASE })
    expect(result).toEqual({ ok: true, remaining: SESSION_CAP - 1 })
  })

  it('blocks once the session cap is reached', async () => {
    const kv = createFakeKV({ 'session:s1:ip:1.2.3.4:project:logistics-analytics': String(SESSION_CAP) })
    const result = await checkAllowance({ kv, ...BASE })
    expect(result).toEqual({ ok: false, reason: 'session-cap' })
  })

  it('blocks once the daily cap is reached, even with session budget left', async () => {
    const kv = createFakeKV({ 'daily-budget:2026-07-01': String(DAILY_CAP) })
    const result = await checkAllowance({ kv, ...BASE })
    expect(result).toEqual({ ok: false, reason: 'daily-cap' })
  })

  it('shares the daily budget across different projects', async () => {
    const kv = createFakeKV({ 'daily-budget:2026-07-01': String(DAILY_CAP - 1) })
    await recordUsage({ kv, sessionId: 's1', ip: '1.2.3.4', projectId: 'logistics-analytics', now: BASE.now })
    const result = await checkAllowance({ kv, sessionId: 's2', ip: '5.6.7.8', projectId: 'car-marketplace', now: BASE.now })
    expect(result).toEqual({ ok: false, reason: 'daily-cap' })
  })
})

describe('recordUsage', () => {
  it('increments both the session and daily counters from zero', async () => {
    const kv = createFakeKV()
    await recordUsage({ kv, ...BASE })
    expect(await kv.get('session:s1:ip:1.2.3.4:project:logistics-analytics')).toBe('1')
    expect(await kv.get('daily-budget:2026-07-01')).toBe('1')
  })

  it('increments from an existing count', async () => {
    const kv = createFakeKV({
      'session:s1:ip:1.2.3.4:project:logistics-analytics': '2',
      'daily-budget:2026-07-01': '10',
    })
    await recordUsage({ kv, ...BASE })
    expect(await kv.get('session:s1:ip:1.2.3.4:project:logistics-analytics')).toBe('3')
    expect(await kv.get('daily-budget:2026-07-01')).toBe('11')
  })
})
