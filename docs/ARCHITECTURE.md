# agents.art — System Architecture

> Version 1.0 · March 2026 · GhostFactory
> Domain: agenti.art (pending) · Repo: joshuajames001/agenti-art

## Overview

agenti.art is an AI agent platform presented as a strategy game. Users complete missions by building and running multi-agent pipelines. The game UI is the onboarding — completing a mission produces a real, working system.

```
Player → Game UI → API layer → Orchestrator → Agent pool → LiteLLM → Connectors → Data
```

---

## System layers

### Layer 1 — Game UI (browser)

Next.js 15 App Router. Four main surfaces:

| Surface | Path | Description |
|---|---|---|
| Missions | `/missions` | Game onboarding, tutorial missions, progression |
| Visual builder | `/builder` | Drag-and-drop pipeline builder, agent selection |
| Agent store | `/store` | Browse, install, configure agents from GitHub |
| Dashboard | `/dashboard` | Pipeline status, logs, ADR editor, analytics |

i18n: `messages/en.json` + `messages/cs.json` via `next-intl`.
All agent instructions stay in English. UI strings are EN + CS.

---

### Layer 2 — API layer

Next.js API routes. Auth via Supabase JWT Bearer tokens.

```typescript
// Auth pattern
const token = req.headers.get('Authorization')?.replace('Bearer ', '')
const { data: { user } } = await supabase.auth.getUser(token)

// Rate limiting
// Upstash Redis per user JWT sub claim (not middleware.ts — Next.js 15 distinction)
```

Key services:
- **Auth**: Supabase session → Bearer token
- **Rate limiting**: Upstash Redis, per user `sub` claim
- **Async jobs**: Upstash QStash for recurring pipelines and webhooks

---

### Layer 3 — Orchestrator

GhostFactory AOS v2 logic. Manages pipeline execution, agent dispatch, state tracking, and failure handling.

| Component | Responsibility |
|---|---|
| Pipeline builder | Topological sort of agent DAG, dependency resolution |
| ADR enforcement | Reads `adr/` directory, blocks rule violations before execution |
| State machine | `IDLE → RUNNING → DONE / FAILED` per step |
| Dead letter queue | Failed tasks preserved for adr-creator analysis |
| Ledger | Append-only audit log, chain-of-hashes integrity |

Pipeline state tracking:
```
[ ] pending   [→] running   [✓] done   [✗] failed   [~] skipped
```

---

### Layer 4 — Agent pool

Agents are SKILL.md + agent.yaml pairs in the public GitHub repo.
Orchestrator reads them at runtime — no deployment needed to add an agent.

Current agents:

| Agent | Model | Category | Description |
|---|---|---|---|
| analytik | smart | data | Data analysis, reporting, CSV/JSON |
| researcher | smart | data | Multi-source research, citations |
| creator | smart | content | Copywriting, blog, social, email |
| auditor | powerful | qa | Fact-checking, code review, QA |
| strategist | powerful | strategy | Business strategy, GTM, OKRs |
| orchestrator | powerful | automation | Multi-agent pipeline coordination |
| adr-creator | powerful | qa | Failure analysis, rule extraction |
| support-bot | fast | communication | Customer support conversations |
| email-responder | smart | communication | Email triage and drafting |
| data-extractor | smart | data | Parsing, scraping, ETL |
| browser-agent | fast | browser | Web scraping, automation |

Agent structure:
```
agents/{name}/
  SKILL.md          ← instructions + frontmatter (Anthropic standard)
  agent.yaml        ← runtime config (agenti.art extension)
  references/       ← optional — loaded on demand (progressive disclosure)
```

---

### Layer 5 — Model config (LiteLLM)

`model_config.yaml` is the single source of truth for all model references
across all GhostFactory `.art` products. Never hardcode model strings.

