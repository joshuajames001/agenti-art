#!/bin/bash
set -e

ROOT="."

echo "🚀 GhostFactory — agents.art repo setup"
echo "========================================"

# ── DIRECTORIES ──────────────────────────────────────────────
mkdir -p \
  agents/analytik/references \
  agents/creator/references \
  agents/auditor/references \
  agents/strategist/references \
  agents/browser-agent/references \
  skills/web-search \
  skills/file-ops \
  skills/email \
  skills/browser \
  templates/starter-agent/references \
  .github/workflows

echo "✓ Složky vytvořeny"

# ── model_config.yaml (GhostFactory shared) ──────────────────
cat > model_config.yaml << 'EOF'
# GhostFactory — Shared Model Configuration
# Single source of truth pro všechny .art produkty
# Provider: LiteLLM (jednotné API pro všechny modely)

version: "1.0.0"
provider: litellm

models:
  fast:
    litellm: anthropic/claude-haiku-4-5-20251001
    label: "Rychlý"
    description: "Real-time odpovědi, vysoký objem volání"
    cost_tier: low

  smart:
    litellm: anthropic/claude-sonnet-4-6
    label: "Vyvážený"
    description: "Výchozí pro většinu agentů — reasoning + rychlost"
    cost_tier: medium

  powerful:
    litellm: anthropic/claude-opus-4-6
    label: "Výkonný"
    description: "Komplexní plánování, přesnost, dlouhý kontext"
    cost_tier: high

  gpt:
    litellm: openai/gpt-4o
    label: "GPT-4o"
    description: "OpenAI alternativa"
    cost_tier: medium

  gemini:
    litellm: google/gemini-2.0-flash
    label: "Gemini Flash"
    description: "Google alternativa, rychlý"
    cost_tier: low

  local:
    litellm: ollama/llama3.2
    label: "Lokální"
    description: "Zdarma, soukromé, běží na vlastním hardware"
    cost_tier: free

defaults:
  fallback_model: smart
  max_retries: 3
  timeout_seconds: 30
EOF
echo "✓ model_config.yaml"

# ── schema.yaml ───────────────────────────────────────────────
cat > schema.yaml << 'EOF'
# agents.art — Agent YAML Schema
# Validace pro CI pipeline při každém PR

version: "1.0.0"

required_fields:
  - name
  - version
  - category
  - default_model

optional_fields:
  - description
  - allowed_models
  - connectors
  - max_steps
  - provider_config
  - tags
  - author
  - compatibility

categories:
  - data
  - content
  - qa
  - strategy
  - automation
  - browser
  - communication
  - custom

valid_connectors:
  - web-search
  - file-ops
  - email
  - browser
  - supabase
  - github
  - slack
  - notion
  - google-workspace
  - custom-mcp

valid_models:
  - fast
  - smart
  - powerful
  - gpt
  - gemini
  - local
EOF
echo "✓ schema.yaml"

# ── registry.json ─────────────────────────────────────────────
cat > registry.json << 'EOF'
{
  "_meta": {
    "version": "1.0.0",
    "generated": "auto — CI aktualizuje po každém merge",
    "repo": "ghostfactory/agent-store"
  },
  "agents": []
}
EOF
echo "✓ registry.json"

# ── AGENT: analytik ───────────────────────────────────────────
cat > agents/analytik/SKILL.md << 'EOF'
---
name: analytik
description: Analyzuje data, vytváří reporty a vizualizace. Použij když uživatel potřebuje zpracovat data, vytvořit přehled, porovnat hodnoty, nebo pochopit trendy v číslech.
version: 1.0.0
author: GhostFactory
category: data
tags: [data, reporting, analytics, csv, excel]
compatibility: [claude-code, agents-art, cursor]
---

# Analytik

Jsi datový analytik specializovaný na transformaci surových dat do srozumitelných přehledů.

## Osobnost
- Přesný, strukturovaný, orientovaný na fakta
- Vždy uvádíš zdroj dat a metodiku
- Upozorníš na anomálie nebo neúplná data
- Výstupy jsou vždy vizuálně přehledné

## Schopnosti
- Analýza CSV, JSON, Excel souborů
- Statistické výpočty (průměr, medián, trendy)
- Vytváření přehledových tabulek a grafů
- Porovnání časových řad
- Detekce outlierů a anomálií

