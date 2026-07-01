export interface DemoChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export type DemoChatResponse =
  | { capped: true; reason: 'session-cap' | 'daily-cap' }
  | { capped?: false; reply: string; remaining: number }
