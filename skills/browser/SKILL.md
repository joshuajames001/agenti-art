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
