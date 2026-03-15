# agenti.art — Roadmap

> Living document — updated as priorities shift.
> Last updated: March 2026

## Phase 1 — TECHDOC (current)
- [x] Agent store repo structure (SKILL.md + agent.yaml)
- [x] 11 base agents (analytik, researcher, creator, auditor, strategist, orchestrator, adr-creator, support-bot, email-responder, data-extractor, browser-agent)
- [x] model_config.yaml (LiteLLM multi-provider)
- [x] CLAUDE.md, AGENTS.md, GEMINI.md, .cursorrules
- [x] i18n foundation (messages/en.json + cs.json)
- [x] CI pipeline (validate + registry auto-update)
- [x] ARCHITECTURE.md, TECH-STACK.md
- [ ] ADR-INDEX.md (first system ADRs)

## Phase 2 — INFRA
- [ ] Next.js 15 project scaffold
- [ ] Supabase schema (users, pipelines, runs, steps, adrs, logs)
- [ ] LiteLLM proxy setup
- [ ] Vercel deployment + environment variables
- [ ] Upstash Redis rate limiting
- [ ] Basic API routes (auth, pipeline CRUD, agent list)

## Phase 3 — ROZHRANI
- [ ] Mission system UI (/missions)
- [ ] Visual pipeline builder (/builder)
- [ ] Agent store browser (/store)
- [ ] Dashboard + logs (/dashboard)
- [ ] ADR editor
- [ ] EN/CS language toggle

## Phase 4 — AGENTI
- [ ] loki-mode (autonomous multi-agent)
- [ ] Additional domain agents (CFO, HR, legal-reviewer, etc.)
- [ ] Community contribution flow (PR → review → merge)

## Phase 5 — INTEGRACE
- [ ] Live MCP connector integrations
- [ ] Real pipeline execution
- [ ] Billing (free missions → paid runtime)
- [ ] agenti.art domain live

---

*GhostFactory · agenti.art · Agents Rule Tomorrow*
