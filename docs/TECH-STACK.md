# runagent.art — Tech Stack

> Decision log: why each technology was chosen.
> Last updated: March 2026

---

## Frontend

### Next.js 15 (App Router + Turbopack)
**Why:** App Router gives server components by default — reduces client JS bundle.
Turbopack speeds up local dev. Same stack as Živnostník.art — shared patterns.

**Key decisions:**
- Server Components as default, Client only where needed (game UI interactions)
- API routes for all backend logic — no separate Express server
- `next-intl` for EN/CS i18n

### TypeScript
**Why:** Type safety across agent config, pipeline state, Supabase schema.
Catches errors at compile time — critical for pipeline logic.

### Tailwind CSS
**Why:** Utility-first, no CSS file sprawl. Fast iteration on game UI.
GhostFactory dark/neon aesthetic via CSS variables.

---

## Authentication & Database

### Supabase
**Why:** PostgreSQL + Auth + RLS in one service. No separate auth server.
Same stack as Živnostník.art — proven patterns already exist.

**Auth pattern:**
```typescript
// API route
const token = req.headers.get('Authorization')?.replace('Bearer ', '')
const { data: { user } } = await supabase.auth.getUser(token)

// Frontend
const { data: { session } } = await supabase.auth.getSession()
const token = session?.access_token
```

**RLS:** Every table has row-level security. Users can only access their own data.

---

## AI / LLM layer

### LiteLLM (unified proxy)
**Why:** Single API for Anthropic, OpenAI, Google, Ollama.
Agents reference aliases (`fast`, `smart`, `powerful`) — never hardcoded model strings.
Provider swap = one line change in `model_config.yaml`.

```yaml
# model_config.yaml
models:
  fast:    { litellm: anthropic/claude-haiku-4-5-20251001 }
  smart:   { litellm: anthropic/claude-sonnet-4-6 }
  powerful:{ litellm: anthropic/claude-opus-4-6 }
  gpt:     { litellm: openai/gpt-4o }
  gemini:  { litellm: google/gemini-2.0-flash }
  local:   { litellm: ollama/llama3.2 }
```

### Anthropic SDK (primary)
**Why:** Claude models are primary. Sonnet 4.6 as default `smart` model —
best reasoning/speed/cost balance. Haiku for real-time (support-bot).
Opus for critical decisions (auditor, orchestrator, adr-creator).

### Agent Skills standard (SKILL.md)
**Why:** Open standard (agentskills.io). Compatible with Claude Code, Gemini CLI,
Cursor, Antigravity IDE, GitHub Copilot. Community can contribute agents.
Progressive disclosure — 3-tier loading keeps token cost low.

---

## Infrastructure

### Vercel
**Why:** Native Next.js deployment. Edge runtime for API routes.
Automatic preview deploys on PR. Same provider as Živnostník.art.

**Config:**
- Edge runtime for latency-sensitive API routes
- Environment variables per environment (dev/preview/prod)
- Automatic HTTPS

### Upstash Redis (rate limiting)
**Why:** Serverless Redis — pay per request, no idle cost.
Rate limiting per user `sub` claim from JWT.

**Pattern:**
```typescript
// Rate limit by user ID, not IP (more accurate for authenticated routes)
const userId = user.id  // JWT sub claim
await ratelimit.limit(userId)
```

### Upstash QStash (async jobs)
**Why:** Serverless message queue. Recurring pipeline runs, webhook delivery.
Signature verification for security. Same service already used in Živnostník.art.

---

## Agent infrastructure

### MCP servers (connectors)
**Why:** Model Context Protocol — standard for agent tool access.
Connectors are pay-per-use — no idle cost.
User enables connectors per agent in `agent.yaml`.

**Available connectors:**
```yaml
connectors:
  - web-search    # Anthropic web search tool
  - file-ops      # Read/write files
  - browser       # Puppeteer/Playwright headless
  - email         # Gmail MCP or SMTP
  - supabase      # Direct DB access via RLS
  - github        # Repo operations
  - slack         # Messaging
  - custom-mcp    # User-defined servers
```

### GitHub (agent store)
**Why:** Version-controlled agent definitions. Public repo = community contributions.
CI validates every PR. `registry.json` auto-generated on merge.
Familiar tooling — no custom CMS needed.

---

## Monitoring & Observability

### Ledger (custom)
**Why:** Append-only audit log with chain-of-hashes integrity.
Every agent action is logged before execution.
ADR violations are traceable to specific pipeline runs.

```typescript
// Every step logged to Supabase
await ledger.append({
  pipeline_id,
  step,
  agent,
  action,
  input_hash,
  output_hash,
  timestamp,
  adr_violations: []
})
```

### Vercel Analytics
**Why:** Built-in, zero-config. Core Web Vitals, page performance.
Sufficient for early product phase.

---

## Development tooling

### Claude Code (primary dev tool)
**Why:** Agentic coding in terminal. Understands codebase context.
CLAUDE.md gives it project-specific rules automatically.

### Git workflow
```bash
# Standard commit flow
git add .
git commit -m "feat: description"
git push --force-with-lease  # safe force push
```

### PowerShell (Windows dev environment)
**Why:** Jiří's primary dev machine is Windows.
All bash scripts have PowerShell-compatible alternatives where needed.

---

## What we deliberately chose NOT to use

| Technology | Alternative chosen | Reason |
|---|---|---|
| Prisma ORM | Supabase client directly | Less abstraction, RLS works better |
| Redux | React hooks + Zustand | Simpler state for game UI |
| Separate auth service | Supabase Auth | Already in stack |
| n8n / Make.com | Custom orchestrator | More control, GhostFactory AOS already exists |
| GraphQL | REST API routes | Sufficient complexity for MVP |
| Separate Express server | Next.js API routes | One deployment target |
| Docker (dev) | Direct Node.js | Simpler local setup |

---

## Environment variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Anthropic
ANTHROPIC_API_KEY=

# LiteLLM (if self-hosted proxy)
LITELLM_API_URL=
LITELLM_API_KEY=

# Upstash
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
QSTASH_URL=
QSTASH_TOKEN=
QSTASH_CURRENT_SIGNING_KEY=
QSTASH_NEXT_SIGNING_KEY=

# Optional providers
OPENAI_API_KEY=
GOOGLE_API_KEY=
```

---

## Version history

| Version | Date | Notes |
|---|---|---|
| 1.0.0 | March 2026 | Initial tech stack decision |

---

*GhostFactory · runagent.art · Agents Rule Tomorrow*