## Postup
1. Načti a validuj vstupní data
2. Identifikuj klíčové metriky relevantní pro dotaz
3. Proveď analýzu, uveď metodiku
4. Prezentuj výsledky strukturovaně (tabulka → shrnutí → doporučení)

## Formát výstupu
Vždy: **Shrnutí** → **Detailní analýza** → **Doporučení**
EOF

cat > agents/analytik/agent.yaml << 'EOF'
name: analytik
version: 1.0.0
category: data
provider_config: ../../model_config.yaml

default_model: smart
allowed_models:
  - fast
  - smart
  - powerful
  - gpt

connectors:
  - web-search
  - file-ops

max_steps: 8

skills:
  - ../../skills/web-search
  - ../../skills/file-ops
EOF

cat > agents/analytik/references/examples.md << 'EOF'
# Příklady použití — Analytik

## Vstup
"Mám CSV s tržbami za Q1-Q4, chci vidět trend a top 3 produkty."

## Výstup (ukázka)
| Kvartál | Tržby | Změna |
|---------|-------|-------|
| Q1      | 120k  | —     |
| Q2      | 145k  | +21%  |
| Q3      | 138k  | -5%   |
| Q4      | 189k  | +37%  |

**Top 3 produkty:** Produkt A (34%), Produkt B (28%), Produkt C (19%)
**Trend:** Rostoucí s poklesem v Q3 (sezónní výkyv).
**Doporučení:** Zaměřit se na Q3 retention strategii.
EOF
echo "✓ agents/analytik/"

# ── AGENT: creator ────────────────────────────────────────────
cat > agents/creator/SKILL.md << 'EOF'
---
name: creator
description: Vytváří textový obsah — posty, články, copy, emaily, skripty. Použij když uživatel potřebuje napsat, přepsat nebo vylepšit jakýkoliv text pro publikaci nebo komunikaci.
version: 1.0.0
author: GhostFactory
category: content
tags: [content, copywriting, social-media, email, blog]
compatibility: [claude-code, agents-art, cursor]
---

# Creator

Jsi zkušený copywriter a content stratég se smyslem pro hlas značky.

## Osobnost
- Kreativní, adaptabilní na různé tóny a styly
- Vždy se zeptáš na cílovou skupinu pokud není jasná
- Navrhneš varianty pokud si uživatel není jistý
- Dbáš na SEO a engagement metriky

## Schopnosti
- Blog posty, články, long-form obsah
- Social media copy (LinkedIn, Twitter/X, Instagram)
- Email marketing a newslettery
- Landing page copy a CTA texty
- Přepis a vylepšení existujícího textu

## Postup
1. Identifikuj: formát, tón, cílová skupina, délka
2. Vytvoř draft s jasnou strukturou
3. Optimalizuj pro daný kanál
4. Nabídni alternativní verzi pokud relevantní

## Formát výstupu
Hotový text připravený ke kopírování + krátká poznámka o rozhodnutích.
EOF

cat > agents/creator/agent.yaml << 'EOF'
name: creator
version: 1.0.0
category: content
provider_config: ../../model_config.yaml

default_model: smart
allowed_models:
  - smart
  - powerful
  - gpt

connectors:
  - web-search

max_steps: 5
EOF
echo "✓ agents/creator/"

# ── AGENT: auditor ────────────────────────────────────────────
cat > agents/auditor/SKILL.md << 'EOF'
---
name: auditor
description: Kontroluje, ověřuje a audituje výstupy jiných agentů nebo uživatelů. Použij když potřebuješ fact-checking, review kódu, kontrolu kvality textu nebo ověření správnosti dat.
version: 1.0.0
author: GhostFactory
category: qa
tags: [qa, review, fact-check, audit, verification]
compatibility: [claude-code, agents-art, cursor]
---

# Auditor

Jsi nezávislý auditor zaměřený na přesnost, konzistenci a kvalitu.

## Osobnost
- Skeptický, ale konstruktivní
- Nikdy nepřijmeš výstup bez ověření
- Jasně odlišuješ fakta od domněnek
- Vždy uvedeš závažnost problému (kritická / střední / nízká)

## Schopnosti
- Fact-checking tvrzení a dat
- Code review (logika, bezpečnost, best practices)
- Kontrola konzistence dokumentů
- Ověřování kalkulací a výpočtů
- Identifikace bias a chyb v úsudku

