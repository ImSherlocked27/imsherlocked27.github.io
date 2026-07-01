import { afterEach, describe, expect, it, vi } from 'vitest'
import worker from './index'
import type { Env } from './index'
import type { KVLike } from './rateLimit'

const ALLOWED_ORIGIN = 'https://imsherlocked27.github.io'

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

function createEnv(overrides: Partial<Env> = {}): Env {
  return {
    RATE_LIMIT_KV: createFakeKV(),
    OPENAI_API_KEY: 'test-key',
    OPENAI_MODEL: 'gpt-4o-mini',
    ALLOWED_ORIGIN,
    ...overrides,
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('worker fetch handler', () => {
  it('responds to an OPTIONS preflight with 204 and the CORS origin header', async () => {
    const request = new Request('https://worker.example/api/chat/logistics-analytics', {
      method: 'OPTIONS',
      headers: { Origin: ALLOWED_ORIGIN },
    })

    const response = await worker.fetch(request, createEnv())

    expect(response.status).toBe(204)
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(ALLOWED_ORIGIN)
  })

  it('returns 404 for a GET request to a valid-looking chat path', async () => {
    const request = new Request('https://worker.example/api/chat/logistics-analytics', {
      method: 'GET',
      headers: { Origin: ALLOWED_ORIGIN },
    })

    const response = await worker.fetch(request, createEnv())

    expect(response.status).toBe(404)
  })

  it('returns 404 for a POST to an unmatched path', async () => {
    const request = new Request('https://worker.example/api/other', {
      method: 'POST',
      headers: { Origin: ALLOWED_ORIGIN, 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })

    const response = await worker.fetch(request, createEnv())

    expect(response.status).toBe(404)
  })

  it('returns 400 for a malformed JSON body', async () => {
    const request = new Request('https://worker.example/api/chat/logistics-analytics', {
      method: 'POST',
      headers: { Origin: ALLOWED_ORIGIN, 'Content-Type': 'application/json' },
      body: 'not json',
    })

    const response = await worker.fetch(request, createEnv())

    expect(response.status).toBe(400)
  })

  it('returns 404 for an unknown project id', async () => {
    const request = new Request('https://worker.example/api/chat/not-a-real-project', {
      method: 'POST',
      headers: { Origin: ALLOWED_ORIGIN, 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: 'test-session', language: 'en', messages: [{ role: 'user', content: 'hi' }] }),
    })

    const response = await worker.fetch(request, createEnv())

    expect(response.status).toBe(404)
  })

  it('happy path: returns 200 with a reply and remaining count', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'a reply' } }] }),
    })
    vi.stubGlobal('fetch', fetchImpl)

    const request = new Request('https://worker.example/api/chat/logistics-analytics', {
      method: 'POST',
      headers: { Origin: ALLOWED_ORIGIN, 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: 'test-session', language: 'en', messages: [{ role: 'user', content: 'hi' }] }),
    })

    const response = await worker.fetch(request, createEnv({ RATE_LIMIT_KV: createFakeKV() }))
    const body = (await response.json()) as { reply: string; remaining: number }

    expect(response.status).toBe(200)
    expect(body.reply).toBe('a reply')
    expect(typeof body.remaining).toBe('number')
  })
})
