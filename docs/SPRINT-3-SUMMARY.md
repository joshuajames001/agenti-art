# runagent.art — Sprint 3 Summary

**Date:** March 16, 2026
**Duration:** ~8 hours
**Status:** Complete

---

## What was built

### 1. Upstash Rate Limiting
- New file: lib/ratelimit.ts — sliding window, 10 req/min per user, prefix "runagent:rl"
- Applied to app/api/pipeline/run/route.ts — after auth check, returns 429 JSON on exceed
- Per-user JWT sub claim (not IP) — accurate for authenticated routes
- Multi-project safe via prefix namespacing

### 2. NodeType system (scalable foundation)
- types.ts — new NodeType union: 'input' | 'output' | 'agent' | 'script' | 'router' | 'department'
- PipelineNode.nodeType added as required field
- PipelineNode.agent made optional (input/output nodes have no agent)
- PipelineNode.label added as optional (for named non-agent nodes)
- Prepares for: Script node, Router node, Department node, properties panel

### 3. Input / Output nodes
- AgentPool refactored to NodePalette with I/O section (Input + Output cards) above Agents section
- addIONode() in usePipeline — creates PipelineNode with nodeType and label
- Input node: cyan dot, "pipeline entry" subtitle
- Output node: gold dot, "pipeline exit" subtitle
- Both draggable/clickable, disabled during pipeline run
- Output node receives status: 'done' after pipeline_done event

### 4. SSE execution fixes
- executableSteps filter — Input/Output nodes excluded from Anthropic API calls
- nodeId added to RunStep interface and all SSE events (step_start, step_done, step_error)
- handleSSEEvent matches nodes by n.id === event.nodeId instead of array index
- Fixes index mismatch when Input/Output nodes present in pipeline
- SSE buffer flush after stream ends — pipeline_done event no longer lost on stream close

### 5. OutputPanel restored
- OutputPanel slide-over (right side) restored as primary output display
- Appears automatically on pipeline_done
- MissionComplete overlay removed (redundant)

### 7. Properties panel
- New component: app/builder/components/PropertiesPanel.tsx
- Right slide-over (360px), opens on node click in canvas
- Agent node: name, model tier selector (fast/smart/powerful with color buttons), custom instructions textarea
- Input node: type selector (text/URL/PDF/image/webhook)
- Output node: format selector (text/JSON/markdown)
- Local draft state with dirty tracking — changes applied only on Save
- "UNSAVED" indicator (yellow #ffd166) next to title when dirty
- Save button: cyan when dirty, disabled gray when clean
- NodeConfig type added to types.ts (model, instructions, inputType, outputFormat)
- selectedNodeId + updateNodeConfig in usePipeline hook
- SortableNode shows selected highlight (cyan border + glow)

### 8. Config → API wiring
- runPipeline sends config.model (overrides agent default) and config.instructions per step
- route.ts RunStep interface accepts instructions field
- System prompt: custom instructions prepended before SKILL.md with --- separator
- SortableNode displays config.model ?? agent.model for tier label + color

### 9. Production audit & hardening
- Removed all debug console.log statements
- Hardcoded GitHub URLs → process.env with fallbacks (GITHUB_AGENTS_BASE_URL, GITHUB_REGISTRY_URL)
- api/pipelines/save/route.ts: added top-level try/catch, safe JSON parse, console.error for real errors
- DndContext hydration mismatch fix: stable useId() passed as id prop
- OutputPanel: Save button added alongside Copy button, wired to savePipeline

### 10. Visual fixes
- STATUS_COLOR done: #3B6D11 → #00e5c8 (visible on dark background)
- SortableNode shows clean "Input"/"Output" labels for non-agent nodes
- Hardcoded static Output block removed from Builder.tsx
- Output node no longer receives full text as label (only status: done)

---

## Bug fixes

| Bug | Root cause | Fix |
|---|---|---|
| Wrong node got tokens | Index mismatch (filtered vs full array) | nodeId matching |
| pipeline_done lost | SSE buffer not flushed on stream close | Buffer flush after while loop |
| Output node stayed idle | STATUS_COLOR done was #3B6D11 (invisible) | Changed to #00e5c8 |
| Full output text in node card | pipeline_done set node.label to full output | Removed label assignment |
| Two output displays | OutputPanel + MissionComplete both rendered | Removed MissionComplete |
| DnD hydration mismatch | @dnd-kit random aria-describedby IDs | Stable useId() on DndContext |
| Config not sent to API | runPipeline omitted node.config | Added config.model + instructions to fetch body |
| Missing error handling | pipelines/save had no try/catch | Top-level try/catch + safe JSON parse |

---

## Architecture decisions

| Decision | Choice | Rationale |
|---|---|---|
| NodeType union | 6 types incl. script/router/department | Prepare place, don't build room |
| nodeId in SSE events | Match by ID not index | Index breaks with non-agent nodes |
| OutputPanel over overlay | Slide-over from right | Less intrusive, already existed |
| Rate limit prefix | runagent:rl | Namespace per project, single Redis |
| Buffer flush | After stream while loop | pipeline_done arrives before stream close |
| Local draft state | PropertiesPanel | Changes applied only on Save, not live — prevents accidental config changes |
| Hardcoded URLs → env vars | GitHub agent/registry URLs | Configurable per deployment, fallback to defaults |
| DndContext useId | Stable ID for hydration | React useId() ensures SSR/client match |

---

## Sprint 3 → Sprint 4 delta

| Feature | Sprint 3 | Sprint 4 target |
|---|---|---|
| Node types | NodeType union defined | Script node, Router node functional |
| Input node | Visual placeholder | Type selector (text/URL/PDF/image/webhook) |
| Output node | Status indicator | Format selector (text/JSON/markdown) |
| Properties panel | Built + wired to execution | Script node, Router node properties |
| ADR enforcement | Hardcoded checks | Real ADR-INDEX.md fetch + parse |
| Rate limiting | 10 req/min | Per-tier limits |
| Config system | model + instructions per node | inputType/outputFormat affect execution |

---

## Next sprint priorities

1. Vercel deployment + runagent.art domain
2. Script node (deterministic, no LLM)
3. Input node type selector → affects pipeline input processing
4. Output node format selector → affects output rendering
5. Mission completion → user account creation flow

---

## Key files (new/modified)

New:
- lib/ratelimit.ts
- app/builder/components/PropertiesPanel.tsx
- docs/SPRINT-3-SUMMARY.md
- docs/BACKLOG.md

Modified:
- app/builder/types.ts                    — NodeType, NodeConfig, PipelineNode extensions
- app/builder/hooks/usePipeline.ts        — addIONode, nodeId matching, selectedNodeId, updateNodeConfig, config in fetch
- app/builder/hooks/useSSE.ts             — nodeId in events, buffer flush
- app/builder/components/AgentPool.tsx    — I/O section, addIONode prop
- app/builder/components/OutputPanel.tsx  — Save button alongside Copy
- app/builder/Builder.tsx                 — PropertiesPanel, OutputPanel, useId hydration fix, config display
- app/api/pipeline/run/route.ts           — executableSteps, nodeId, instructions in system prompt, env var URLs
- app/api/pipelines/save/route.ts         — top-level try/catch, safe JSON parse
- app/store/page.tsx                      — env var for registry URL
- docs/ROADMAP.md
