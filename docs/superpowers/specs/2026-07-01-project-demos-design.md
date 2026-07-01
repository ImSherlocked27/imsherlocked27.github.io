# Interactive Project Demos — Design Spec

Date: 2026-07-01
Status: Approved by user, pending implementation plan

## 1. Purpose

Replace the "coming soon" placeholder cards in the Projects section of the
portfolio site (`imsherlocked27.github.io`) with real, minimal, interactive
chat demos that let a visitor briefly try an anonymized version of two real
AI projects. A third real project is described but does not get an
interactive demo (it has no AI feature to demo yet).

Source material: anonymized project summaries in
`C:\Users\jerem\Desktop\projects\project-summaries\`:

1. `01-conversational-logistics-analytics.md`
2. `02-ai-first-used-car-marketplace.md`
3. `03-neighborhood-digital-magazine-platform.md` (write-up only, no demo)

## 2. Scope

**In scope (this pass):**

- Two live, LLM-backed chat demos, embedded in the existing Projects section:
  1. **Logistics analytics assistant** demo
  2. **Car marketplace concierge** demo
- Shared chat widget component, reused by both demos.
- A Cloudflare Worker acting as a backend proxy: holds the OpenAI API key,
  enforces the message cap, enforces a global daily cost cap, and returns
  model replies.
- Updated Projects section content: the two demo cards get a "Try it live"
  chat, and the neighborhood magazine project gets a normal descriptive card
  (no demo button, no "coming soon" badge — it's a real shipped product,
  just without an AI feature to showcase).

**Explicitly out of scope:**

- Any demo for the neighborhood magazine project. It is described in prose
  only (what it is, tech stack, and — optionally — the AI opportunities
  noted in its summary), with no interactive element.
- Real company data, real database connections, or real backend services
  from any of the three original projects. All demo data is small, fictional,
  and hardcoded into the Worker.
- Voice interaction (the car marketplace project's voice concierge is not
  replicated).
- User accounts, persistent chat history across visits, or admin controls.
- Streaming responses (a simple request/response call is sufficient for a
  5-message demo; can be revisited later).

## 3. Architecture

```
Visitor → Project card "Try it live" → inline chat widget expands
              │
              ▼
   POST /api/chat/:projectId   { sessionId, language, messages }
              │
              ▼
   Cloudflare Worker
     ├─ validate projectId (must be one of the 2 configured demos)
     ├─ per-session+IP cap check (5 user messages / project / 24h, via Workers KV)
     ├─ global daily budget cap check (via Workers KV, shared across both demos)
     ├─ build request: system prompt (per project, baked into Worker) + message history
     ├─ call OpenAI chat completion (cheapest small model)
     └─ return { reply, remaining }
              │
              ▼
   Widget renders reply, decrements counter, shows end-card at 0 remaining
```

- The OpenAI API key is stored only as a Cloudflare Worker secret
  (`wrangler secret put`), never present in the static site bundle.
- CORS on the Worker allows only the GitHub Pages origin
  (`https://imsherlocked27.github.io`).
- The Worker is a single small service handling both `projectId` routes —
  no need for separate Workers per project.

## 4. Frontend

