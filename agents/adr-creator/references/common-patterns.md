# Common ADR Patterns for Agent Pipelines

## Pattern 1: Approval Gate
Use when: agent performs irreversible actions (send, delete, publish)

```
{agent} MUST NOT perform {action} without explicit [APPROVED] flag
set by a human operator or auditor agent.
```

## Pattern 2: Data Boundary
Use when: agent reads/writes files or databases

```
{agent} MUST NOT access files outside {allowed_directory}
{agent} MUST NOT modify source data — output to separate directory only
```

## Pattern 3: Rate Limit
Use when: agent calls external APIs or performs repeated actions

```
{agent} MUST NOT exceed {n} calls to {service} per {time_window}
On rate limit hit: WAIT {backoff} seconds before retry
Max retries: {n} — then ESCALATE to orchestrator
```

## Pattern 4: Model Budget
Use when: cost control is important

```
{agent} MUST use model: fast for tasks classified as: {simple_categories}
{agent} MUST use model: powerful ONLY for tasks classified as: {complex_categories}
Total pipeline token budget: MUST NOT exceed {n} tokens
```

## Pattern 5: Escalation Chain
Use when: agent handles sensitive categories

```
{agent} MUST escalate to human when:
- category IN {sensitive_list}
- confidence < {threshold}
- retry_count > {max_retries}
Escalation timeout: {n} minutes → auto-escalate to senior agent
```

## Pattern 6: Audit Trail
Use when: compliance or legal requirements

```
{agent} MUST log every {action} to audit trail BEFORE execution
Log format: {timestamp} | {agent} | {action} | {input_hash} | {output_hash}
Audit log MUST NOT be modified or deleted for {retention_period}
```

## Pattern 7: Conflict Prevention
Use when: multiple agents access shared resources

```
{agent_A} and {agent_B} MUST NOT write to {shared_resource} simultaneously
Locking mechanism: file lock on {resource}.lock
Lock timeout: {n} seconds → WARN orchestrator
```
