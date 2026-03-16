# runagent.art — Sprint 1 Summary

**Date:** March 15-16, 2026
**Duration:** ~10 hours
**Status:** Phase 1 + Phase 2 complete

---

## What was built

### Agent Store (GitHub repo: joshuajames001/agenti-art)
- 11 agents: analytik, creator, auditor, strategist, browser-agent, support-bot, email-responder, researcher, data-extractor, orchestrator, adr-creator
- SKILL.md + agent.yaml format (Anthropic standard)
- model_config.yaml (LiteLLM multi-provider: fast/smart/powerful/gpt/gemini/local)
- CLAUDE.md, AGENTS.md, GEMINI.md, .cursorrules
- i18n messages (en.json + cs.json)
- CI pipeline (validate.yml + registry.yml)
- 11 ADR rules (docs/ADR-INDEX.md)
- docs/ARCHITECTURE.md, TECH-STACK.md, ROADMAP.md
- Supabase migration SQL (11 tables + pgvector)

### Next.js App (runagent.art)
- Stack: Next.js 15, TypeScript, Tailwind, Supabase, Vercel
- GhostFactory dark theme (Space Mono, Bebas Neue, neon cyan #00e5c8)
- Grid texture background, animated elements
- Pages built:
  - `/` — landing page (AGENTS RULE TOMORROW hero)
  - `/login` — magic link auth
  - `/missions` — mission list from Supabase
  - `/missions/[slug]` — mission detail with agent list
  - `/builder` — pipeline builder (main game UI)
  - `/dashboard` — user stats + saved pipelines

### Builder features
- Agent pool (left panel) — click or drag to add agents
- Canvas — nodes with status dots (idle/running/done/failed)
- Connectors between nodes with animated flow
- @dnd-kit/sortable — drag to reorder nodes
- Live log panel — timestamps, ADR violations, token counts
- RUN PIPELINE — simulated execution with live state updates
- SAVE PIPELINE — saves to Supabase (pipelines + pipeline_steps)
- Load pipeline from DB — /builder?pipeline={id}
- ADR status panel — real-time rule validation

### Database (Supabase)
- Project: agenti-art (Frankfurt, Micro)
- 11 tables: profiles, missions, pipelines, pipeline_steps, runs, run_steps, adrs, audit_log, documents, document_chunks, agent_memories
- pgvector for RAG + agent memory
- RLS on all tables
- Triggers: handle_new_user, updated_at
- Seed: first mission "Build your first support bot"

---

## Current status

### Working
- Landing page, login (magic link), missions page
- Mission detail page
- Pipeline builder — add agents, reorder, run (simulated), save
- Dashboard with pipeline list
- Supabase auth + DB

### Not yet implemented
- Real pipeline execution (Anthropic API calls)
- LiteLLM proxy setup
- Upstash rate limiting
- Mission completion flow
- Agent store browser (/store)
- Vercel deployment

---

## Tech stack
- Next.js 15 App Router + TypeScript
- Supabase (PostgreSQL + Auth + RLS)
- @dnd-kit/core + @dnd-kit/sortable
- next-intl (i18n EN/CS)
- Zustand (planned)
- LiteLLM (planned)
- Upstash Redis + QStash (planned)

---

## Key files
```
app/
  page.tsx              landing
  login/page.tsx        magic link auth
  missions/page.tsx     mission list
  missions/[slug]/page.tsx  mission detail
  builder/page.tsx      builder server wrapper
  builder/Builder.tsx   main game UI (523+ lines)
  dashboard/page.tsx    user dashboard
  api/pipelines/save/route.ts  save pipeline API
lib/supabase/
  client.ts             browser client
  server.ts             server client
  admin.ts              service role
types/database.ts       full TypeScript types
proxy.ts                auth middleware
docs/
  ARCHITECTURE.md
  TECH-STACK.md
  ROADMAP.md
  ADR-INDEX.md          11 system ADRs
  supabase-migration.sql
```

---

## Next sprint priorities
1. Real pipeline execution (LiteLLM + Anthropic API)
2. Agent store page (/store) — browse agents from registry.json
3. Mission completion flow — save progress, unlock next mission
4. Vercel deployment
5. Upstash rate limiting

---

## Domain
- runagent.art (purchased March 2026, €4)
- GitHub: joshuajames001/agenti-art

---

*GhostFactory · runagent.art · Agents Rule Tomorrow*