- New component `ProjectDemoChat` (message list, text input, "N/5 messages
  left" counter, end-card with a contact link) parameterized by `projectId`.
  Reused identically for both demos — no per-project frontend code beyond
  passing the id and card copy.
- In `Projects.tsx`:
  - Logistics analytics card and car marketplace card: "Try it live" button
    expands `ProjectDemoChat` inline beneath the card (no navigation away
    from the page, no modal).
  - Neighborhood magazine card: plain descriptive card (title + teaser),
    same visual style as the others, but no button/badge — it simply reads
    as a completed project.
- The widget passes the current site language (`en`/`es`) from
  `LanguageContext` on every request so replies match the visitor's
  selected language.
- `sessionId`: a random token generated on first use and stored in
  `localStorage`, sent with every request. Used server-side as one half of
  the rate-limit key (paired with request IP), so clearing local storage
  alone does not reset a visitor's cap.

## 5. Backend (Cloudflare Worker)

- Route: `POST /api/chat/:projectId` where `projectId` is one of
  `logistics-analytics` | `car-marketplace`. Any other value → 404.
- Rate limiting (Workers KV):
  - Key: `session:{sessionId}:ip:{ip}:project:{projectId}` → message count,
    24h TTL. Cap: 5 user messages.
  - Key: `daily-budget:{date}` → total request count across both projects,
    24h TTL (rolls over at UTC midnight). Cap sized once the model is
    finalized, targeting a worst-case daily spend of a few dollars.
- On cap hit:
  - Per-session cap → Worker returns a "limit reached" response; frontend
    shows the end-card ("That's the demo! Want the full version? →
    contact me").
  - Global daily cap → Worker returns a "daily budget reached" response for
    *any* visitor on *either* demo; frontend shows "today's demo budget is
    used up, try again tomorrow."
- Model call: OpenAI, cheapest small chat model, non-streaming, system
  prompt + full message history (capped at 5 turns so context stays small).
- On OpenAI error (timeout, rate limit, etc.): Worker returns an error
  response; frontend shows "something went wrong, try again" and does
  **not** decrement the visitor's remaining-message count.

## 6. Per-project content

### 6.1 Logistics analytics assistant (`logistics-analytics`)

Persona: a chat-based analytics assistant for a fictional logistics company
("Northstar Logistics"), answering operations questions in natural language
against a small hardcoded fictional dataset (~8 rows spanning orders,
deliveries, and 2–3 carriers, with on-time/late status).

To showcase the real product's key differentiator (deterministic,
security-scoped SQL generation), each answer also includes a short code
block narrating the SQL-shaped query "run" to produce it — illustrative
only, not executed against anything real.

System prompt must instruct the model to:
- Answer only from the provided fictional dataset; never invent company
  names, real data, or numbers not derivable from it.
- Keep answers concise (a few sentences + optional short SQL block).
- Respond in the visitor's selected language (`en`/`es`).

### 6.2 Car marketplace concierge (`car-marketplace`)

Persona: "Concierge," a buyer-facing assistant for a fictional used-car
marketplace, helping the visitor find a match from a small hardcoded
fictional catalog (~10 cars: make/model/year/price/mileage/key features).

System prompt must instruct the model to:
- Recommend only cars from the provided fictional catalog.
- Ask a clarifying question when the request is too vague (budget, body
  type, must-have features).
- Recommend 1–3 matches with brief reasoning once enough is known.
- Respond in the visitor's selected language (`en`/`es`).

### 6.3 Neighborhood magazine (write-up only, no persona/demo)

Card copy describes the project (hyper-local digital magazine connecting
residents, businesses, and organizations) and may note the AI opportunities
identified in its project summary as a "not yet built" aside. No chat
widget, no system prompt, no Worker route.

## 7. Error handling summary

| Condition | Behavior |
|---|---|
| Invalid `projectId` | Worker 404 |
| Per-session+IP cap reached | End-card shown, input disabled, contact CTA |
| Global daily budget reached | "Try again tomorrow" message, all demos |
| OpenAI call fails | Inline retry-safe error, message not counted |
| Network error (client) | Inline retry-safe error, message not counted |
| Non-GitHub-Pages origin request | Blocked by CORS |

## 8. Testing / validation plan

- Manual QA per demo: several realistic questions per persona, confirm
  answers stay grounded in the fictional dataset/catalog and don't invent
  real-sounding company claims.
- Confirm the 6th user message in a session is blocked and shows the
  end-card, in both languages.
- Confirm the global daily cap trips correctly and recovers after rollover.
- Confirm a request from a non-GitHub-Pages origin is rejected (CORS).
- Confirm a simulated OpenAI failure does not consume a visitor's message
  allowance.

## 9. Open items for the implementation plan

- Exact OpenAI model id (cheapest current small chat model) and the
  resulting numeric value for the global daily budget cap.
- Exact Workers KV namespace setup and `wrangler.toml` configuration.
- Final English/Spanish card copy for the neighborhood magazine write-up.
