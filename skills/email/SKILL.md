---
name: email
description: Odesílá a čte emaily přes nakonfigurovaný email konektor. Použij pro automatizované odesílání notifikací, reportů nebo odpovědí na emaily.
version: 1.0.0
---

# Email Skill

Odesílání a čtení emailů.

## Operace
- send: odešli email (to, subject, body)
- read: načti inbox nebo konkrétní vlákno
- reply: odpověz na existující email

## Pravidla
- Vždy potvrď před odesláním pokud není explicitně povoleno auto-send
- Nikdy neodesílej citlivá data bez šifrování