## Postup
1. Načti vstup a identifikuj co má být ověřeno
2. Rozděl na ověřitelné tvrzení
3. Každé tvrzení ohodnoť: ✓ správně / ⚠ nejasné / ✗ chybně
4. Sumarizuj nálezy se závažností

## Formát výstupu
**Celkové hodnocení** → **Seznam nálezů** → **Doporučení k opravě**
EOF

cat > agents/auditor/agent.yaml << 'EOF'
name: auditor
version: 1.0.0
category: qa
provider_config: ../../model_config.yaml

default_model: powerful
allowed_models:
  - smart
  - powerful

connectors:
  - web-search

max_steps: 10
EOF
echo "✓ agents/auditor/"

# ── AGENT: strategist ─────────────────────────────────────────
cat > agents/strategist/SKILL.md << 'EOF'
---
name: strategist
description: Vytváří strategické plány, analyzuje trhy a navrhuje business rozhodnutí. Použij pro product strategy, go-to-market plány, competitive analysis nebo rozhodovací frameworky.
version: 1.0.0
author: GhostFactory
category: strategy
tags: [strategy, business, planning, market-analysis, gtm]
compatibility: [claude-code, agents-art, cursor]
---

# Stratégist

Jsi senior business stratég s myšlením produktového leadra.

## Osobnost
- Myslí v systémech a dlouhodobých dopadech
- Vždy zvažuje rizika i příležitosti
- Pracuje s frameworky (SWOT, Jobs-to-be-done, Porter)
- Konkrétní doporučení, ne obecné rady

## Schopnosti
- Product strategy a roadmap planning
- Competitive analysis a positioning
- Go-to-market strategie
- OKR a cílové frameworky
- Rozhodovací stromy a prioritizace

## Postup
1. Definuj kontext a cíl
2. Zmapuj situaci (stakeholders, constrainty, příležitosti)
3. Navrhni 2-3 strategické možnosti s trade-offs
4. Doporuč konkrétní next steps

## Formát výstupu
**Situace** → **Možnosti** → **Doporučení** → **Next steps (30/60/90 dní)**
EOF

cat > agents/strategist/agent.yaml << 'EOF'
name: strategist
version: 1.0.0
category: strategy
provider_config: ../../model_config.yaml

default_model: powerful
allowed_models:
  - smart
  - powerful
  - gpt

connectors:
  - web-search

max_steps: 8
EOF
echo "✓ agents/strategist/"

# ── AGENT: browser-agent ──────────────────────────────────────
cat > agents/browser-agent/SKILL.md << 'EOF'
---
name: browser-agent
description: Prochází web, scrape data, testuje UI a sbírá informace z webových stránek. Použij pro web scraping, monitoring cen, sběr dat z více zdrojů nebo automatizované testování webu.
version: 1.0.0
author: GhostFactory
category: browser
tags: [browser, scraping, web, automation, monitoring]
compatibility: [claude-code, agents-art]
---

# Browser Agent

Jsi web automation specialista zaměřený na sběr a zpracování dat z webu.

## Osobnost
- Efektivní, minimalizuje počet requestů
- Respektuje robots.txt a rate limiting
- Vždy upozorní na právní/etické omezení
- Strukturuje výstupy pro další zpracování

## Schopnosti
- Web scraping a extrakce dat
- Monitoring cen a dostupnosti
- Sběr dat z více zdrojů najednou
- Screenshot a vizuální kontrola stránek
- Testování uživatelských flows

## Postup
1. Validuj URL a zkontroluj přístupnost
2. Identifikuj relevantní elementy
3. Extrahuj data strukturovaně
4. Zpracuj a validuj výstup

## Formát výstupu
Strukturovaná data (JSON/tabulka) + metadata (zdroj, čas, status)
EOF

cat > agents/browser-agent/agent.yaml << 'EOF'
name: browser-agent
version: 1.0.0
category: browser
provider_config: ../../model_config.yaml

default_model: fast
allowed_models:
  - fast
  - smart

connectors:
  - browser
  - web-search

max_steps: 15
EOF
echo "✓ agents/browser-agent/"

# ── SKILLS ────────────────────────────────────────────────────
cat > skills/web-search/SKILL.md << 'EOF'
---
name: web-search
description: Vyhledává aktuální informace na webu. Použij pro fact-checking, research nebo získání aktuálních dat která nejsou v trénovacích datech.
version: 1.0.0
---

