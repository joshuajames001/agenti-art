# runagent.art — Backlog

> Prioritized feature backlog. Items move to sprint plans when picked up.
> Last updated: March 16, 2026 (after Sprint 3)

---

## P0 — Sprint 4 candidates

| # | Feature | Description | Effort |
|---|---------|-------------|--------|
| 1 | Vercel deployment | Deploy to runagent.art, env vars, domain config | S |
| 2 | Properties panel | Right-side panel on node click (Blender-style), shows node config | M |
| 3 | Input node type selector | Text / URL / PDF / image / webhook — determines how data enters pipeline | M |
| 4 | Script node | Deterministic node (no LLM), runs JS/TS transform on input | M |
| 5 | Mission completion flow | Save progress → unlock next mission → prompt account creation | M |

---

## P1 — Near-term

| # | Feature | Description | Effort |
|---|---------|-------------|--------|
| 6 | Output node format selector | Text / JSON / markdown — determines output rendering | S |
| 7 | Per-tier rate limits | Free: 10/min, Pro: 60/min, Enterprise: unlimited | S |
| 8 | Router node | Conditional branching based on output content / regex / LLM classifier | L |
| 9 | Department node | Sub-pipeline (nested execution, own scope) | L |
| 10 | ADR enforcement from ADR-INDEX.md | Fetch + parse real ADR rules instead of hardcoded checks | M |
| 11 | Pipeline template gallery | Pre-built pipelines users can clone and modify | M |
| 12 | Node connection validation | Prevent invalid connections (e.g. output → output) | S |

---

## P2 — Mid-term

| # | Feature | Description | Effort |
|---|---------|-------------|--------|
| 13 | loki-mode | Autonomous multi-agent execution (orchestrator decides next step) | XL |
| 14 | Pipeline testing framework | Define expected outputs, run assertions, CI integration | L |
| 15 | LiteLLM proxy | Multi-provider routing (Anthropic, OpenAI, Gemini, local) | L |
| 16 | MCP connector integrations | Live tool use (Slack, Gmail, GitHub, etc.) via MCP protocol | L |
| 17 | Pipeline versioning | Git-like version history for pipeline configs | M |
| 18 | Collaborative editing | Multiple users editing same pipeline (Figma-style cursors) | XL |
| 19 | ADR editor UI | Visual editor for creating/modifying ADR rules | M |

---

## P3 — Backlog

| # | Feature | Description | Effort |
|---|---------|-------------|--------|
| 20 | EN/CS language toggle | Full i18n with messages/en.json + cs.json | S |
| 21 | Additional domain agents | CFO, HR, legal-reviewer, compliance-officer, etc. | M |
| 22 | Community contribution flow | PR → automated review → merge to agent store | L |
| 23 | Billing / payments | Free missions → paid runtime (Stripe integration) | L |
| 24 | Pipeline analytics | Token usage charts, cost breakdown, execution time trends | M |
| 25 | Agent marketplace | Community-submitted agents with ratings and reviews | XL |
| 26 | Webhook triggers | External events trigger pipeline runs (GitHub, Stripe, etc.) | M |
| 27 | Pipeline export/import | JSON/YAML export, share pipelines as files | S |
| 28 | Dark/light theme | Theme toggle (currently dark-only) | S |

---

## Effort scale

- **S** = Small (~2-4 hours)
- **M** = Medium (~4-8 hours)
- **L** = Large (~1-2 days)
- **XL** = Extra Large (~3-5 days)

---

## Done (completed backlog items)

- ~~Upstash rate limiting~~ → Sprint 3
- ~~NodeType system~~ → Sprint 3
- ~~Input/Output nodes~~ → Sprint 3
- ~~SSE nodeId matching~~ → Sprint 3
- ~~SSE buffer flush~~ → Sprint 3
- ~~OutputPanel as primary output~~ → Sprint 3
- ~~MissionComplete overlay~~ → removed (redundant)

---

*GhostFactory · runagent.art · Agents Rule Tomorrow*
