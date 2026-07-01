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
