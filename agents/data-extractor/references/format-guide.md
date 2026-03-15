# Data Format Reference Guide

## Date Normalization
Always convert to ISO 8601: YYYY-MM-DD
- "15.3.2025" → "2025-03-15"
- "March 15, 2025" → "2025-03-15"
- "15/03/25" → "2025-03-15"
- Ambiguous (01/02/03) → flag as [AMBIGUOUS: date]

## Phone Normalization (Czech default)
Target format: E.164 (+420XXXXXXXXX)
- "777 123 456" → "+420777123456"
- "00420777123456" → "+420777123456"
- "123" → flag as [AMBIGUOUS: phone]

## Currency Normalization
Split into numeric value + currency code:
- "2 490 Kč" → { "value": 2490.00, "currency": "CZK" }
- "$19.99" → { "value": 19.99, "currency": "USD" }
- "€1.200" → { "value": 1200.00, "currency": "EUR" } (note: European decimal)

## Boolean Normalization
- "yes", "ano", "true", "1", "✓" → true
- "no", "ne", "false", "0", "✗" → false
- Anything else → flag as [AMBIGUOUS: boolean]

## Encoding Issues
- Replace common Windows-1250 artifacts:
  - "Ä" → "á", "Ö" → "ó", "Ü" → "ú"
- Flag unresolvable encoding errors as [AMBIGUOUS: encoding]
