# Failure Taxonomy Reference — ADR Creator

## How to classify a failure

Ask these questions in order:

1. Did the agent act outside its defined scope?
   → YES: boundary-violation

2. Did the agent start without required inputs?
   → YES: missing-input

3. Should the agent have escalated but didn't?
   → YES: escalation-failure

4. Did the agent retry the same action without limit?
   → YES: infinite-loop

5. Did the agent produce malformed or invalid output?
   → YES: data-corruption

6. Did the agent exceed rate limits or misuse a connector?
   → YES: connector-abuse

7. Did the agent expose sensitive data or credentials?
   → YES: authorization-leak (CRITICAL — immediate ADR)

8. Did the agent drift from the original goal?
   → YES: context-drift

9. Did one agent failure break all downstream agents?
   → YES: cascade-failure

10. Was the pipeline configured incorrectly by the operator?
    → YES: human-error

## Severity matrix

| Category | Default severity | Auto-ADR threshold |
|---|---|---|
| boundary-violation | HIGH | 2 occurrences |
| missing-input | MEDIUM | 3 occurrences |
| escalation-failure | HIGH | 2 occurrences |
| infinite-loop | HIGH | 2 occurrences |
| data-corruption | HIGH | 2 occurrences |
| connector-abuse | MEDIUM | 3 occurrences |
| authorization-leak | CRITICAL | 1 occurrence |
| context-drift | LOW | 3 occurrences |
| cascade-failure | CRITICAL | 1 occurrence |
| human-error | LOW | 5 occurrences |

## 5-Why template

```
Failure: {what happened}

Why 1: {immediate cause}
Why 2: {cause of cause 1}
Why 3: {cause of cause 2}
Why 4: {cause of cause 3}
Why 5: {root structural cause}

Root cause category: {taxonomy category}
Structural fix: {what to change in architecture}
Rule fix: {what ADR to write}
```