# Web Search Skill

Proveď web search pro získání aktuálních informací.

## Použití
- Vždy cituj zdroj
- Preferuj autoritativní zdroje
- Maximálně 5 searchů na jeden dotaz
- Sumarizuj, nekopíruj celé texty
EOF

cat > skills/web-search/config.yaml << 'EOF'
max_queries_per_task: 5
prefer_sources:
  - official docs
  - peer-reviewed
  - gov sites
avoid_sources:
  - forums (unless specifically relevant)
  - SEO farms
EOF

cat > skills/file-ops/SKILL.md << 'EOF'
---
name: file-ops
description: Čte, zapisuje a transformuje soubory — CSV, JSON, TXT, Markdown. Použij pro práci se soubory na filesystému.
version: 1.0.0
---

# File Operations Skill

Práce se soubory na filesystému.

## Operace
- read: načti soubor a zpracuj obsah
- write: ulož výstup do souboru
- transform: konverze mezi formáty (CSV ↔ JSON)
- validate: ověř strukturu souboru

## Bezpečnost
- Nikdy nepřepisuj soubory bez potvrzení
- Vždy validuj vstupní data před zápisem
EOF

cat > skills/email/SKILL.md << 'EOF'
---
name: email
description: Odesílá a čte emaily přes nakonfigurovaný email konektor. Použij pro automatizované odesílání notifikací, reportů nebo odpovědí na emaily.
version: 1.0.0
---

# Email Skill

Odesílání a čtení emailů.

## Operace
- send: odešli email (to, subject, body)
- read: načti inbox nebo konkrétní vlákno
- reply: odpověz na existující email

## Pravidla
- Vždy potvrď před odesláním pokud není explicitně povoleno auto-send
- Nikdy neodesílej citlivá data bez šifrování
EOF

cat > skills/browser/SKILL.md << 'EOF'
---
name: browser
description: Ovládá headless browser pro navigaci, scraping a automatizaci webu. Použij pro stránky které vyžadují JavaScript nebo interakci.
version: 1.0.0
---

# Browser Skill

Headless browser automation přes Puppeteer/Playwright.

## Operace
- navigate: přejdi na URL
- extract: extrahuj data z DOM
- screenshot: poříď screenshot
- interact: klikni, vyplň formulář, scrolluj

## Limity
- Respektuj robots.txt
- Max 10 requestů za minutu na doménu
- Timeout 30s per akce
EOF
echo "✓ skills/"

# ── TEMPLATE: starter-agent ───────────────────────────────────
cat > templates/starter-agent/SKILL.md << 'EOF'
---
name: your-agent-name          # snake_case, unikátní v celém store
description: |                 # DŮLEŽITÉ: toto je hlavní trigger
  Co agent dělá a kdy ho použít.
  Buď konkrétní — agent se aktivuje na základě tohoto textu.
  Příklad: "Použij když uživatel potřebuje X, Y nebo Z."
version: 1.0.0
author: your-github-username
category: custom               # viz schema.yaml pro platné hodnoty
tags: [tag1, tag2]
compatibility: [claude-code, agents-art]
---

# Jméno Agenta

Krátký popis role v jedné větě.

## Osobnost
- Jak agent komunikuje
- Jaký má přístup k problémům
- Co vždy/nikdy nedělá

## Schopnosti
- Schopnost 1
- Schopnost 2
- Schopnost 3

## Postup
1. První krok
2. Druhý krok
3. Třetí krok

## Formát výstupu
Jak vypadá výstup agenta.
EOF

cat > templates/starter-agent/agent.yaml << 'EOF'
# agents.art — Agent Runtime Configuration
# Tento soubor rozšiřuje SKILL.md o runtime parametry

name: your-agent-name          # musí odpovídat SKILL.md
version: 1.0.0
category: custom
provider_config: ../../model_config.yaml

# Výchozí model pro tuto roli
# Hodnoty: fast | smart | powerful | gpt | gemini | local
default_model: smart

# Modely které může uživatel přepnout v UI
allowed_models:
  - fast
  - smart
  - powerful

# MCP konektory které agent potřebuje
# Hodnoty: web-search | file-ops | email | browser | supabase | github | slack
connectors:
  - web-search

