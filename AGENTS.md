# GhostFactory Agent Store — Universal Agent Instructions

> Universal fallback for all AI coding assistants.
> For Claude-specific optimizations see CLAUDE.md.
> For Gemini-specific optimizations see GEMINI.md.

## CRITICAL: Skill Usage Rule

Before starting ANY task you MUST:

1. Locate the `skills/` directory and list its contents
2. Locate the `agents/` directory and list its contents
3. Read the SKILL.md of every skill or agent relevant to the task
4. Only then begin work

**If there is a 1% chance a skill could help — read it.**

---

## Skill Index

| Skill | Path | Use when... |
|---|---|---|
| web-search | `skills/web-search/SKILL.md` | research, fact-checking, current data |
| file-ops | `skills/file-ops/SKILL.md` | reading, writing, transforming files |
| browser | `skills/browser/SKILL.md` | scraping, web automation, screenshots |
| email | `skills/email/SKILL.md` | sending or reading emails |

## Agent Index

| Agent | Path | Use when... |
|---|---|---|
| analytik | `agents/analytik/SKILL.md` | data analysis, reports, CSV/JSON |
| creator | `agents/creator/SKILL.md` | writing, copy, content creation |
| auditor | `agents/auditor/SKILL.md` | review, fact-check, QA |
| strategist | `agents/strategist/SKILL.md` | strategy, planning, business decisions |
| browser-agent | `agents/browser-agent/SKILL.md` | web scraping, monitoring |

---

## Language Rules

All agent instructions, prompts, and code comments must be written in **English**.
UI strings live in `messages/` folder (EN + CS supported).

---

## Model Configuration

See `model_config.yaml` for available models and their aliases.
Use aliases (`fast`, `smart`, `powerful`) — never hardcode model strings.

---

## Compatibility

| Tool | Config file | Status |
|---|---|---|
| Claude Code | `CLAUDE.md` | Fully optimized |
| Antigravity IDE | `CLAUDE.md` | Fully optimized |
| Gemini CLI | `GEMINI.md` | Optimized |
| Cursor | `.cursorrules` | Partial |
| GitHub Copilot | `AGENTS.md` | Universal fallback |
| OpenCode | `AGENTS.md` | Universal fallback |
