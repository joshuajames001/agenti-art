# runagent.art — Sprint 2 Summary

**Date:** March 15-16, 2026
**Duration:** ~8 hours
**Status:** Complete

---

## What was built

### 1. Feature-Sliced Design refactor of Builder.tsx (ADR-010 compliant)

Followed extract → verify (`tsc --noEmit`) → implement sequence per ADR-010.

Builder.tsx reduced from **665 lines to ~280 lines** (layout shell + SortableNode).

```
app/builder/
  Builder.tsx                    ← layout shell + SortableNode (~280 lines)
  types.ts                       ← shared types, color constants, log style map
  hooks/usePipeline.ts           ← all state + handlers (run, save, reset, DnD, addAgent)
  hooks/useSSE.ts                ← SSE stream parser + SSEEvent type union
  components/AgentPool.tsx       ← left sidebar: agent list + ADR status panel
  components/LogPanel.tsx        ← bottom log panel with expandable output entries
  components/PromptInput.tsx     ← prompt input field (Space Mono, dark theme)
```

### 2. Real pipeline execution via SSE streaming

**API route:** `app/api/pipeline/run/route.ts`

- Auth via Supabase `createClient()` cookie-based (same pattern as `/api/pipelines/save`)
- Accepts POST: `{ steps: [{agentName, model, stepOrder}], userPrompt, pipelineId }`
- Returns SSE stream (`Content-Type: text/event-stream`)
- For each step:
  1. Sends `step_start` event
  2. Fetches `SKILL.md` from GitHub raw URL (`next: { revalidate: 300 }`)
  3. Strips YAML frontmatter via regex
  4. Calls Anthropic streaming API (`anthropic.messages.stream()`)
  5. Streams `token` events in real-time
  6. Sends `step_done` with token count and full output
  7. On error: `step_error` → pipeline stops
- Output chaining: each step's output becomes the next step's user message
- After all steps: `pipeline_done` with total token count
- DB writes to `runs` + `run_steps` when `pipelineId` is present (conditional — non-critical on failure)
- Abort support via `AbortController` / `req.signal`
- ADR-005 enforcement: max 8 agents per pipeline (server-side validation)

**Model mapping (hardcoded, no LiteLLM at runtime):**

| Alias | Model ID |
|---|---|
| fast | claude-haiku-4-5-20251001 |
| smart | claude-sonnet-4-6 |
| powerful | claude-opus-4-6 |

**Client-side (`usePipeline.ts`):**

- `runPipeline()` → validates prompt + ADR-005 → fetches `/api/pipeline/run` → streams via `processSSEStream()`
- `handleSSEEvent()` → updates node status, token counts, logs with output preview (120 chars)
- `stopPipeline()` → aborts in-flight request
- RUN button becomes STOP during execution
- PromptInput in top bar (required before running)

### 3. Agent Store (`/store`)

**Page:** `app/store/page.tsx` (server component — no client JS)

- Fetches `registry.json` from GitHub (`next: { revalidate: 300 }`)
- 11 agent cards in responsive grid (`repeat(auto-fill, minmax(300px, 1fr))`)
- Each card shows:
  - Agent name (Bebas Neue, uppercase)
  - Category badge (cyan on cyan-dim)
  - Model tier with color: fast=#7eb8f7, smart=var(--cyan), powerful=#ffd166
  - Description (truncated to 120 chars)
  - Tags (max 5 shown, +N overflow)
  - ADD TO BUILDER → link
- Category filter bar: all / data / content / qa / strategy / automation / browser / communication
- Filter via URL `searchParams` (shareable URLs, no hydration, no client state)
- Empty state with "Show all" link when no agents match filter
- Nav matches missions page pattern (logo, missions link, agent store active, sign in/dashboard)

**Builder integration:**

- `app/builder/page.tsx` reads `?agent=` query param
- If present, finds matching agent in `availableAgents` and pre-adds it to `initialNodes`
- Store card links: `/builder?agent={name}`

---

## Architecture decisions

| Decision | Choice | Rationale |
|---|---|---|
| FSD for builder | hooks/, components/, types.ts | Separation of concerns; Builder.tsx was 665 lines |
| ADR-010 compliance | Extract → tsc verify → implement | Prevents broken intermediate states |
| SSE over polling | ReadableStream + text/event-stream | Real-time token streaming, lower latency than polling |
| Server component for store | No 'use client' | SEO-friendly, zero client JS, faster initial load |
| URL searchParams for filters | `?category=qa` | Shareable URLs, no hydration mismatch, server-rendered |
| Conditional DB writes | Only when pipelineId present | `runs.pipeline_id` is NOT NULL in schema |
| `as any` for Supabase calls | Type assertion in route.ts | Database generic resolves to `never` (pre-existing) |

---

## Tech stack additions

- `@anthropic-ai/sdk` ^0.78.0 — now actively used for streaming pipeline execution

---

## Known issues

- Pre-existing Supabase `never` type errors in `app/builder/page.tsx`, `app/dashboard/page.tsx`, `app/missions/` (Database type generic not generated — non-blocking, runtime correct)
- `runs.pipeline_id NOT NULL` constraint means run history is only tracked for saved pipelines
- No retry logic for Anthropic rate limits (429) — pipeline stops on first error

---

## Key files (new/modified)

```
New:
  app/builder/types.ts
  app/builder/hooks/usePipeline.ts
  app/builder/hooks/useSSE.ts
  app/builder/components/AgentPool.tsx
  app/builder/components/LogPanel.tsx
  app/builder/components/PromptInput.tsx
  app/api/pipeline/run/route.ts
  app/store/page.tsx

Modified:
  app/builder/Builder.tsx           ← refactored to layout shell
  app/builder/page.tsx              ← added ?agent= param handling
```

---

## Sprint 1 → Sprint 2 delta

| Feature | Sprint 1 | Sprint 2 |
|---|---|---|
| Pipeline execution | Simulated (sleep + random) | Real Anthropic API via SSE |
| Agent store | Not built | `/store` with filtering |
| Builder architecture | Single 665-line file | FSD: 7 files, ~280-line shell |
| Prompt input | None | Required text input in top bar |
| Token streaming | Faked numbers | Real token counts from Anthropic |
| Stop button | Not functional | Aborts in-flight API request |

---

## Next sprint priorities

1. Vercel deployment + runagent.art domain
2. Upstash rate limiting (per-user, JWT sub claim)
3. Mission completion flow (save progress, unlock next mission)
4. Input node + Output node in builder canvas
5. Script node (deterministic wrapper) — Sprint 3
6. Pipeline testing framework — Sprint 4

---

*GhostFactory · runagent.art · Agents Rule Tomorrow*
