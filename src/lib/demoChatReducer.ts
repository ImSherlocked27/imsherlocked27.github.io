import type { DemoChatMessage } from './demoTypes'

export interface DemoChatState {
  messages: DemoChatMessage[]
  remaining: number
  status: 'idle' | 'sending' | 'error' | 'capped' | 'daily-capped'
}

export type DemoChatAction =
  | { type: 'SEND'; content: string }
  | { type: 'SUCCESS'; reply: string; remaining: number }
  | { type: 'CAPPED'; reason: 'session-cap' | 'daily-cap' }
  | { type: 'ERROR' }

export const INITIAL_DEMO_CHAT_STATE: DemoChatState = {
  messages: [],
  remaining: 5,
  status: 'idle',
}

export function demoChatReducer(state: DemoChatState, action: DemoChatAction): DemoChatState {
  switch (action.type) {
    case 'SEND':
      return {
        ...state,
        messages: [...state.messages, { role: 'user', content: action.content }],
        status: 'sending',
      }
    case 'SUCCESS':
      return {
        ...state,
        messages: [...state.messages, { role: 'assistant', content: action.reply }],
        remaining: action.remaining,
        status: action.remaining <= 0 ? 'capped' : 'idle',
      }
    case 'CAPPED':
      return { ...state, status: action.reason === 'daily-cap' ? 'daily-capped' : 'capped' }
    case 'ERROR':
      return { ...state, status: 'error' }
    default:
      return state
  }
}
