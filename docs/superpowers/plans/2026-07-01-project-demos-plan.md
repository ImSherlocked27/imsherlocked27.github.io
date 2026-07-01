# Interactive Project Demos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the "coming soon" project placeholders on `imsherlocked27.github.io` with two live, LLM-backed chat demos (logistics analytics assistant, car marketplace concierge), backed by a Cloudflare Worker that hides the OpenAI key and enforces usage caps, plus a plain write-up card for the neighborhood magazine project (no demo).

**Architecture:** A pure-logic-first design on both sides. The Worker splits into small, independently-unit-testable modules (`projects`, `rateLimit`, `openai`, `cors`, `handler`) with a thin `index.ts` adapter that only touches `Request`/`Response`/KV bindings — tested manually via `wrangler dev` + curl. The frontend splits UI state into a pure reducer (`demoChatReducer`) and a thin network wrapper (`demoApi`), both unit-tested with Vitest; the React component (`ProjectDemoChat`) is a thin wire-up verified by manual QA in the browser.

**Tech Stack:** Cloudflare Workers + Workers KV (backend), TypeScript + Vitest (both sides), React 19 + Vite (frontend, existing stack), OpenAI Chat Completions API.

## Global Constraints

- Per-visitor cap: 5 user messages per project per 24h, keyed by session id (localStorage) + IP, via Workers KV.
- Global daily budget cap shared across both demos, via Workers KV; once hit, all demos show a "try again tomorrow" message.
- CORS on the Worker allows only `https://imsherlocked27.github.io`.
- The OpenAI API key is a Cloudflare Worker secret and must never appear in the frontend bundle or repo.
- All demo content (dataset/catalog) is small, fictional, and hardcoded — no real company data.
- The neighborhood magazine project gets a plain descriptive card only — no chat widget, no Worker route, no system prompt.
- Responses are non-streaming (single request/response per turn).
- The assistant must respond in the visitor's currently selected site language (`en`/`es`).
- A failed OpenAI call must not consume the visitor's message allowance.

---

## Worker (`worker/`)

### Task 1: Worker scaffold + project personas (`projects.ts`)

**Files:**
- Create: `worker/package.json`
- Create: `worker/tsconfig.json`
- Create: `worker/vitest.config.ts`
- Create: `worker/src/projects.ts`
- Test: `worker/src/projects.test.ts`

**Interfaces:**
- Produces: `type DemoProjectId = 'logistics-analytics' | 'car-marketplace'`, `isValidProjectId(id: string): id is DemoProjectId`, `buildSystemPrompt(projectId: DemoProjectId, language: 'en' | 'es'): string`

- [ ] **Step 1: Scaffold the worker package**

Run from the repo root:

```bash
mkdir worker
cd worker
npm init -y
npm install -D typescript vitest wrangler
```

- [ ] **Step 2: Add `worker/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "es2022",
    "lib": ["es2022"],
    "module": "es2022",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "noEmit": true,
    "types": []
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Add `worker/vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
  },
})
```

- [ ] **Step 4: Edit `worker/package.json` scripts**

Replace the generated `"scripts"` block with:

```json
  "scripts": {
    "test": "vitest run",
    "dev": "wrangler dev",
    "deploy": "wrangler deploy"
  },
```

Also set `"type": "module"` and `"private": true` at the top level of `worker/package.json`.

- [ ] **Step 5: Write the failing test**

Create `worker/src/projects.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { buildSystemPrompt, isValidProjectId } from './projects'

describe('isValidProjectId', () => {
  it('accepts known project ids', () => {
    expect(isValidProjectId('logistics-analytics')).toBe(true)
    expect(isValidProjectId('car-marketplace')).toBe(true)
  })

  it('rejects unknown project ids', () => {
    expect(isValidProjectId('neighborhood-magazine')).toBe(false)
    expect(isValidProjectId('')).toBe(false)
  })
})

describe('buildSystemPrompt', () => {
  it('returns a non-empty English prompt for logistics-analytics', () => {
    const prompt = buildSystemPrompt('logistics-analytics', 'en')
    expect(prompt.length).toBeGreaterThan(0)
    expect(prompt).toContain('Northstar Logistics')
  })

  it('returns a non-empty Spanish prompt for logistics-analytics', () => {
    const prompt = buildSystemPrompt('logistics-analytics', 'es')
    expect(prompt.length).toBeGreaterThan(0)
    expect(prompt).toContain('Northstar Logistics')
  })

  it('returns a non-empty English prompt for car-marketplace', () => {
    const prompt = buildSystemPrompt('car-marketplace', 'en')
    expect(prompt).toContain('Concierge')
  })

  it('returns a non-empty Spanish prompt for car-marketplace', () => {
    const prompt = buildSystemPrompt('car-marketplace', 'es')
    expect(prompt).toContain('Concierge')
  })
})
```

- [ ] **Step 6: Run test to verify it fails**

Run (from `worker/`): `npx vitest run src/projects.test.ts`
Expected: FAIL — `Cannot find module './projects'`

- [ ] **Step 7: Implement `worker/src/projects.ts`**

```ts
export type DemoProjectId = 'logistics-analytics' | 'car-marketplace'

export function isValidProjectId(id: string): id is DemoProjectId {
  return id === 'logistics-analytics' || id === 'car-marketplace'
}

