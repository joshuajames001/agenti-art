# Contributing to GhostFactory Agent Store

## Requirements
1. Fork this repository
2. Create a folder `agents/your-agent-name/`
3. Add the required files (see below)
4. Open a Pull Request

## Required Files

### SKILL.md
Must start with YAML frontmatter:
```yaml
---
name: your-agent-name
description: What the agent does and when to use it. (this is the trigger)
version: 1.0.0
author: your-github-username
category: data|content|qa|strategy|automation|browser|custom
tags: [tag1, tag2]
---
```

### agent.yaml
Runtime configuration — see `templates/starter-agent/agent.yaml`.

## Validation
CI automatically checks structure on every PR.
Merge is only possible after successful validation.

## Conventions
- Folder name = `name` field in SKILL.md (snake_case)
- Version in semver: `major.minor.patch`
- Tags lowercase, no spaces
- All instructions and prompts in **English**
