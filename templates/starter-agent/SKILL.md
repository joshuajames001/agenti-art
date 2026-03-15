---
name: your-agent-name          # snake_case, unique across the store
description: |                 # IMPORTANT: this is the primary trigger
  What the agent does and when to use it.
  Be specific — the agent activates based on this text.
  Example: "Use when the user needs to do X, Y, or Z."
version: 1.0.0
author: your-github-username
category: custom               # see schema.yaml for valid values
tags: [tag1, tag2]
compatibility: [claude-code, agents-art]
---

# Agent Name

One-sentence description of the agent's role.

## Personality
- How the agent communicates
- Its approach to problems
- What it always / never does

## Capabilities
- Capability 1
- Capability 2
- Capability 3

## Process
1. First step
2. Second step
3. Third step

## Output Format
Describe what the agent's output looks like.
