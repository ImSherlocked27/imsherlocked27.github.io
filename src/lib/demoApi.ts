import type { Language } from '../context/LanguageContext'
import type { DemoProjectId } from '../data/content'
import type { DemoChatMessage, DemoChatResponse } from './demoTypes'

const SESSION_STORAGE_KEY = 'demo-session-id'

export function getOrCreateSessionId(): string {
  const existing = window.localStorage.getItem(SESSION_STORAGE_KEY)
  if (existing) return existing

  const created = crypto.randomUUID()
  window.localStorage.setItem(SESSION_STORAGE_KEY, created)
  return created
}

export async function sendDemoMessage(
  projectId: DemoProjectId,
  language: Language,
  messages: DemoChatMessage[],
): Promise<DemoChatResponse> {
  const sessionId = getOrCreateSessionId()

  const response = await fetch(`${import.meta.env.VITE_DEMO_API_BASE}/api/chat/${projectId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, language, messages }),
  })

  if (!response.ok) {
    throw new Error(`Demo request failed with status ${response.status}`)
  }

  return response.json() as Promise<DemoChatResponse>
}
