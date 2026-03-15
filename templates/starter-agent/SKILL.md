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
