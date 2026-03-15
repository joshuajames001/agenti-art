# 👾 GhostFactory Agent Store

> Public registry of AI agents 

**1 agent = 1 folder = SKILL.md + agent.yaml**

Compatible with Claude Code, Antigravity IDE, Cursor and the agents.art runtime.

## Quick Start

```bash
# Install via Claude Code
/plugin marketplace add joshuajames001/agenti-art
/plugin install analytik@ghostfactory-agents

# Or clone and use directly
git clone https://github.com/joshuajames001/agenti-art
```

## Agents

| Agent | Category | Default Model | Description |
|-------|----------|---------------|-------------|
| [analytik](agents/analytik/) | data | smart | Data analysis & reporting |
| [creator](agents/creator/) | content | smart | Copywriting & content |
| [auditor](agents/auditor/) | qa | powerful | QA & fact-checking |
| [strategist](agents/strategist/) | strategy | powerful | Business & product strategy |
| [browser-agent](agents/browser-agent/) | browser | fast | Web scraping & automation |

## Structure

```
agents/
  agent-name/
    SKILL.md        ← instructions + frontmatter (Anthropic standard)
    agent.yaml      ← runtime config (agents.art extension)
    references/     ← optional supporting files
skills/             ← shared skills (web-search, file-ops...)
templates/          ← boilerplate for new agents
.github/workflows/  ← CI validation + auto registry update
model_config.yaml   ← GhostFactory shared model config (LiteLLM)
registry.json       ← auto-generated agent index
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) — all instructions and prompts must be written in **English**.

---

*GhostFactory — Agents Rule Tomorrow*
