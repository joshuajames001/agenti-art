# Common Pipeline Patterns

## Pattern 1: Research → Analyze → Create
Best for: reports, content, market research
```
researcher → data-extractor → analytik → creator → auditor
```

## Pattern 2: Extract → Clean → Analyze
Best for: data processing, ETL workflows
```
browser-agent → data-extractor → analytik
```

## Pattern 3: Monitor → Alert
Best for: price monitoring, news tracking
```
browser-agent → data-extractor → [threshold check] → email-responder
```

## Pattern 4: Inbox → Triage → Respond
Best for: customer support automation
```
email-responder (read) → support-bot → email-responder (send)
```

## Pattern 5: Fan-out → Merge
Best for: parallel research, multi-source data collection
```
researcher ×3 (parallel) → data-extractor → analytik
```

## Anti-patterns to avoid
- Chaining more than 6 agents in sequence (context degrades)
- Using orchestrator for single-agent tasks
- Running auditor before creator has finished
- Passing raw unstructured output between agents without data-extractor in between
