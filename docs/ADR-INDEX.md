# agenti.art — ADR Index

> Architecture Decision Records — binding rules for the agenti.art system.
> Maintained by: adr-creator agent + human operators.
> Read by: orchestrator (before every run) · auditor (enforcement) · adr-creator (deduplication)

---

## How to read this file

Every ADR is a **binding rule**, not a suggestion.

- `MUST` / `MUST NOT` → violation = **STOP pipeline**
- `SHOULD` / `SHOULD NOT` → violation = **WARN + LOG**
- `MAY` → optional, no enforcement

Status values: `Draft` · `Accepted` · `Deprecated` · `Superseded by ADR-NNN`

---

## Index

| ADR | Title | Status | Enforced by | Severity |
|-----|-------|--------|-------------|----------|
| [ADR-001](#adr-001) | Orchestrator must read ADR-INDEX before every pipeline run | Accepted | orchestrator (self) | CRITICAL |
| [ADR-002](#adr-002) | adr-creator must cite evidence before generating a rule | Accepted | auditor | HIGH |
| [ADR-003](#adr-003) | Agents must never include secrets in external connector calls | Accepted | orchestrator (pre-call) | CRITICAL |
| [ADR-004](#adr-004) | email-responder must not auto-send restricted categories | Accepted | auditor | HIGH |
| [ADR-005](#adr-005) | Orchestrator must not exceed 8 agents per pipeline | Accepted | orchestrator (self) | HIGH |
| [ADR-006](#adr-006) | data-extractor must never modify or delete source files | Accepted | auditor | HIGH |
| [ADR-007](#adr-007) | All agents must validate inputs before execution | Accepted | orchestrator | MEDIUM |
| [ADR-008](#adr-008) | model_config.yaml is the only source of model references | Accepted | CI pipeline | MEDIUM |

---

## ADR-001

### Orchestrator must read ADR-INDEX before every pipeline run

**Status:** Accepted

**Context:**
Without reading ADR-INDEX at startup, the orchestrator cannot enforce rules
that were added after the pipeline was created. Rules are useless if not loaded.

**Rule:**
```
orchestrator MUST read docs/ADR-INDEX.md before dispatching any agent.
If ADR-INDEX is unavailable → STOP pipeline, notify operator.
```

**Constraints:**
- Read at pipeline start, not at agent dispatch
- If ADR-INDEX has changed since last run → log the delta
- ADRs with status Deprecated or Superseded are skipped

**Enforced by:**
- Agent: orchestrator (self-enforcing)
- Timing: before step 1 of any pipeline
- Violation response: STOP — no pipeline runs without ADR load

**Agents involved:** orchestrator

---

## ADR-002

### adr-creator must cite evidence before generating a rule

**Status:** Accepted

**Context:**
Rules written without evidence are opinions, not architecture decisions.
A rule without a cited failure cannot be evaluated or challenged.
This prevents adr-creator from generating vague or unverifiable rules.

**Rule:**
```
adr-creator MUST NOT create an ADR without citing:
- at least one specific log entry, error message, or incident date
- the failure category from the taxonomy
- occurrence count

adr-creator MUST NOT use vague language:
"handle carefully", "be mindful", "use caution" are not rules.
```

**Constraints:**
- Evidence field is required in every generated ADR
- Vague language detection: if rule contains "carefully", "mindful",
  "caution", "appropriate" → reject and rewrite
- Exception: ADR-001 through ADR-008 (system bootstrap ADRs, pre-evidence)

**Enforced by:**
- Agent: auditor
- Timing: after adr-creator output, before saving to adr/ directory
- Violation response: WARN + return to adr-creator for revision

**Agents involved:** adr-creator, auditor

---

## ADR-003

### Agents must never include secrets in external connector calls

**Status:** Accepted

**Context:**
Any agent with external connector access (web-search, browser, email, custom-mcp)
could accidentally include API keys, tokens, or passwords in outbound requests.
Once sent to an external provider, secrets are considered compromised.
Single occurrence classified as CRITICAL — no pattern threshold needed.

**Rule:**
```
All agents MUST NOT include secrets, API keys, tokens, passwords,
or environment variable values in any external connector call.

Patterns to detect:
- sk-*, sk-ant-*, Bearer *, password=*, key=*, token=*, secret=*
- Any string matching environment variable name patterns
```

**Constraints:**
- Scanner runs before every external connector invocation
- If secret pattern detected: STOP call, redact value in logs, alert operator
- False positive handling: operator can whitelist specific patterns

**Enforced by:**
- Agent: orchestrator (pre-call secrets scanner)
- Timing: before every external connector invocation
- Violation response: STOP pipeline + [ADR-003-VIOLATION] + operator alert

**Agents involved:** all agents with external connectors

---

## ADR-004

### email-responder must not auto-send restricted categories

**Status:** Accepted

**Context:**
email-responder has auto_send capability. Sending an email to the wrong
recipient or with incorrect content in billing/legal/urgent categories
is irreversible and can cause legal or financial damage.
Default-safe: all emails draft first, operator opts into auto-send per category.

**Rule:**
```
email-responder MUST NOT set auto_send: true for emails in categories:
[billing, legal, urgent, unknown]

All emails in restricted categories MUST enter [DRAFT] state
and await explicit [APPROVED] flag before delivery.
```

**Constraints:**
- Allowed auto-send categories: [acknowledgment, notification] (internal only)
- External domain recipient: always DRAFT regardless of category
- Max email size for auto-send: 200 words
- Restricted categories list can be extended, never shortened, by operator

**Enforced by:**
- Agent: auditor
- Timing: after email-responder output, before connector delivery
- Violation response: STOP + [ADR-004-VIOLATION] + hold in draft

**Agents involved:** email-responder, auditor, orchestrator

---

## ADR-005

### Orchestrator must not exceed 8 agents per pipeline

**Status:** Accepted

**Context:**
Pipelines with too many agents cause context degradation, increased cost,
and unpredictable behavior. Each additional agent adds failure surface.
8 is the empirically safe limit for coherent multi-agent execution.

**Rule:**
```
orchestrator MUST NOT dispatch more than 8 agents in a single pipeline.

If task requires more than 8 agents →
orchestrator MUST decompose into sub-pipelines and run sequentially.
```

**Constraints:**
- Count includes: workers + auditor + orchestrator itself
- Sub-pipelines each have their own 8-agent limit
- Exception: loki-mode (autonomous mode, separate limit applies)
- Warning threshold: 6 agents → WARN operator before proceeding

**Enforced by:**
- Agent: orchestrator (self-enforcing, planning phase)
- Timing: during pipeline planning, before execution
- Violation response: WARN + auto-decompose into sub-pipelines

**Agents involved:** orchestrator

---

## ADR-006

### data-extractor must never modify or delete source files

**Status:** Accepted

**Context:**
data-extractor has file-ops connector with read and write capability.
Accidental modification or deletion of source data is irreversible
and breaks all downstream agents depending on that data.
Source data integrity is non-negotiable.

**Rule:**
```
data-extractor MUST NOT delete, overwrite, or modify source files.
data-extractor MAY only READ source files.
data-extractor MUST write outputs to a separate directory.

Output files MUST follow naming convention:
{source_name}_extracted_{timestamp}.{format}
```

**Constraints:**
- Source files: any file passed as input parameter to extraction task
- Output directory must differ from source directory
- If output file already exists: append timestamp suffix, never overwrite
- Temp files: allowed in /tmp only, auto-cleaned after task

**Enforced by:**
- Agent: auditor
- Timing: after every data-extractor file operation
- Violation response: STOP pipeline + attempt restore if backup available

**Agents involved:** data-extractor, auditor, file-ops skill

---

## ADR-007

### All agents must validate inputs before execution

**Status:** Accepted

**Context:**
Agents that start without required inputs generate hallucinated assumptions.
An agent that detects missing input and asks for it is safer than one
that proceeds with incomplete context and produces confident wrong output.

**Rule:**
```
All agents MUST check for required inputs before starting task execution.

If required input is missing or empty →
agent MUST stop and ask operator for missing data.
agent MUST NOT proceed with assumed or hallucinated values.
```

**Constraints:**
- Required inputs are defined in each agent's SKILL.md
- "Missing" includes: empty string, null, placeholder text
- Timeout for operator response: 5 minutes → escalate to orchestrator
- Exception: agents in fully autonomous mode (loki-mode) may use
  reasonable defaults if explicitly configured

**Enforced by:**
- Agent: orchestrator (validates inputs before dispatch)
- Timing: before each agent is dispatched
- Violation response: WARN + pause pipeline + request missing input

**Agents involved:** all agents, orchestrator

---

## ADR-008

### model_config.yaml is the only source of model references

**Status:** Accepted

**Context:**
Hardcoded model strings (e.g. "claude-sonnet-4-20250514") scattered across
agent.yaml files make provider migrations painful and error-prone.
When Anthropic releases a new model, a single file change should propagate
to all agents automatically.

**Rule:**
```
All agents MUST reference models via aliases defined in model_config.yaml.
(fast | smart | powerful | gpt | gemini | local)

Agents MUST NOT hardcode model strings in agent.yaml or SKILL.md.
```

**Constraints:**
- Valid aliases: fast, smart, powerful, gpt, gemini, local
- New aliases must be added to model_config.yaml before use
- CI pipeline validates alias references on every PR

**Enforced by:**
- CI pipeline (schema validation on PR)
- Timing: before merge to main
- Violation response: PR blocked until fixed

**Agents involved:** all agents, CI pipeline

---

## Adding a new ADR

1. Run adr-creator with failure log or incident description
2. adr-creator generates ADR with evidence, category, and rule
3. Auditor reviews — checks for vague language and missing evidence
4. Operator approves — status changes from `Draft` to `Accepted`
5. Add entry to Index table above
6. Commit to repo — orchestrator reads on next pipeline run

**Numbering:** sequential, never reuse numbers. Superseded ADRs stay in index with updated status.

**File location:** `docs/ADR-INDEX.md` (system ADRs) · `adr/ADR-NNN-slug.md` (pipeline-specific ADRs)

---

*GhostFactory · agenti.art · Agents Rule Tomorrow*
