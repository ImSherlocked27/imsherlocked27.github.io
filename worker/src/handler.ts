import { isValidProjectId, buildSystemPrompt } from './projects'
import { checkAllowance, recordUsage } from './rateLimit'
import type { KVLike } from './rateLimit'
import type { ChatMessage } from './openai'

export interface HandleChatRequestParams {
  projectId: string
  sessionId: string
  ip: string
  language: 'en' | 'es'
  messages: ChatMessage[]
  kv: KVLike
  now: number
  callOpenAI: (systemPrompt: string, messages: ChatMessage[]) => Promise<string>
}

export type HandleChatResult =
  | { status: 200; body: { reply: string; remaining: number } }
  | { status: 200; body: { capped: true; reason: 'session-cap' | 'daily-cap' } }
  | { status: 404; body: { error: 'unknown-project' } }
  | { status: 400; body: { error: 'invalid-request' } }
  | { status: 502; body: { error: 'upstream-failed' } }

const MAX_TOTAL_MESSAGES = 20
const MAX_USER_MESSAGES = 5
const MAX_CONTENT_LENGTH = 2000

function isValidMessages(messages: unknown): messages is ChatMessage[] {
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_TOTAL_MESSAGES) {
    return false
  }

  let userCount = 0
  for (const m of messages) {
    if (typeof m !== 'object' || m === null) return false
    const { role, content } = m as { role?: unknown; content?: unknown }
    if (role !== 'user' && role !== 'assistant') return false
    if (typeof content !== 'string' || content.length === 0 || content.length > MAX_CONTENT_LENGTH) return false
    if (role === 'user') userCount += 1
  }

  return userCount > 0 && userCount <= MAX_USER_MESSAGES
}

export async function handleChatRequest(params: HandleChatRequestParams): Promise<HandleChatResult> {
  if (!isValidProjectId(params.projectId)) {
    return { status: 404, body: { error: 'unknown-project' } }
  }

  if (!params.sessionId || !params.ip || !isValidMessages(params.messages)) {
    return { status: 400, body: { error: 'invalid-request' } }
  }

  const allowance = await checkAllowance({
    kv: params.kv,
    sessionId: params.sessionId,
    ip: params.ip,
    projectId: params.projectId,
    now: params.now,
  })

  if (!allowance.ok) {
    return { status: 200, body: { capped: true, reason: allowance.reason } }
  }

  const systemPrompt = buildSystemPrompt(params.projectId, params.language)

  let reply: string
  try {
    reply = await params.callOpenAI(systemPrompt, params.messages)
  } catch {
    return { status: 502, body: { error: 'upstream-failed' } }
  }

  await recordUsage({
    kv: params.kv,
    sessionId: params.sessionId,
    ip: params.ip,
    projectId: params.projectId,
    now: params.now,
  })

  return { status: 200, body: { reply, remaining: allowance.remaining } }
}
