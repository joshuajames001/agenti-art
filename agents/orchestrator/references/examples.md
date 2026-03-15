# Pipeline Examples — Orchestrator

## Example 1: Competitive Research Pipeline
**Goal:** "Research our top 3 competitors and write a comparison report"

**Pipeline Plan:**
```
## Pipeline: Competitor Research Report

Steps:
1. [researcher] → Research competitor A (Competitor X)
2. [researcher] → Research competitor B (Competitor Y)
3. [researcher] → Research competitor C (Competitor Z)
4. [data-extractor] → Extract pricing, features, positioning from results (depends on: 1,2,3)
5. [analytik] → Compare across dimensions: price, features, market position (depends on: 4)
6. [creator] → Write executive comparison report (depends on: 5)
7. [auditor] → Fact-check claims in report (depends on: 6)

Parallel opportunities: steps 1, 2, 3 run simultaneously
Estimated steps: 7 | Risk: quality of step 6 depends on step 5 analysis depth
```

**Execution Log:**
```
[✓] researcher (A) — 8 sources found, pricing confirmed
[✓] researcher (B) — 6 sources found, pricing estimated (unconfirmed)
[✓] researcher (C) — 9 sources found, pricing confirmed
[✓] data-extractor — 3 competitor profiles extracted, 1 flagged [MISSING: pricing for B]
[✓] analytik — comparison table generated, B pricing marked as estimated
[✓] creator — 800-word report drafted
[✓] auditor — 2 claims flagged for weak sourcing, corrections applied
```

---

## Example 2: Content Production Pipeline
**Goal:** "Find trending topics in AI, pick the best one, write a LinkedIn post"

**Pipeline Plan:**
```
Steps:
1. [researcher] → Find top 5 trending AI topics this week
2. [strategist] → Select best topic for our audience and positioning (depends on: 1)
3. [creator] → Write LinkedIn post on selected topic (depends on: 2)
4. [auditor] → Review post for accuracy and tone (depends on: 3)

Parallel opportunities: none — fully sequential
```

---

## Example 3: Lead Enrichment Pipeline
**Goal:** "Take this list of company names, find their emails and key decision makers"

**Pipeline Plan:**
```
Steps:
1. [data-extractor] → Parse input list into structured company records
2. [browser-agent] → Find website and LinkedIn for each company (depends on: 1)
3. [data-extractor] → Extract contact emails and decision maker names (depends on: 2)
4. [analytik] → Score and rank leads by fit criteria (depends on: 3)

Parallel opportunities: step 2 can process all companies in parallel
Risk: browser-agent may be blocked by some sites — fallback to web-search
```
