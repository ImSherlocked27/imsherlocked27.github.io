import { describe, expect, it, vi } from 'vitest'
import { callOpenAI } from './openai'

describe('callOpenAI', () => {
  it('returns the assistant message content on success', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ choices: [{ message: { content: 'Hello there' } }] }),
    })

    const reply = await callOpenAI({
      apiKey: 'test-key',
      model: 'gpt-4o-mini',
      systemPrompt: 'system',
      messages: [{ role: 'user', content: 'hi' }],
      fetchImpl: fetchImpl as unknown as typeof fetch,
    })

    expect(reply).toBe('Hello there')
    expect(fetchImpl).toHaveBeenCalledWith(
      'https://api.openai.com/v1/chat/completions',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('throws when the response is not ok', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false, status: 429, json: async () => ({}) })

    await expect(
      callOpenAI({
        apiKey: 'test-key',
        model: 'gpt-4o-mini',
        systemPrompt: 'system',
        messages: [],
        fetchImpl: fetchImpl as unknown as typeof fetch,
      }),
    ).rejects.toThrow('OpenAI request failed with status 429')
  })

  it('throws when the response has no message content', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ choices: [] }) })

    await expect(
      callOpenAI({
        apiKey: 'test-key',
        model: 'gpt-4o-mini',
        systemPrompt: 'system',
        messages: [],
        fetchImpl: fetchImpl as unknown as typeof fetch,
      }),
    ).rejects.toThrow('OpenAI response missing content')
  })
})
