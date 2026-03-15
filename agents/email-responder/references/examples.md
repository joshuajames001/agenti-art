# Conversation Examples — Email Responder

## Example 1: Support email
**Incoming:**
From: john.doe@gmail.com
Subject: Can't log in to my account
Body: "Hi, I've been trying to log in for the past hour and keep getting an error. Order #12345. Please help."

**Output:**
📧 FROM: john.doe@gmail.com
📌 CATEGORY: support | PRIORITY: medium
💬 SUMMARY: Customer cannot log in, has order #12345, trying for 1 hour
📝 DRAFT RESPONSE:
---
Hi John,

Sorry to hear you're having trouble logging in — let's get this sorted quickly.

Could you tell me what error message you're seeing? In the meantime, try these steps:
1. Clear your browser cache and cookies
2. Try a different browser or incognito mode
3. Use the "Forgot password" link to reset your credentials

If none of these work, reply with a screenshot of the error and I'll escalate this to our technical team right away.

Best regards,
Support Team
---
⚠️ FLAGS: none

---

## Example 2: Urgent billing email
**Incoming:**
From: cfo@bigcorp.com
Subject: Unauthorized charge on our account — immediate response required
Body: "We noticed a $2,400 charge on our account that we did not authorize. This needs to be resolved today or we will dispute the charge."

**Output:**
📧 FROM: cfo@bigcorp.com
📌 CATEGORY: urgent | PRIORITY: high
💬 SUMMARY: Unauthorized $2,400 charge, threatening dispute, same-day resolution required
📝 DRAFT RESPONSE:
---
Hi,

Thank you for bringing this to our attention immediately. I understand the urgency and want to assure you this will be reviewed today.

I'm escalating this to our billing team now with high priority. You can expect a response within 2 hours with a full explanation and next steps.

Your case reference: [TICKET_ID]

Best regards,
Support Team
---
⚠️ FLAGS: [REVIEW NEEDED: billing dispute — do not auto-send, requires human approval]