# Max počet kroků před ukončením (ochrana proti infinite loops)
max_steps: 5
EOF
echo "✓ templates/starter-agent/"

# ── CI WORKFLOWS ──────────────────────────────────────────────
cat > .github/workflows/validate.yml << 'EOF'
name: Validate agents

on:
  pull_request:
    paths:
      - 'agents/**'
      - 'skills/**'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Check SKILL.md frontmatter
        run: |
          for skill in agents/*/SKILL.md; do
            echo "Checking $skill..."
            # Ověří že soubor začíná YAML frontmatter
            if ! head -1 "$skill" | grep -q "^---$"; then
              echo "❌ $skill missing YAML frontmatter"
              exit 1
            fi
            # Ověří povinná pole
            for field in name description version; do
              if ! grep -q "^$field:" "$skill"; then
                echo "❌ $skill missing required field: $field"
                exit 1
              fi
            done
            echo "✓ $skill"
          done

      - name: Check agent.yaml exists
        run: |
          for agent_dir in agents/*/; do
            if [ ! -f "${agent_dir}agent.yaml" ]; then
              echo "❌ ${agent_dir} missing agent.yaml"
              exit 1
            fi
            echo "✓ ${agent_dir}agent.yaml"
          done
EOF

cat > .github/workflows/registry.yml << 'EOF'
name: Update registry

on:
  push:
    branches: [main]
    paths:
      - 'agents/**'

jobs:
  update-registry:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4

      - name: Generate registry.json
        run: |
          python3 - << 'PYTHON'
          import json, os, re
          from pathlib import Path

          agents = []
          for skill_path in sorted(Path("agents").glob("*/SKILL.md")):
              content = skill_path.read_text()
              # Parsuj frontmatter
              fm_match = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
              if not fm_match:
                  continue
              fm = {}
              for line in fm_match.group(1).split('\n'):
                  if ':' in line:
                      k, v = line.split(':', 1)
                      fm[k.strip()] = v.strip().strip('"')

              agent_yaml = skill_path.parent / "agent.yaml"
              agents.append({
                  "name": fm.get("name", ""),
                  "version": fm.get("version", ""),
                  "category": fm.get("category", ""),
                  "description": fm.get("description", ""),
                  "tags": fm.get("tags", "[]"),
                  "author": fm.get("author", "community"),
                  "path": str(skill_path.parent),
                  "has_agent_yaml": agent_yaml.exists()
              })

          registry = {
              "_meta": {
                  "version": "1.0.0",
                  "generated": "auto — CI",
                  "repo": "ghostfactory/agent-store",
                  "count": len(agents)
              },
              "agents": agents
          }
          Path("registry.json").write_text(json.dumps(registry, indent=2, ensure_ascii=False))
          print(f"✓ Registry updated: {len(agents)} agents")
          PYTHON

      - name: Commit registry
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add registry.json
          git diff --staged --quiet || git commit -m "chore: update registry.json [skip ci]"
          git push
EOF
echo "✓ .github/workflows/"

# ── ROOT FILES ────────────────────────────────────────────────
cat > CONTRIBUTING.md << 'EOF'
# Jak přidat agenta do agents.art store

## Požadavky
1. Fork tohoto repozitáře
2. Vytvoř složku `agents/jmeno-agenta/`
3. Přidej povinné soubory (viz níže)
4. Otevři Pull Request

## Povinné soubory

### SKILL.md
Musí začínat YAML frontmatter:
```yaml
---
name: jmeno-agenta
description: Co agent dělá a kdy ho použít. (toto je trigger)
version: 1.0.0
author: tvuj-github-username
category: data|content|qa|strategy|automation|browser|custom
tags: [tag1, tag2]
---
```

### agent.yaml
Runtime konfigurace — viz `templates/starter-agent/agent.yaml`.

## Validace
CI automaticky zkontroluje strukturu při PR.
Merge je možný až po úspěšné validaci.

## Konvence
- Jméno složky = `name` v SKILL.md (snake_case)
- Verze semver: `major.minor.patch`
- Tagy lowercase, bez mezer
EOF

cat > README.md << 'EOF'
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
EOF
echo "✓ README.md + CONTRIBUTING.md"

echo ""
echo "========================================"
echo "✅ agents.art repo struktura hotová!"
echo ""
echo "Soubory:"
find . -not -path './.git/*' -not -name 'setup-agents-art.sh' | sort | head -60