const LOGISTICS_PROMPT_EN = `You are the analytics assistant for Northstar Logistics, a fictional logistics company used for demo purposes only.

You can only answer questions using the following fictional dataset. Never invent data, company names, or numbers that are not derivable from it.

Deliveries dataset:
| order_id | carrier            | provider_id | status      | scheduled_date | delivered_date | late    |
|----------|--------------------|-------------|-------------|-----------------|-----------------|---------|
| ORD-1001 | Rapid Transit Co   | P-01        | Delivered   | 2026-06-01      | 2026-06-01      | No      |
| ORD-1002 | Rapid Transit Co   | P-01        | Delivered   | 2026-06-02      | 2026-06-04      | Yes     |
| ORD-1003 | BlueArrow Freight  | P-02        | Delivered   | 2026-06-02      | 2026-06-02      | No      |
| ORD-1004 | BlueArrow Freight  | P-02        | Delivered   | 2026-06-03      | 2026-06-05      | Yes     |
| ORD-1005 | CoastLine Courier  | P-03        | Delivered   | 2026-06-03      | 2026-06-03      | No      |
| ORD-1006 | Rapid Transit Co   | P-01        | Delivered   | 2026-06-04      | 2026-06-04      | No      |
| ORD-1007 | BlueArrow Freight  | P-02        | In Transit  | 2026-06-05      | -               | Unknown |
| ORD-1008 | CoastLine Courier  | P-03        | Delivered   | 2026-06-05      | 2026-06-07      | Yes     |

Keep answers to a few sentences. After the answer, add a short fenced code block labeled "sql" that narrates, in plain SQL-like pseudocode, the kind of security-scoped query the real product would run to produce that answer (for example, filtering by provider_id). This block is illustrative only, not an executed query.

If asked about anything outside this dataset (real companies, other data), briefly say this is a small anonymized demo and explain what the real product does instead.

Respond in English.`

const LOGISTICS_PROMPT_ES = `Sos el asistente de analítica de Northstar Logistics, una empresa de logística ficticia usada solo para esta demo.

Solo podés responder preguntas usando el siguiente dataset ficticio. Nunca inventes datos, nombres de empresas, ni números que no se puedan derivar de él.

Dataset de entregas:
| order_id | carrier            | provider_id | status      | scheduled_date | delivered_date | late    |
|----------|--------------------|-------------|-------------|-----------------|-----------------|---------|
| ORD-1001 | Rapid Transit Co   | P-01        | Delivered   | 2026-06-01      | 2026-06-01      | No      |
| ORD-1002 | Rapid Transit Co   | P-01        | Delivered   | 2026-06-02      | 2026-06-04      | Yes     |
| ORD-1003 | BlueArrow Freight  | P-02        | Delivered   | 2026-06-02      | 2026-06-02      | No      |
| ORD-1004 | BlueArrow Freight  | P-02        | Delivered   | 2026-06-03      | 2026-06-05      | Yes     |
| ORD-1005 | CoastLine Courier  | P-03        | Delivered   | 2026-06-03      | 2026-06-03      | No      |
| ORD-1006 | Rapid Transit Co   | P-01        | Delivered   | 2026-06-04      | 2026-06-04      | No      |
| ORD-1007 | BlueArrow Freight  | P-02        | In Transit  | 2026-06-05      | -               | Unknown |
| ORD-1008 | CoastLine Courier  | P-03        | Delivered   | 2026-06-05      | 2026-06-07      | Yes     |

Mantené las respuestas en pocas oraciones. Después de la respuesta, agregá un bloque de código corto etiquetado "sql" que narre, en pseudocódigo tipo SQL, la consulta con alcance de seguridad que el producto real ejecutaría para producir esa respuesta (por ejemplo, filtrando por provider_id). Ese bloque es solo ilustrativo, no se ejecuta realmente.

Si te preguntan algo fuera de este dataset (empresas reales, otros datos), decí brevemente que esta es una demo pequeña y anonimizada, y explicá qué hace el producto real en ese caso.

Respondé en español.`

const CAR_PROMPT_EN = `You are "Concierge," the buyer assistant for a fictional used-car marketplace demo. You can only recommend cars from the following fictional catalog. Never invent cars, prices, or features outside it.

Catalog:
| id  | make       | model    | year | price_usd | mileage_km | body_type | features                        |
|-----|------------|----------|------|-----------|------------|-----------|----------------------------------|
| C1  | Toyota     | Corolla  | 2019 | 14500     | 62000      | Sedan     | Backup camera, Bluetooth         |
| C2  | Honda      | CR-V     | 2020 | 21800     | 48000      | SUV       | AWD, Sunroof, Backup camera      |
| C3  | Ford       | Focus    | 2018 | 10900     | 78000      | Hatchback | Bluetooth, Cruise control        |
| C4  | Volkswagen | Tiguan   | 2021 | 24800     | 32000      | SUV       | AWD, Leather seats, Sunroof      |
| C5  | Chevrolet  | Onix     | 2022 | 13200     | 21000      | Hatchback | Bluetooth, Backup camera         |
| C6  | Toyota     | RAV4     | 2020 | 23500     | 39000      | SUV       | AWD, Backup camera               |
| C7  | Nissan     | Versa    | 2019 | 11700     | 55000      | Sedan     | Bluetooth                        |
| C8  | Jeep       | Renegade | 2021 | 19900     | 41000      | SUV       | 4x4, Cruise control              |
| C9  | Fiat       | Cronos   | 2022 | 12400     | 18000      | Sedan     | Bluetooth, Backup camera         |
| C10 | Renault    | Duster   | 2020 | 16800     | 47000      | SUV       | 4x4, Cruise control              |

Ask a short clarifying question if the visitor's request is too vague (budget, body type, or a must-have feature). Once you have enough to narrow it down, recommend 1 to 3 cars from the catalog with a one-line reason each. Keep replies concise.

Respond in English.`

