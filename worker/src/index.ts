import { handleChatRequest } from './handler'
import { callOpenAI as realCallOpenAI } from './openai'
import type { ChatMessage } from './openai'
import { corsHeaders } from './cors'
import type { KVLike } from './rateLimit'

export interface Env {
  RATE_LIMIT_KV: KVLike
  OPENAI_API_KEY: string
  OPENAI_MODEL: string
  ALLOWED_ORIGIN: string
}

const CHAT_PATH = /^\/api\/chat\/([a-z0-9-]+)$/

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin') ?? ''
    const headers = corsHeaders(origin, env.ALLOWED_ORIGIN)

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers })
    }

    const url = new URL(request.url)
    const match = url.pathname.match(CHAT_PATH)

    if (request.method !== 'POST' || !match) {
      return new Response(JSON.stringify({ error: 'not-found' }), { status: 404, headers })
    }

    let payload: { sessionId?: unknown; language?: unknown; messages?: unknown }
    try {
      payload = await request.json()
    } catch {
      return new Response(JSON.stringify({ error: 'invalid-request' }), { status: 400, headers })
    }

    const result = await handleChatRequest({
      projectId: match[1],
      sessionId: typeof payload.sessionId === 'string' ? payload.sessionId : '',
      ip: request.headers.get('CF-Connecting-IP') ?? 'unknown',
      language: payload.language === 'es' ? 'es' : 'en',
      messages: Array.isArray(payload.messages) ? (payload.messages as ChatMessage[]) : [],
      kv: env.RATE_LIMIT_KV,
      now: Date.now(),
      callOpenAI: (systemPrompt, messages) =>
        realCallOpenAI({ apiKey: env.OPENAI_API_KEY, model: env.OPENAI_MODEL, systemPrompt, messages }),
    })

    return new Response(JSON.stringify(result.body), { status: result.status, headers })
  },
}
