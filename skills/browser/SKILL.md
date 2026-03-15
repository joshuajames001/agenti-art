---
name: browser
description: Controls a headless browser for navigation, scraping, and web automation. Use for pages that require JavaScript rendering or user interaction.
version: 1.0.0
---

# Browser Skill

Headless browser automation via Puppeteer / Playwright.

## Operations
- **navigate** — go to URL
- **extract** — pull data from DOM
- **screenshot** — capture page screenshot
- **interact** — click, fill forms, scroll

## Limits
- Respect robots.txt
- Max 10 requests per minute per domain
- 30s timeout per action
