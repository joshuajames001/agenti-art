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
