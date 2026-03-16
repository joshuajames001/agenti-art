# runagent.art — Roadmap

> Living document — updated as priorities shift.
> Last updated: March 16, 2026 (after Sprint 3)

## Phase 1 — TECHDOC ✅
- [x] Agent store repo structure (SKILL.md + agent.yaml)
- [x] 11 base agents (analytik, researcher, creator, auditor, strategist, orchestrator, adr-creator, support-bot, email-responder, data-extractor, browser-agent)
- [x] model_config.yaml (LiteLLM multi-provider)
- [x] CLAUDE.md, AGENTS.md, GEMINI.md, .cursorrules
- [x] i18n foundation (messages/en.json + cs.json)
- [x] CI pipeline (validate + registry auto-update)
- [x] ARCHITECTURE.md, TECH-STACK.md
- [x] ADR-INDEX.md (11 system ADRs)

## Phase 2 — INFRA ✅
- [x] Next.js 15 project scaffold
- [x] Supabase schema (11 tables + pgvector + RLS)
- [x] Supabase auth (magic link, cookie-based sessions)
- [x] Basic API routes (pipeline save, pipeline run)
- [x] Upstash Redis rate limiting (10 req/min per user, JWT sub claim)
- [ ] Vercel deployment + environment variables
- [ ] LiteLLM proxy setup (currently using direct Anthropic SDK)

## Phase 3 — ROZHRANI ✅
- [x] Landing page (/) — AGENTS RULE TOMORROW hero
- [x] Login (/login) — magic link auth
- [x] Mission system UI (/missions + /missions/[slug])
- [x] Visual pipeline builder (/builder) — DnD, nodes, connectors, live log
- [x] Agent store browser (/store) — registry.json, category filters, ADD TO BUILDER
- [x] Dashboard (/dashboard) — stats, saved pipelines
- [x] Builder FSD refactor (types, hooks, components — ADR-010 compliant)
- [x] OutputPanel slide-over (mission result display)
- [ ] ADR editor
- [ ] EN/CS language toggle

## Phase 4 — EXECUTION ✅
- [x] Real pipeline execution via Anthropic streaming API
- [x] SSE streaming route (app/api/pipeline/run/route.ts)
- [x] SKILL.md fetching from GitHub (5min cache, frontmatter stripping)
- [x] Output chaining between steps
- [x] Run + run_steps DB writes (when pipeline saved)
- [x] Abort support (stop button)
- [x] ADR-005 enforcement (max 8 agents, server-side)
- [x] Prompt input in builder top bar

## Phase 5 — NODE SYSTEM ✅ (Sprint 3)
- [x] NodeType union: input | output | agent | script | router | department
- [x] Input / Output nodes in builder (palette + canvas)
- [x] nodeId-based SSE event matching (replaces index matching)
- [x] executableSteps filter (I/O nodes excluded from API calls)
- [x] SSE buffer flush (pipeline_done no longer lost)
- [x] Upstash rate limiting (per-user, 10 req/min)

## Phase 6 — DEPLOY (next)
- [ ] Vercel deployment + runagent.art domain
- [ ] Properties panel (right side, opens on node click, Blender-style)
- [ ] Input node type selector (text / URL / PDF / image / webhook)
- [ ] Output node format selector (text / JSON / markdown)
- [ ] Mission completion → user account creation flow
- [ ] Per-tier rate limits

## Phase 7 — AGENTI
- [ ] Script node (deterministic, no LLM)
- [ ] Router node (conditional branching)
- [ ] Department node (sub-pipeline)
- [ ] loki-mode (autonomous multi-agent)
- [ ] Pipeline testing framework
- [ ] Additional domain agents (CFO, HR, legal-reviewer, etc.)
- [ ] Community contribution flow (PR → review → merge)

## Phase 8 — INTEGRACE
- [ ] Live MCP connector integrations
- [ ] LiteLLM proxy (multi-provider routing)
- [ ] Billing (free missions → paid runtime)
- [ ] ADR editor UI
- [ ] EN/CS language toggle

---

*GhostFactory · runagent.art · Agents Rule Tomorrow*
