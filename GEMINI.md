# GhostFactory Agent Store — Gemini Instructions

> Optimized for Gemini CLI and Google AI Studio.
> Gemini handles large context well — load more skill context upfront.

## CRITICAL: Skill Usage Rule

Before starting ANY task:

1. Read ALL SKILL.md files in `skills/` upfront (Gemini's large context handles this efficiently)
2. Identify which agents in `agents/` match the task
3. Read matching agent SKILL.md + agent.yaml
4. Proceed with full skill context loaded

**Gemini-specific note:** Unlike Claude, load all skills at once rather than progressively.
Your 1M context window makes this efficient and reduces the risk of missing relevant skills.

---

## Skill Index

| Skill | Path |
|---|---|
| web-search | `skills/web-search/SKILL.md` |
| file-ops | `skills/file-ops/SKILL.md` |
| browser | `skills/browser/SKILL.md` |
| email | `skills/email/SKILL.md` |

## Agent Index

| Agent | Path |
|---|---|
| analytik | `agents/analytik/SKILL.md` |
| creator | `agents/creator/SKILL.md` |
| auditor | `agents/auditor/SKILL.md` |
| strategist | `agents/strategist/SKILL.md` |
| browser-agent | `agents/browser-agent/SKILL.md` |

---

## Model Configuration

See `model_config.yaml`. For Gemini models use alias `gemini` or `fast`.

---

## Language Rules

All agent instructions and prompts: **English only.**
UI strings: see `messages/` folder.

---

## Compatibility Note

Some advanced skill features (shell preprocessing with `!command` syntax,
subagent forking with `context: fork`) are Claude Code-specific and may not
work in Gemini CLI. Core SKILL.md instructions work universally.
