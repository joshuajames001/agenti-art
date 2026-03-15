# GhostFactory Agent Store — Claude Instructions

## CRITICAL: Skill Usage Rule

Before starting ANY task, no matter how simple, you MUST follow this exact sequence:

1. List available skills: `ls skills/`
2. List available agents: `ls agents/`
3. For every skill and agent with even a 1% chance of helping — read its SKILL.md
4. Only then proceed with the task

**There are no exceptions to this rule.**
A skill that could have helped but wasn't read = task failure.
When in doubt, read the skill. Reading costs tokens. Missing it costs quality.

---

## Skill Selection Logic

Ask yourself before every task:
- Does this involve files? → read `skills/file-ops/SKILL.md`
- Does this involve the web or research? → read `skills/web-search/SKILL.md`
- Does this involve a browser or scraping? → read `skills/browser/SKILL.md`
- Does this involve sending messages or email? → read `skills/email/SKILL.md`
- Does the task match any agent role? → read that agent's `SKILL.md` + `agent.yaml`

If you are unsure whether a skill applies — read it anyway.

---

## Agent Usage Rule

Agents in `agents/` are role-based specialists. When a task clearly maps to a role:

1. Read `agents/{role}/SKILL.md` — personality, capabilities, process
2. Read `agents/{role}/agent.yaml` — model, connectors, max_steps
3. Adopt the agent's persona and output format for the duration of the task

Available agents:
- `agents/analytik/` — data analysis, reporting, CSV/JSON processing
- `agents/creator/` — copywriting, content, social media, emails
- `agents/auditor/` — fact-checking, code review, QA, verification
- `agents/strategist/` — business strategy, planning, competitive analysis
- `agents/browser-agent/` — web scraping, automation, monitoring

---

## Model Configuration

All model references point to `model_config.yaml` (LiteLLM unified config).
Never hardcode model strings — always reference via config keys: `fast`, `smart`, `powerful`, `gpt`, `gemini`, `local`.

---

## Language Rules

| Content type | Language |
|---|---|
| Agent instructions (SKILL.md body) | English |
| agent.yaml fields and comments | English |
| Code comments and scripts | English |
| UI strings | See `messages/` (EN + CS) |
| Git commit messages | English |
| README and docs | English |

---

## Compatibility Note

This repository is optimized for **Anthropic Claude** models via Claude Code and Antigravity IDE.
Behavior on other models may vary — see `GEMINI.md` and `AGENTS.md` for alternative configurations.

---

## Repository Structure

```
agents/          role-based agent templates (SKILL.md + agent.yaml)
skills/          shared reusable skills
templates/       boilerplate for new agents
messages/        i18n UI strings (en.json, cs.json)
.github/         CI validation + auto registry update
model_config.yaml  GhostFactory shared LiteLLM config
registry.json    auto-generated agent index (do not edit manually)
schema.yaml      agent.yaml validation schema
```
