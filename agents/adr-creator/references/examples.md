# Incident Analysis Examples — ADR Creator

## Example 1: Confirmed pattern → ADR generated

**Input (log excerpt):**
```
[2026-03-10] email-responder → auto_send: true → billing@client.com [SENT]
[2026-03-11] email-responder → auto_send: true → billing@client2.com [SENT]
[2026-03-12] email-responder → auto_send: true → legal@client3.com [SENT]
[2026-03-12] INCIDENT: client3 reports receiving incorrect billing email
```

**Output:**
```
## Incident Analysis

Date: 2026-03-12
Agent: email-responder
Category: escalation-failure
Occurrences: 3
Pattern status: confirmed

## Root Cause
Why did client3 receive incorrect email?
→ email-responder sent without human review.
Why was there no review?
→ auto_send: true was set for all categories.
Why was auto_send enabled for legal emails?
→ No rule existed prohibiting it.
Why did no rule exist?
→ First two incidents (billing) were not flagged.
→ Pattern was not detected until third incident caused client complaint.
```

**ADR Generated:**
```markdown
# ADR-001: email-responder must never auto-send to billing or legal categories

## Status
Accepted

## Evidence
- Incident date: 2026-03-12
- Failure category: escalation-failure
- Occurrences: 3 (2026-03-10, 2026-03-11, 2026-03-12)
- Affected agents: email-responder
- Blast radius: client complaint, potential legal exposure

## Root Cause
email-responder had auto_send: true enabled globally with no category
restrictions. Three billing/legal emails were sent without human review,
the third causing a client incident. No escalation rule existed because
no prior rule covered category-based send restrictions.

## Rule
email-responder MUST NOT set auto_send: true when email category
is IN [billing, legal, urgent, unknown].

All emails in restricted categories MUST enter [DRAFT] state
and await explicit [APPROVED] flag before delivery.

## Constraints
- Restricted categories: billing, legal, urgent, unknown
- Allowed auto-send: acknowledgment, notification (internal only)
- External domain recipient: always DRAFT regardless of category
- Max email size for auto-send: 200 words

## Enforced by
- Agent: auditor
- Timing: after email-responder output, before connector delivery
- Violation response: STOP pipeline, flag [ADR-001-VIOLATION], hold draft

## Prevention
Add category classifier as first step in email-responder pipeline.
Require human approval node for restricted categories.
Auto-send should be opt-in per category, not opt-out.

## Agents involved
email-responder, auditor, orchestrator
```

---

## Example 2: Single critical event → immediate ADR

**Input:**
```
[2026-03-14] researcher → web-search query: "API_KEY=sk-ant-..."
[2026-03-14] ERROR: API key found in search query — potential exposure
```

**Output:**
```
## Incident Analysis

Date: 2026-03-14
Agent: researcher
Category: authorization-leak
Occurrences: 1
Pattern status: CRITICAL — immediate ADR

## Root Cause
researcher included raw environment variable content in web-search query.
API key was potentially sent to external search provider.
Single occurrence classified as critical due to security impact.
```

**ADR Generated:**
```markdown
# ADR-002: Agents must never include secrets in external connector calls

## Status
Accepted

## Evidence
- Incident date: 2026-03-14
- Failure category: authorization-leak
- Occurrences: 1 (critical — immediate ADR)
- Affected agents: researcher
- Blast radius: potential API key exposure to external search provider

## Rule
All agents MUST NOT include secrets, API keys, tokens, passwords,
or environment variable values in any external connector call
(web-search, browser, email, custom-mcp).

## Constraints
- Secrets pattern: strings matching sk-*, Bearer *, password=*, key=*
- Scanner runs: before every external connector call
- If secret detected: STOP call, redact, LOG incident

## Enforced by
- Agent: orchestrator (pre-call scanner)
- Timing: before every external connector invocation
- Violation response: STOP pipeline, [ADR-002-VIOLATION], alert operator

## Prevention
Implement secrets scanner middleware in connector layer.
Agents should receive sanitized inputs only — never raw env vars.

## Agents involved
all agents with external connectors
```

---

## Example 3: Anomaly → watch list (no ADR yet)

**Input:**
```
[2026-03-15] orchestrator → dispatched analytik → step 3 failed
[2026-03-15] orchestrator → retry analytik → step 3 failed again
[2026-03-15] orchestrator → retry analytik → TIMEOUT
```

**Output:**
```
## Incident Analysis

Date: 2026-03-15
Agent: orchestrator → analytik
Category: infinite-loop (partial — 2 retries before timeout)
Occurrences: 1
Pattern status: WATCH — 2 more occurrences needed for ADR

## Root Cause (preliminary)
Orchestrator retried analytik without checking if failure was
caused by bad input (which retry cannot fix) vs transient error
(which retry can fix). No retry classification logic exists.

## Watch List Entry
WATCH: orchestrator retry-without-classification
Next occurrence: escalate to pattern, draft ADR
Suggested future rule: orchestrator SHOULD NOT retry agent
if failure cause is classified as input-error
```