| Alias | Model | Cost | Use |
|---|---|---|---|
| fast | claude-haiku-4-5 | low | Real-time, high-volume, chatbots |
| smart | claude-sonnet-4-6 | medium | Default — reasoning + speed |
| powerful | claude-opus-4-6 | high | Complex planning, critical decisions |
| gpt | openai/gpt-4o | medium | OpenAI alternative |
| gemini | google/gemini-2.0-flash | low | Google alternative |
| local | ollama/llama3.2 | free | Private, offline |

---

### Layer 6 — Connectors (MCP servers)

Cost incurred only on actual calls — no idle cost.

| Connector | Description |
|---|---|
| web-search | Search the web for current information |
| file-ops | Read, write, transform files |
| browser | Headless Puppeteer/Playwright |
| email | Send and read email |
| supabase | DB read/write via RLS API |
| github | Repository operations |
| slack | Message and channel management |
| custom-mcp | User-defined MCP servers |

---

### Layer 7 — Data layer

| | Supabase (PostgreSQL) | GitHub repo |
|---|---|---|
| Type | Transactional DB + Auth | Version-controlled files |
| Contains | Users, pipelines, runs, logs, ADRs | SKILL.md, agent.yaml, configs |
| Access | RLS per user, JWT auth | Public read, CI-validated writes |
| Updates | Real-time | On merge via CI workflow |

---

## Key flows

### Mission flow (onboarding)
```
User arrives (no registration)
  → picks mission
  → visual builder: selects agents, connects pipeline
  → defines ADR rules (min 3 required)
  → Run → orchestrator executes pipeline
  → mission complete → save prompt → Supabase account created
  → dashboard: live logs + adr-creator suggestions
```

### Agent execution flow
```
Orchestrator reads pipeline from Supabase
  → loads ADR index, blocks violations
  → per step: reads SKILL.md + agent.yaml from GitHub
  → calls LiteLLM proxy with resolved model alias
  → output through auditor (if configured)
  → state written to Supabase after each step
  → on failure: dead letter queue + adr-creator
```

### ADR creation flow
```
Pipeline error / dead letter queue entry
  → adr-creator reads logs, classifies failure
  → pattern threshold met (or critical): generates ADR
  → ADR saved to adr/ in repo
  → next run: orchestrator reads + enforces new rule
```

---

## ADR governance

ADRs are binding rules — not documentation. Violations stop the pipeline.

### Lifecycle

| Stage | Trigger | Action |
|---|---|---|
| Watch | 1–2 occurrences | LOG only |
| Draft | 3+ occurrences (or 1 critical) | adr-creator generates rule |
| Accepted | Operator approves | Orchestrator enforces |
| Violation | Agent breaks rule | STOP / WARN / ESCALATE |

### Failure taxonomy

| Category | Severity | Auto-ADR threshold |
|---|---|---|
| authorization-leak | CRITICAL | 1 occurrence |
| cascade-failure | CRITICAL | 1 occurrence |
| boundary-violation | HIGH | 2 occurrences |
| escalation-failure | HIGH | 2 occurrences |
| infinite-loop | HIGH | 2 occurrences |
| data-corruption | HIGH | 2 occurrences |
| missing-input | MEDIUM | 3 occurrences |
| connector-abuse | MEDIUM | 3 occurrences |
| context-drift | LOW | 3 occurrences |
| human-error | LOW | 5 occurrences |

---

## Context files (auto-read by AI assistants)

| File | Read by | Purpose |
|---|---|---|
| `CLAUDE.md` | Claude Code, Antigravity | Skill rules, agent index, language rules |
| `AGENTS.md` | GitHub Copilot, OpenCode | Universal fallback |
| `GEMINI.md` | Gemini CLI | Load all skills upfront (1M context) |
| `.cursorrules` | Cursor | Cursor-specific rules |
| `model_config.yaml` | All agents | LiteLLM aliases, GhostFactory shared |
| `schema.yaml` | CI pipeline | Validates agent.yaml on every PR |
| `registry.json` | agenti.art frontend | Auto-generated agent index |

---

*GhostFactory · agenti.art · Agents Rule Tomorrow*
