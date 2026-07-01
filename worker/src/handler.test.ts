import { describe, expect, it, vi } from 'vitest'
import { handleChatRequest } from './handler'
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

const NOW = Date.parse('2026-07-01T00:00:00Z')

describe('handleChatRequest', () => {
  it('returns 404 for an unknown project id', async () => {
    const result = await handleChatRequest({
      projectId: 'not-a-project',
      sessionId: 's1',
      ip: '1.2.3.4',
      language: 'en',
      messages: [{ role: 'user', content: 'hi' }],
      kv: createFakeKV(),
      now: NOW,
      callOpenAI: vi.fn(),
    })
    expect(result).toEqual({ status: 404, body: { error: 'unknown-project' } })
  })

  it('returns 400 for an empty message list', async () => {
    const result = await handleChatRequest({
      projectId: 'logistics-analytics',
      sessionId: 's1',
      ip: '1.2.3.4',
      language: 'en',
      messages: [],
      kv: createFakeKV(),
      now: NOW,
      callOpenAI: vi.fn(),
    })
    expect(result).toEqual({ status: 400, body: { error: 'invalid-request' } })
  })

  it('returns 400 when the user message count exceeds the cap', async () => {
    const messages = []
    for (let i = 0; i < 6; i++) {
      messages.push({ role: 'user' as const, content: `question ${i}` })
      messages.push({ role: 'assistant' as const, content: `answer ${i}` })
    }
    const result = await handleChatRequest({
      projectId: 'logistics-analytics',
      sessionId: 's1',
      ip: '1.2.3.4',
      language: 'en',
      messages,
      kv: createFakeKV(),
      now: NOW,
      callOpenAI: vi.fn(),
    })
    expect(result).toEqual({ status: 400, body: { error: 'invalid-request' } })
  })

  it('calls OpenAI and returns the reply with remaining count on success', async () => {
    const callOpenAI = vi.fn().mockResolvedValue('Here is your answer')
    const result = await handleChatRequest({
      projectId: 'logistics-analytics',
      sessionId: 's1',
      ip: '1.2.3.4',
      language: 'en',
      messages: [{ role: 'user', content: 'How many late deliveries?' }],
      kv: createFakeKV(),
      now: NOW,
      callOpenAI,
    })
    expect(result).toEqual({ status: 200, body: { reply: 'Here is your answer', remaining: 4 } })
    expect(callOpenAI).toHaveBeenCalledTimes(1)
  })

  it('returns a capped response without calling OpenAI once the session cap is reached', async () => {
    const callOpenAI = vi.fn()
    const kv = createFakeKV({ 'session:s1:ip:1.2.3.4:project:logistics-analytics': '5' })
    const result = await handleChatRequest({
      projectId: 'logistics-analytics',
      sessionId: 's1',
      ip: '1.2.3.4',
      language: 'en',
      messages: [{ role: 'user', content: 'one more?' }],
      kv,
      now: NOW,
      callOpenAI,
    })
    expect(result).toEqual({ status: 200, body: { capped: true, reason: 'session-cap' } })
    expect(callOpenAI).not.toHaveBeenCalled()
  })

  it('returns 502 and does not record usage when OpenAI fails', async () => {
    const callOpenAI = vi.fn().mockRejectedValue(new Error('boom'))
    const kv = createFakeKV()
    const result = await handleChatRequest({
      projectId: 'logistics-analytics',
      sessionId: 's1',
      ip: '1.2.3.4',
      language: 'en',
      messages: [{ role: 'user', content: 'hi' }],
      kv,
      now: NOW,
      callOpenAI,
    })
    expect(result).toEqual({ status: 502, body: { error: 'upstream-failed' } })
    expect(await kv.get('session:s1:ip:1.2.3.4:project:logistics-analytics')).toBeNull()
  })
})
