# 👾 GhostFactory Agent Store

> Public registry of AI agents for [agents.art](https://agents.art)

**1 agent = 1 složka = SKILL.md + agent.yaml**

Compatible with Claude Code, Antigravity IDE, Cursor and agents.art runtime.

## Quick Start

```bash
# Nainstaluj přes Claude Code
/plugin marketplace add ghostfactory/agent-store
/plugin install analytik@ghostfactory-agents

# Nebo klonuj a použij přímo
git clone https://github.com/ghostfactory/agent-store
```

## Agenti

| Agent | Kategorie | Default model |
|-------|-----------|---------------|
| [analytik](agents/analytik/) | data | smart |
| [creator](agents/creator/) | content | smart |
| [auditor](agents/auditor/) | qa | powerful |
| [strategist](agents/strategist/) | strategy | powerful |
| [browser-agent](agents/browser-agent/) | browser | fast |

## Přidat vlastního agenta

Viz [CONTRIBUTING.md](CONTRIBUTING.md).

## Struktura

```
agents/
  jmeno-agenta/
    SKILL.md        ← instrukce + frontmatter (standard)
    agent.yaml      ← runtime config (agents.art rozšíření)
    references/     ← volitelné extra soubory
skills/             ← sdílené skills (web-search, file-ops...)
templates/          ← boilerplate pro nové agenty
.github/workflows/  ← CI validace + auto registry update
model_config.yaml   ← GhostFactory shared model config (LiteLLM)
registry.json       ← auto-generovaný index agentů
```

---

*GhostFactory — Agents Rule Tomorrow*