const CAR_PROMPT_ES = `Sos "Concierge", el asistente de compradores de un marketplace de autos usados ficticio para esta demo. Solo podés recomendar autos del siguiente catálogo ficticio. Nunca inventes autos, precios ni características fuera de él.

Catálogo:
| id  | make       | model    | year | price_usd | mileage_km | body_type | features                        |
|-----|------------|----------|------|-----------|------------|-----------|----------------------------------|
| C1  | Toyota     | Corolla  | 2019 | 14500     | 62000      | Sedan     | Backup camera, Bluetooth         |
| C2  | Honda      | CR-V     | 2020 | 21800     | 48000      | SUV       | AWD, Sunroof, Backup camera      |
| C3  | Ford       | Focus    | 2018 | 10900     | 78000      | Hatchback | Bluetooth, Cruise control        |
| C4  | Volkswagen | Tiguan   | 2021 | 24800     | 32000      | SUV       | AWD, Leather seats, Sunroof      |
| C5  | Chevrolet  | Onix     | 2022 | 13200     | 21000      | Hatchback | Bluetooth, Backup camera         |
| C6  | Toyota     | RAV4     | 2020 | 23500     | 39000      | SUV       | AWD, Backup camera               |
| C7  | Nissan     | Versa    | 2019 | 11700     | 55000      | Sedan     | Bluetooth                        |
| C8  | Jeep       | Renegade | 2021 | 19900     | 41000      | SUV       | 4x4, Cruise control              |
| C9  | Fiat       | Cronos   | 2022 | 12400     | 18000      | Sedan     | Bluetooth, Backup camera         |
| C10 | Renault    | Duster   | 2020 | 16800     | 47000      | SUV       | 4x4, Cruise control              |

Hacé una pregunta corta de aclaración si el pedido del visitante es muy vago (presupuesto, tipo de carrocería, o alguna característica indispensable). Cuando tengas suficiente información, recomendá de 1 a 3 autos del catálogo con una razón breve para cada uno. Mantené las respuestas concisas.

Respondé en español.`

export function buildSystemPrompt(projectId: DemoProjectId, language: 'en' | 'es'): string {
  if (projectId === 'logistics-analytics') {
    return language === 'es' ? LOGISTICS_PROMPT_ES : LOGISTICS_PROMPT_EN
  }
  return language === 'es' ? CAR_PROMPT_ES : CAR_PROMPT_EN
}
```

- [ ] **Step 8: Run test to verify it passes**

Run (from `worker/`): `npx vitest run src/projects.test.ts`
Expected: PASS (6 tests)

- [ ] **Step 9: Commit**

```bash
git add worker/package.json worker/package-lock.json worker/tsconfig.json worker/vitest.config.ts worker/src/projects.ts worker/src/projects.test.ts
git commit -m "worker: scaffold project + add demo personas"
```

---

### Task 2: Rate limiting (`rateLimit.ts`)

**Files:**
- Create: `worker/src/rateLimit.ts`
- Test: `worker/src/rateLimit.test.ts`

**Interfaces:**
- Consumes: nothing from Task 1
- Produces: `interface KVLike { get(key: string): Promise<string | null>; put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void> }`, `SESSION_CAP: number`, `DAILY_CAP: number`, `checkAllowance(params: { kv: KVLike; sessionId: string; ip: string; projectId: string; now: number }): Promise<{ ok: true; remaining: number } | { ok: false; reason: 'session-cap' | 'daily-cap' }>`, `recordUsage(params: same shape as above): Promise<void>`

- [ ] **Step 1: Write the failing test**

Create `worker/src/rateLimit.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { checkAllowance, recordUsage, SESSION_CAP, DAILY_CAP } from './rateLimit'
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

const BASE = {
  sessionId: 's1',
  ip: '1.2.3.4',
  projectId: 'logistics-analytics',
  now: Date.parse('2026-07-01T00:00:00Z'),
}

describe('checkAllowance', () => {
  it('allows a first message and reports remaining count', async () => {
    const kv = createFakeKV()
    const result = await checkAllowance({ kv, ...BASE })
    expect(result).toEqual({ ok: true, remaining: SESSION_CAP - 1 })
  })

  it('blocks once the session cap is reached', async () => {
    const kv = createFakeKV({ 'session:s1:ip:1.2.3.4:project:logistics-analytics': String(SESSION_CAP) })
    const result = await checkAllowance({ kv, ...BASE })
    expect(result).toEqual({ ok: false, reason: 'session-cap' })
  })

  it('blocks once the daily cap is reached, even with session budget left', async () => {
    const kv = createFakeKV({ 'daily-budget:2026-07-01': String(DAILY_CAP) })
    const result = await checkAllowance({ kv, ...BASE })
    expect(result).toEqual({ ok: false, reason: 'daily-cap' })
  })
})

