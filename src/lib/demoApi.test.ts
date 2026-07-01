import { afterEach, describe, expect, it, vi } from 'vitest'
import { getOrCreateSessionId, sendDemoMessage } from './demoApi'

afterEach(() => {
  window.localStorage.clear()
  vi.unstubAllGlobals()
})

describe('getOrCreateSessionId', () => {
  it('creates and persists a session id on first call', () => {
    const id = getOrCreateSessionId()
    expect(id.length).toBeGreaterThan(0)
    expect(window.localStorage.getItem('demo-session-id')).toBe(id)
  })

  it('returns the same id on subsequent calls', () => {
    const first = getOrCreateSessionId()
    const second = getOrCreateSessionId()
    expect(second).toBe(first)
  })
})

describe('sendDemoMessage', () => {
  it('posts to the chat endpoint and returns the parsed response', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ reply: 'hello', remaining: 4 }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await sendDemoMessage('logistics-analytics', 'en', [{ role: 'user', content: 'hi' }])

    expect(result).toEqual({ reply: 'hello', remaining: 4 })
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toContain('/api/chat/logistics-analytics')
    expect(init.method).toBe('POST')
    const body = JSON.parse(init.body)
    expect(body.language).toBe('en')
    expect(body.messages).toEqual([{ role: 'user', content: 'hi' }])
    expect(typeof body.sessionId).toBe('string')
  })

  it('throws when the response is not ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({}) }))

    await expect(sendDemoMessage('car-marketplace', 'es', [{ role: 'user', content: 'hola' }])).rejects.toThrow(
      'Demo request failed with status 500',
    )
  })
})
