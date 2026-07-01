import { describe, expect, it } from 'vitest'
import { demoChatReducer, INITIAL_DEMO_CHAT_STATE } from './demoChatReducer'

describe('demoChatReducer', () => {
  it('starts idle with no messages and the full allowance', () => {
    expect(INITIAL_DEMO_CHAT_STATE).toEqual({ messages: [], remaining: 5, status: 'idle' })
  })

  it('appends a user message and sets status to sending on SEND', () => {
    const next = demoChatReducer(INITIAL_DEMO_CHAT_STATE, { type: 'SEND', content: 'hi' })
    expect(next.messages).toEqual([{ role: 'user', content: 'hi' }])
    expect(next.status).toBe('sending')
  })

  it('appends the assistant reply and updates remaining on SUCCESS', () => {
    const sending = demoChatReducer(INITIAL_DEMO_CHAT_STATE, { type: 'SEND', content: 'hi' })
    const next = demoChatReducer(sending, { type: 'SUCCESS', reply: 'hello!', remaining: 4 })
    expect(next.messages).toEqual([
      { role: 'user', content: 'hi' },
      { role: 'assistant', content: 'hello!' },
    ])
    expect(next.remaining).toBe(4)
    expect(next.status).toBe('idle')
  })

  it('sets status to capped when SUCCESS reports zero remaining', () => {
    const sending = demoChatReducer(INITIAL_DEMO_CHAT_STATE, { type: 'SEND', content: 'hi' })
    const next = demoChatReducer(sending, { type: 'SUCCESS', reply: 'last one!', remaining: 0 })
    expect(next.status).toBe('capped')
  })

  it('sets status to capped on a session-cap CAPPED action', () => {
    const next = demoChatReducer(INITIAL_DEMO_CHAT_STATE, { type: 'CAPPED', reason: 'session-cap' })
    expect(next.status).toBe('capped')
  })

  it('sets status to daily-capped on a daily-cap CAPPED action', () => {
    const next = demoChatReducer(INITIAL_DEMO_CHAT_STATE, { type: 'CAPPED', reason: 'daily-cap' })
    expect(next.status).toBe('daily-capped')
  })

  it('sets status to error without dropping existing messages on ERROR', () => {
    const sending = demoChatReducer(INITIAL_DEMO_CHAT_STATE, { type: 'SEND', content: 'hi' })
    const next = demoChatReducer(sending, { type: 'ERROR' })
    expect(next.status).toBe('error')
    expect(next.messages).toEqual([{ role: 'user', content: 'hi' }])
  })
})