describe('recordUsage', () => {
  it('increments both the session and daily counters from zero', async () => {
    const kv = createFakeKV()
    await recordUsage({ kv, ...BASE })
    expect(await kv.get('session:s1:ip:1.2.3.4:project:logistics-analytics')).toBe('1')
    expect(await kv.get('daily-budget:2026-07-01')).toBe('1')
  })

  it('increments from an existing count', async () => {
    const kv = createFakeKV({
      'session:s1:ip:1.2.3.4:project:logistics-analytics': '2',
      'daily-budget:2026-07-01': '10',
    })
    await recordUsage({ kv, ...BASE })
    expect(await kv.get('session:s1:ip:1.2.3.4:project:logistics-analytics')).toBe('3')
    expect(await kv.get('daily-budget:2026-07-01')).toBe('11')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run (from `worker/`): `npx vitest run src/rateLimit.test.ts`
Expected: FAIL — `Cannot find module './rateLimit'`

- [ ] **Step 3: Implement `worker/src/rateLimit.ts`**

```ts
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

function dailyKeyFor(now: number): string {
  return `daily-budget:${new Date(now).toISOString().slice(0, 10)}`
}

export async function checkAllowance(params: AllowanceParams): Promise<AllowanceResult> {
  const sessionKey = sessionKeyFor(params)
  const dailyKey = dailyKeyFor(params.now)

  const [sessionRaw, dailyRaw] = await Promise.all([params.kv.get(sessionKey), params.kv.get(dailyKey)])
  const sessionCount = sessionRaw ? Number(sessionRaw) : 0
  const dailyCount = dailyRaw ? Number(dailyRaw) : 0

  if (sessionCount >= SESSION_CAP) return { ok: false, reason: 'session-cap' }
  if (dailyCount >= DAILY_CAP) return { ok: false, reason: 'daily-cap' }

  return { ok: true, remaining: SESSION_CAP - sessionCount - 1 }
}

export async function recordUsage(params: AllowanceParams): Promise<void> {
  const sessionKey = sessionKeyFor(params)
  const dailyKey = dailyKeyFor(params.now)

  const [sessionRaw, dailyRaw] = await Promise.all([params.kv.get(sessionKey), params.kv.get(dailyKey)])
  const sessionCount = (sessionRaw ? Number(sessionRaw) : 0) + 1
  const dailyCount = (dailyRaw ? Number(dailyRaw) : 0) + 1

  await Promise.all([
    params.kv.put(sessionKey, String(sessionCount), { expirationTtl: SESSION_TTL_SECONDS }),
    params.kv.put(dailyKey, String(dailyCount), { expirationTtl: DAILY_TTL_SECONDS }),
  ])
}
```

Note: Workers KV is eventually consistent and this is a read-then-write counter, not an atomic increment. For a low-traffic portfolio demo this is an accepted, documented tradeoff (a true atomic counter would need Durable Objects, which is out of scope for this feature).

- [ ] **Step 4: Run test to verify it passes**

Run (from `worker/`): `npx vitest run src/rateLimit.test.ts`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add worker/src/rateLimit.ts worker/src/rateLimit.test.ts
git commit -m "worker: add per-session and daily rate limiting"
```

---

### Task 3: OpenAI client (`openai.ts`)

**Files:**
- Create: `worker/src/openai.ts`
- Test: `worker/src/openai.test.ts`

**Interfaces:**
- Produces: `interface ChatMessage { role: 'user' | 'assistant'; content: string }`, `callOpenAI(params: { apiKey: string; model: string; systemPrompt: string; messages: ChatMessage[]; fetchImpl?: typeof fetch }): Promise<string>`

- [ ] **Step 1: Write the failing test**

Create `worker/src/openai.test.ts`:

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run (from `worker/`): `npx vitest run src/openai.test.ts`
Expected: FAIL — `Cannot find module './openai'`

- [ ] **Step 3: Implement `worker/src/openai.ts`**

```ts
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface CallOpenAIParams {
  apiKey: string
  model: string
  systemPrompt: string
  messages: ChatMessage[]
  fetchImpl?: typeof fetch
}

export async function callOpenAI(params: CallOpenAIParams): Promise<string> {
  const fetchFn = params.fetchImpl ?? fetch

  const response = await fetchFn('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${params.apiKey}`,
    },
    body: JSON.stringify({
      model: params.model,
      messages: [{ role: 'system', content: params.systemPrompt }, ...params.messages],
      max_tokens: 400,
      temperature: 0.4,
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenAI request failed with status ${response.status}`)
  }

  const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> }
  const content = data.choices?.[0]?.message?.content

  if (typeof content !== 'string' || content.length === 0) {
    throw new Error('OpenAI response missing content')
  }

  return content
}
```

- [ ] **Step 4: Run test to verify it passes**

Run (from `worker/`): `npx vitest run src/openai.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add worker/src/openai.ts worker/src/openai.test.ts
git commit -m "worker: add OpenAI chat completion client"
```

---

### Task 4: CORS helper (`cors.ts`)

**Files:**
- Create: `worker/src/cors.ts`
- Test: `worker/src/cors.test.ts`

**Interfaces:**
- Produces: `corsHeaders(origin: string, allowedOrigin: string): Record<string, string>`

- [ ] **Step 1: Write the failing test**

Create `worker/src/cors.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { corsHeaders } from './cors'

describe('corsHeaders', () => {
  it('allows the configured origin', () => {
    const headers = corsHeaders('https://imsherlocked27.github.io', 'https://imsherlocked27.github.io')
    expect(headers['Access-Control-Allow-Origin']).toBe('https://imsherlocked27.github.io')
  })

  it('omits the allow-origin header for any other origin', () => {
    const headers = corsHeaders('https://evil.example', 'https://imsherlocked27.github.io')
    expect(headers['Access-Control-Allow-Origin']).toBeUndefined()
  })

  it('always includes the base JSON + method headers', () => {
    const headers = corsHeaders('https://evil.example', 'https://imsherlocked27.github.io')
    expect(headers['Content-Type']).toBe('application/json')
    expect(headers['Access-Control-Allow-Methods']).toBe('POST, OPTIONS')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run (from `worker/`): `npx vitest run src/cors.test.ts`
Expected: FAIL — `Cannot find module './cors'`

- [ ] **Step 3: Implement `worker/src/cors.ts`**

```ts
export function corsHeaders(origin: string, allowedOrigin: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  if (origin === allowedOrigin) {
    headers['Access-Control-Allow-Origin'] = allowedOrigin
  }

  return headers
}
```

- [ ] **Step 4: Run test to verify it passes**

Run (from `worker/`): `npx vitest run src/cors.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add worker/src/cors.ts worker/src/cors.test.ts
git commit -m "worker: add CORS header helper"
```

---

### Task 5: Request handler (`handler.ts`)

**Files:**
- Create: `worker/src/handler.ts`
- Test: `worker/src/handler.test.ts`

**Interfaces:**
- Consumes: `KVLike`, `checkAllowance`, `recordUsage` from `./rateLimit` (Task 2); `isValidProjectId`, `buildSystemPrompt`, `DemoProjectId` from `./projects` (Task 1); `ChatMessage` from `./openai` (Task 3)
- Produces: `handleChatRequest(params: HandleChatRequestParams): Promise<HandleChatResult>`

- [ ] **Step 1: Write the failing test**

Create `worker/src/handler.test.ts`:

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run (from `worker/`): `npx vitest run src/handler.test.ts`
Expected: FAIL — `Cannot find module './handler'`

- [ ] **Step 3: Implement `worker/src/handler.ts`**

```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run (from `worker/`): `npx vitest run src/handler.test.ts`
Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add worker/src/handler.ts worker/src/handler.test.ts
git commit -m "worker: add core chat request handler"
```

---

### Task 6: Worker entrypoint, config, and deploy docs

**Files:**
- Create: `worker/src/index.ts`
- Create: `worker/wrangler.toml`
- Create: `worker/README.md`
- Modify: `.gitignore` (repo root)

**Interfaces:**
- Consumes: `handleChatRequest` from `./handler` (Task 5), `callOpenAI` from `./openai` (Task 3), `corsHeaders` from `./cors` (Task 4), `KVLike` from `./rateLimit` (Task 2)
- Produces: the deployed HTTP endpoint `POST /api/chat/:projectId`

- [ ] **Step 1: Implement `worker/src/index.ts`**

```ts
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
```

- [ ] **Step 2: Create `worker/wrangler.toml`**

```toml
name = "curriculum-demo-api"
main = "src/index.ts"
compatibility_date = "2026-06-01"

[[kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "REPLACE_WITH_KV_NAMESPACE_ID"

[vars]
ALLOWED_ORIGIN = "https://imsherlocked27.github.io"
OPENAI_MODEL = "gpt-4o-mini"
```

- [ ] **Step 3: Add `.dev.vars`, `.wrangler`, and `worker/node_modules` to `.gitignore`**

Append to the repo-root `.gitignore`:

```
# Worker
worker/node_modules
worker/.wrangler
worker/.dev.vars
```

- [ ] **Step 4: Write `worker/README.md`**

```markdown
# Demo API Worker

Backend proxy for the two live project demos on the portfolio site. Holds
the OpenAI API key, enforces the per-visitor and daily usage caps, and
returns chat replies. See `../docs/superpowers/specs/2026-07-01-project-demos-design.md`
for the full design.

## One-time setup

1. Install dependencies: `npm install` (from this directory).
2. Log in to Cloudflare: `npx wrangler login`.
3. Create the KV namespace used for rate limiting:
   `npx wrangler kv namespace create RATE_LIMIT_KV`
   Copy the returned `id` into `wrangler.toml` under `[[kv_namespaces]]`.
4. Set the OpenAI API key as a secret (never commit it):
   `npx wrangler secret put OPENAI_API_KEY`
5. Review `OPENAI_MODEL` and `ALLOWED_ORIGIN` in `wrangler.toml` — update
   `OPENAI_MODEL` if a cheaper/newer model is available by the time you deploy.

## Local development

1. Create `.dev.vars` (gitignored) with:
   ```
   OPENAI_API_KEY=sk-...
   ```
2. Run `npm run dev` — starts the worker at `http://localhost:8787`.
3. Smoke test:
   ```bash
   curl -i -X POST http://localhost:8787/api/chat/logistics-analytics \
     -H "Content-Type: application/json" \
     -H "Origin: https://imsherlocked27.github.io" \
     -d '{"sessionId":"test-1","language":"en","messages":[{"role":"user","content":"How many deliveries were late last week?"}]}'
   ```
   Expected: `200` with a JSON body containing `reply` and `remaining: 4`.
4. Repeat the same request 4 more times (same `sessionId`) — `remaining`
   should count down to `0`.
5. Send a 6th request with the same `sessionId` — expect
   `{"capped":true,"reason":"session-cap"}`.
6. Repeat step 3 with `-H "Origin: https://evil.example"` — the response
   should NOT include an `Access-Control-Allow-Origin` header.

## Deploy

`npm run deploy` (requires steps 1-4 above to be complete).

After deploying, note the worker URL (e.g.
`https://curriculum-demo-api.<your-subdomain>.workers.dev`) — it's needed
by the frontend as `VITE_DEMO_API_BASE` (see repo root `README.md`).
```

- [ ] **Step 5: Manual smoke test**

Follow the "Local development" steps in `worker/README.md` above end to end
(steps 1-6) and confirm each expected result.

- [ ] **Step 6: Commit**

```bash
git add worker/src/index.ts worker/wrangler.toml worker/README.md .gitignore
git commit -m "worker: add entrypoint, wrangler config, and deploy docs"
```

---

## Frontend (`src/`)

### Task 7: Update project data and copy (`content.ts`)

**Files:**
- Modify: `src/data/content.ts`

**Interfaces:**
- Produces: `type DemoProjectId = 'logistics-analytics' | 'car-marketplace'`, `interface ProjectEntry { title: Localized; teaser: Localized; demoId?: DemoProjectId }`, `projects: ProjectEntry[]`, new `ui` string keys: `tryDemo`, `demoInputPlaceholder`, `demoRemaining`, `demoSending`, `demoEndTitle`, `demoEndCta`, `demoError`, `demoDailyLimit`

- [ ] **Step 1: Replace the `ProjectPlaceholder` interface**

In `src/data/content.ts`, replace:

```ts
export interface ProjectPlaceholder {
  title: Localized
  teaser: Localized
}
```

with:

```ts
export type DemoProjectId = 'logistics-analytics' | 'car-marketplace'

export interface ProjectEntry {
  title: Localized
  teaser: Localized
  demoId?: DemoProjectId
}
```

- [ ] **Step 2: Update the `ui` object**

Replace the `comingSoon` line:

```ts
  comingSoon: { en: 'Coming soon', es: 'Próximamente' } as Localized,
```

with:

```ts
  tryDemo: { en: 'Try it live', es: 'Probar en vivo' } as Localized,
  demoInputPlaceholder: { en: 'Ask a question…', es: 'Hacé una pregunta…' } as Localized,
  demoRemaining: { en: 'messages left', es: 'mensajes restantes' } as Localized,
  demoSending: { en: 'Thinking…', es: 'Pensando…' } as Localized,
  demoEndTitle: { en: "That's the demo!", es: '¡Eso fue la demo!' } as Localized,
  demoEndCta: { en: 'Want the full version? Get in touch', es: '¿Querés la versión completa? Escribime' } as Localized,
  demoError: { en: 'Something went wrong. Try again.', es: 'Algo salió mal. Intentá de nuevo.' } as Localized,
  demoDailyLimit: {
    en: "Today's demo budget is used up — try again tomorrow.",
    es: 'El presupuesto de demos de hoy se agotó — probá mañana.',
  } as Localized,
```

- [ ] **Step 3: Replace the `projects` array**

Replace the whole `export const projects: ProjectPlaceholder[] = [...]` block with:

```ts
export const projects: ProjectEntry[] = [
  {
    title: { en: 'Conversational Logistics Analytics', es: 'Analítica Logística Conversacional' },
    teaser: {
      en: 'A secure, chat-based analytics assistant for logistics operations — ask a plain-language question and get a data-grounded answer, with every query automatically scoped to what you’re authorized to see.',
      es: 'Un asistente de analítica conversacional y seguro para operaciones logísticas — hacé una pregunta en lenguaje natural y obtené una respuesta basada en datos, con cada consulta automáticamente limitada a lo que estás autorizado a ver.',
    },
    demoId: 'logistics-analytics',
  },
  {
    title: { en: 'AI-First Used-Car Marketplace', es: 'Marketplace de Autos Usados AI-First' },
    teaser: {
      en: 'A used-car marketplace with AI woven through every surface: a buyer concierge for search, AI-generated listings and pricing for sellers, and AI-summarized leads for operations.',
      es: 'Un marketplace de autos usados con IA integrada en cada superficie: un concierge conversacional para compradores, publicaciones y valuaciones generadas por IA para vendedores, y leads resumidos por IA para el equipo de operaciones.',
    },
    demoId: 'car-marketplace',
  },
  {
    title: { en: 'Neighborhood Digital Magazine Platform', es: 'Plataforma de Revista Digital de Barrio' },
    teaser: {
      en: 'A hyper-local platform connecting residents, businesses, and community organizations — local ads, neighborhood news, and staff-moderated content, with AI-powered moderation and listing generation as a natural next step.',
      es: 'Una plataforma hiperlocal que conecta vecinos, comercios y organizaciones comunitarias — anuncios locales, noticias de barrio y contenido moderado por el equipo, con moderación y generación de publicaciones por IA como un paso natural a futuro.',
    },
  },
]
```

- [ ] **Step 4: Verify the project type-checks**

Run (from repo root): `npx tsc -b`
Expected: no errors. (`Projects.tsx` still references the old shape until Task 11 — if `tsc -b` fails only on `Projects.tsx`'s use of `ui.comingSoon`, that's expected and will be fixed in Task 11; confirm there are no errors in `content.ts` itself by running `npx tsc --noEmit -p tsconfig.app.json` and checking the output only mentions `Projects.tsx`.)

- [ ] **Step 5: Commit**

```bash
git add src/data/content.ts
git commit -m "content: add demo project ids and rewrite project copy"
```

---

### Task 8: Demo chat types and reducer

**Files:**
- Create: `src/lib/demoTypes.ts`
- Create: `src/lib/demoChatReducer.ts`
- Test: `src/lib/demoChatReducer.test.ts`

**Interfaces:**
- Produces: `interface DemoChatMessage { role: 'user' | 'assistant'; content: string }`, `type DemoChatResponse = { capped: true; reason: 'session-cap' | 'daily-cap' } | { capped?: false; reply: string; remaining: number }`, `interface DemoChatState { messages: DemoChatMessage[]; remaining: number; status: 'idle' | 'sending' | 'error' | 'capped' | 'daily-capped' }`, `INITIAL_DEMO_CHAT_STATE: DemoChatState`, `demoChatReducer(state: DemoChatState, action: DemoChatAction): DemoChatState`

- [ ] **Step 1: Add the project-wide test tooling**

Run (from repo root):

```bash
npm install -D vitest
```

Create `vitest.config.ts` at the repo root:

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
  },
})
```

Add to `package.json` `"scripts"`:

```json
    "test": "vitest run",
```

- [ ] **Step 2: Create `src/lib/demoTypes.ts`**

```ts
export interface DemoChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export type DemoChatResponse =
  | { capped: true; reason: 'session-cap' | 'daily-cap' }
  | { capped?: false; reply: string; remaining: number }
```

- [ ] **Step 3: Write the failing test**

Create `src/lib/demoChatReducer.test.ts`:

```ts
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
```

- [ ] **Step 4: Run test to verify it fails**

Run (from repo root): `npx vitest run src/lib/demoChatReducer.test.ts`
Expected: FAIL — `Cannot find module './demoChatReducer'`

- [ ] **Step 5: Implement `src/lib/demoChatReducer.ts`**

```ts
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
```

- [ ] **Step 6: Run test to verify it passes**

Run (from repo root): `npx vitest run src/lib/demoChatReducer.test.ts`
Expected: PASS (7 tests)

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json vitest.config.ts src/lib/demoTypes.ts src/lib/demoChatReducer.ts src/lib/demoChatReducer.test.ts
git commit -m "frontend: add demo chat types and state reducer"
```

---

### Task 9: Demo API client (`demoApi.ts`)

**Files:**
- Create: `src/vite-env.d.ts`
- Create: `src/lib/demoApi.ts`
- Test: `src/lib/demoApi.test.ts`
- Create: `.env.example` (repo root)

**Interfaces:**
- Consumes: `DemoChatMessage`, `DemoChatResponse` from `./demoTypes` (Task 8); `DemoProjectId`, `Language` types
- Produces: `getOrCreateSessionId(): string`, `sendDemoMessage(projectId: DemoProjectId, language: Language, messages: DemoChatMessage[]): Promise<DemoChatResponse>`

- [ ] **Step 1: Add Vite env typing**

Create `src/vite-env.d.ts`:

```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEMO_API_BASE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

- [ ] **Step 2: Add `.env.example` at the repo root**

```
VITE_DEMO_API_BASE=https://curriculum-demo-api.your-subdomain.workers.dev
```

Add `.env` and `.env.local` to `.gitignore` (append, since `*.local` is already covered by the existing `*.local` glob — confirm no change needed there, but add `.env` explicitly since it doesn't match `*.local`):

```
.env
```

- [ ] **Step 3: Write the failing test**

Create `src/lib/demoApi.test.ts`:

```ts
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
```

- [ ] **Step 4: Run test to verify it fails**

Run (from repo root): `npx vitest run src/lib/demoApi.test.ts`
Expected: FAIL — `Cannot find module './demoApi'`

- [ ] **Step 5: Update `vitest.config.ts` to use the jsdom environment**

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
  },
})
```

Run (from repo root):

```bash
npm install -D jsdom
```

- [ ] **Step 6: Implement `src/lib/demoApi.ts`**

```ts
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
```

- [ ] **Step 7: Run test to verify it passes**

Run (from repo root): `npx vitest run src/lib/demoApi.test.ts src/lib/demoChatReducer.test.ts`
Expected: PASS (11 tests total: 7 reducer + 4 demoApi)

- [ ] **Step 8: Commit**

```bash
git add src/vite-env.d.ts .env.example .gitignore vitest.config.ts package.json package-lock.json src/lib/demoApi.ts src/lib/demoApi.test.ts
git commit -m "frontend: add demo API client and env config"
```

---

### Task 10: Chat widget component (`ProjectDemoChat.tsx`)

**Files:**
- Create: `src/components/ProjectDemoChat.tsx`
- Modify: `src/index.css`

**Interfaces:**
- Consumes: `demoChatReducer`, `INITIAL_DEMO_CHAT_STATE` from `../lib/demoChatReducer` (Task 8); `sendDemoMessage` from `../lib/demoApi` (Task 9); `DemoProjectId`, `hero`, `ui` from `../data/content` (Task 7); `useLanguage` from `../context/LanguageContext`
- Produces: `<ProjectDemoChat projectId={DemoProjectId} />` React component

This component is a thin wire-up of already-unit-tested logic (the reducer and the API client), so it is verified with manual QA in the browser rather than an automated test — see Step 3.

- [ ] **Step 1: Implement `src/components/ProjectDemoChat.tsx`**

```tsx
import { useReducer, useState } from 'react'
import type { FormEvent } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { hero, ui } from '../data/content'
import type { DemoProjectId } from '../data/content'
import { sendDemoMessage } from '../lib/demoApi'
import { demoChatReducer, INITIAL_DEMO_CHAT_STATE } from '../lib/demoChatReducer'

interface ProjectDemoChatProps {
  projectId: DemoProjectId
}

export function ProjectDemoChat({ projectId }: ProjectDemoChatProps) {
  const { language } = useLanguage()
  const [state, dispatch] = useReducer(demoChatReducer, INITIAL_DEMO_CHAT_STATE)
  const [input, setInput] = useState('')

  const isSending = state.status === 'sending'
  const isDone = state.status === 'capped' || state.status === 'daily-capped'

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const content = input.trim()
    if (!content || isSending || isDone) return

    const historyForRequest = [...state.messages, { role: 'user' as const, content }]
    dispatch({ type: 'SEND', content })
    setInput('')

    try {
      const result = await sendDemoMessage(projectId, language, historyForRequest)
      if (result.capped) {
        dispatch({ type: 'CAPPED', reason: result.reason })
      } else {
        dispatch({ type: 'SUCCESS', reply: result.reply, remaining: result.remaining })
      }
    } catch {
      dispatch({ type: 'ERROR' })
    }
  }

  return (
    <div className="project-demo">
      <div className="project-demo__messages">
        {state.messages.map((message, index) => (
          <p key={index} className={`project-demo__bubble project-demo__bubble--${message.role}`}>
            {message.content}
          </p>
        ))}
        {isSending && (
          <p className="project-demo__bubble project-demo__bubble--pending">{ui.demoSending[language]}</p>
        )}
      </div>

      {state.status === 'error' && <p className="project-demo__error">{ui.demoError[language]}</p>}
      {state.status === 'daily-capped' && <p className="project-demo__error">{ui.demoDailyLimit[language]}</p>}

      {state.status === 'capped' && (
        <div className="project-demo__end-card">
          <p>{ui.demoEndTitle[language]}</p>
          <a className="button button--primary" href={`mailto:${hero.email}`}>
            {ui.demoEndCta[language]}
          </a>
        </div>
      )}

      {!isDone && (
        <form className="project-demo__input-row" onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={ui.demoInputPlaceholder[language]}
            disabled={isSending}
            maxLength={500}
          />
          <button type="submit" className="button" disabled={isSending || !input.trim()}>
            &#8594;
          </button>
        </form>
      )}

      {!isDone && (
        <p className="project-demo__counter">
          {state.remaining} {ui.demoRemaining[language]}
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Add chat widget styles to `src/index.css`**

Append after the existing `.project-card` rules:

```css
.project-demo {
  margin-top: 1rem;
  border-top: 1px dashed var(--border);
  padding-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.project-demo__messages {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 260px;
  overflow-y: auto;
}

.project-demo__bubble {
  margin: 0;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-size: 0.9rem;
  white-space: pre-wrap;
  max-width: 85%;
}

.project-demo__bubble--user {
  align-self: flex-end;
  background: var(--accent-dim);
  color: #fff;
}

.project-demo__bubble--assistant {
  align-self: flex-start;
  background: var(--bg);
  border: 1px solid var(--border);
  color: var(--text);
}

.project-demo__bubble--pending {
  align-self: flex-start;
  color: var(--text-muted);
  font-style: italic;
}

.project-demo__input-row {
  display: flex;
  gap: 0.5rem;
}

.project-demo__input-row input {
  flex: 1;
  font-family: var(--font-sans);
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  color: var(--text);
}

.project-demo__counter {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--text-muted);
}

.project-demo__error {
  margin: 0;
  font-size: 0.85rem;
  color: #f87171;
}

.project-demo__end-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-start;
}
```

- [ ] **Step 3: Manual verification (component compiles)**

Run (from repo root): `npx tsc --noEmit -p tsconfig.app.json`
Expected: no new errors attributable to `ProjectDemoChat.tsx` (an existing error about `Projects.tsx` and `ui.comingSoon` is expected until Task 11).

- [ ] **Step 4: Commit**

```bash
git add src/components/ProjectDemoChat.tsx src/index.css
git commit -m "frontend: add ProjectDemoChat widget"
```

---

### Task 11: Wire the widget into the Projects section

**Files:**
- Modify: `src/components/Projects.tsx`
- Modify: `src/index.css`

**Interfaces:**
- Consumes: `ProjectDemoChat` from `./ProjectDemoChat` (Task 10); `projects`, `ui`, `ProjectEntry` from `../data/content` (Task 7); `useLanguage`, `Language` from `../context/LanguageContext`

- [ ] **Step 1: Replace `src/components/Projects.tsx`**

```tsx
import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import type { Language } from '../context/LanguageContext'
import { projects, ui } from '../data/content'
import type { ProjectEntry } from '../data/content'
import { ProjectDemoChat } from './ProjectDemoChat'

function ProjectCard({ project, language }: { project: ProjectEntry; language: Language }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <article className="project-card">
      <h3>{project.title[language]}</h3>
      <p>{project.teaser[language]}</p>
      {project.demoId && !expanded && (
        <button
          type="button"
          className="button button--primary project-card__cta"
          onClick={() => setExpanded(true)}
        >
          {ui.tryDemo[language]}
        </button>
      )}
      {project.demoId && expanded && <ProjectDemoChat projectId={project.demoId} />}
    </article>
  )
}

export function Projects() {
  const { language } = useLanguage()

  return (
    <section id="projects" className="section">
      <h2 className="section__title">{ui.nav.projects[language]}</h2>
      <div className="projects">
        {projects.map((project) => (
          <ProjectCard key={project.title.en} project={project} language={language} />
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Update `.project-card__badge` styles in `src/index.css`**

Remove the now-unused `.project-card__badge` rule block:

```css
.project-card__badge {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--accent);
  border: 1px solid var(--accent-dim);
  border-radius: 999px;
  padding: 0.2rem 0.6rem;
}
```

Replace it with:

```css
.project-card__cta {
  margin-top: 0.75rem;
}
```

- [ ] **Step 3: Type-check the whole project**

Run (from repo root): `npx tsc -b`
Expected: no errors.

- [ ] **Step 4: Run the full frontend test suite**

Run (from repo root): `npx vitest run`
Expected: PASS (11 tests: 7 reducer + 4 demoApi, from Tasks 8 and 9)

- [ ] **Step 5: Manual QA in the browser**

Run (from repo root): `npm run dev`, open the printed local URL, scroll to Projects.

- Confirm the logistics and car-marketplace cards show a "Try it live" / "Probar en vivo" button, and the neighborhood magazine card shows only text (no button).
- Click "Try it live" on the logistics card, ask "how many deliveries were late last week?" — confirm a reply appears (this requires the Worker to be running locally per Task 6 and `VITE_DEMO_API_BASE` in a local `.env` pointing at `http://localhost:8787`).
- Toggle the site language and confirm new messages come back in the selected language.
- Send messages until the counter reaches 0 and confirm the end-card with the mailto link appears and the input disappears.

- [ ] **Step 6: Commit**

```bash
git add src/components/Projects.tsx src/index.css
git commit -m "frontend: wire ProjectDemoChat into the Projects section"
```

---

### Task 12: Deployment wiring and docs

**Files:**
- Modify: `.github/workflows/deploy.yml`
- Modify: `README.md`

**Interfaces:**
- Consumes: the deployed Worker URL from Task 6 (manual, provided by the user)

- [ ] **Step 1: Pass `VITE_DEMO_API_BASE` into the production build**

In `.github/workflows/deploy.yml`, change:

```yaml
      - run: npm run build
```

to:

```yaml
      - run: npm run build
        env:
          VITE_DEMO_API_BASE: ${{ vars.VITE_DEMO_API_BASE }}
```

- [ ] **Step 2: Document the required GitHub Actions variable**

Append a new section to the repo-root `README.md`:

```markdown
## Project demos

Two "Try it live" chat demos in the Projects section call a Cloudflare
Worker backend — see `worker/README.md` for how to deploy it.

For local development, copy `.env.example` to `.env` and point
`VITE_DEMO_API_BASE` at your worker (`http://localhost:8787` when running
`npm run dev` inside `worker/`, or your deployed `*.workers.dev` URL).

For the production build (GitHub Actions), add a repository variable named
`VITE_DEMO_API_BASE` under **Settings → Secrets and variables → Actions →
Variables**, set to your deployed worker's URL. It's not secret — just the
public API base — but keeping it as a variable (not hardcoded) means you
can point the site at a different worker without a code change.
```

- [ ] **Step 3: Manual verification**

Confirm the YAML is valid: `git diff .github/workflows/deploy.yml` and
visually check the indentation matches the rest of the `build` job (the
`env:` block must be indented one level under the `- run: npm run build`
step, aligned with other step keys).

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/deploy.yml README.md
git commit -m "ci: pass demo API base into the production build; document setup"
```

---

## Post-plan manual steps (not automatable by an engineer without your accounts)

These require your Cloudflare and OpenAI accounts and can't be scripted as plan steps:

1. Deploy the worker (`worker/README.md` "One-time setup" + "Deploy").
2. Add the `VITE_DEMO_API_BASE` repository variable in GitHub (Task 12, Step 2).
3. Push to `main` (or re-run the Pages workflow) so the production build picks up the variable.
4. Do one final end-to-end pass on the live GitHub Pages URL: both demos, both languages, the 5-message cap, and the error/daily-cap messages (the latter can be tested by temporarily lowering `DAILY_CAP` in `worker/src/rateLimit.ts` to `1`, deploying, confirming the message, then reverting).
