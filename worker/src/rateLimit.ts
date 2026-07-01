export interface KVLike {
  get(key: string): Promise<string | null>
  put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>
}

export interface AllowanceParams {
  kv: KVLike
  sessionId: string
  ip: string
  projectId: string
  now: number
}

export type AllowanceResult =
  | { ok: true; remaining: number }
  | { ok: false; reason: 'session-cap' | 'daily-cap' }

export const SESSION_CAP = 5
export const DAILY_CAP = 500
const SESSION_TTL_SECONDS = 24 * 60 * 60
const DAILY_TTL_SECONDS = 24 * 60 * 60

function sessionKeyFor(params: Pick<AllowanceParams, 'sessionId' | 'ip' | 'projectId'>): string {
  return `session:${params.sessionId}:ip:${params.ip}:project:${params.projectId}`
}

function ipKeyFor(params: Pick<AllowanceParams, 'ip' | 'projectId'>): string {
  return `ip:${params.ip}:project:${params.projectId}`
}

function dailyKeyFor(now: number): string {
  return `daily-budget:${new Date(now).toISOString().slice(0, 10)}`
}

export async function checkAllowance(params: AllowanceParams): Promise<AllowanceResult> {
  const sessionKey = sessionKeyFor(params)
  const ipKey = ipKeyFor(params)
  const dailyKey = dailyKeyFor(params.now)

  const [sessionRaw, ipRaw, dailyRaw] = await Promise.all([
    params.kv.get(sessionKey),
    params.kv.get(ipKey),
    params.kv.get(dailyKey),
  ])
  const sessionCount = sessionRaw ? Number(sessionRaw) : 0
  const ipCount = ipRaw ? Number(ipRaw) : 0
  const dailyCount = dailyRaw ? Number(dailyRaw) : 0

  if (sessionCount >= SESSION_CAP) return { ok: false, reason: 'session-cap' }
  if (ipCount >= SESSION_CAP) return { ok: false, reason: 'session-cap' }
  if (dailyCount >= DAILY_CAP) return { ok: false, reason: 'daily-cap' }

  return { ok: true, remaining: SESSION_CAP - sessionCount - 1 }
}

export async function recordUsage(params: AllowanceParams): Promise<void> {
  const sessionKey = sessionKeyFor(params)
  const ipKey = ipKeyFor(params)
  const dailyKey = dailyKeyFor(params.now)

  const [sessionRaw, ipRaw, dailyRaw] = await Promise.all([
    params.kv.get(sessionKey),
    params.kv.get(ipKey),
    params.kv.get(dailyKey),
  ])
  const sessionCount = (sessionRaw ? Number(sessionRaw) : 0) + 1
  const ipCount = (ipRaw ? Number(ipRaw) : 0) + 1
  const dailyCount = (dailyRaw ? Number(dailyRaw) : 0) + 1

  await Promise.all([
    params.kv.put(sessionKey, String(sessionCount), { expirationTtl: SESSION_TTL_SECONDS }),
    params.kv.put(ipKey, String(ipCount), { expirationTtl: SESSION_TTL_SECONDS }),
    params.kv.put(dailyKey, String(dailyCount), { expirationTtl: DAILY_TTL_SECONDS }),
  ])
}
