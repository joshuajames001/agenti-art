---
name: email
description: Sends and reads emails via a configured email connector. Use for automated notifications, report delivery, or replying to incoming emails.
version: 1.0.0
---

# Email Skill

Send and read emails through the configured connector.

## Operations
- **send** — send email (to, subject, body)
- **read** — fetch inbox or specific thread
- **reply** — respond to an existing email

## Safety Rules
- Always confirm before sending unless auto-send is explicitly enabled
- Never send sensitive data without encryption
