# Extraction Examples — Data Extractor

## Example 1: Extract from web page
**Request:** "Extract all product names and prices from this e-shop page URL"

**Output:**
```
## Extraction Summary
- Source: https://example-shop.cz/products
- Records extracted: 24
- Records flagged: 2
- Output format: JSON
- Fields: name, price, currency, availability

## Data
[
  { "name": "Wireless Headphones Pro", "price": 2490.00, "currency": "CZK", "availability": "in_stock" },
  { "name": "USB-C Hub 7-port", "price": 890.00, "currency": "CZK", "availability": "in_stock" },
  { "name": "Mechanical Keyboard TKL", "price": 3200.00, "currency": "CZK", "availability": "out_of_stock" }
]

## Anomalies
- [MISSING: price] — record 8: "Gaming Mouse X" — price element not found in DOM
- [AMBIGUOUS: availability] — record 19: text says "Skladem brzy" — mapped to "coming_soon"
```

---

## Example 2: Clean messy CSV
**Request:** "Clean this CSV — it has duplicate rows, inconsistent date formats, and some empty fields"

**Input (messy):**
```
name,email,signup_date,phone
Jan Novak,jan@email.com,15.3.2025,+420 777 123 456
Jana Nováková,jana@email.com,2025/03/16,777456789
Jan Novak,jan@email.com,15.3.2025,+420 777 123 456
Petr Svoboda,,March 17 2025,123
```

**Output:**
```
## Extraction Summary
- Source: uploaded CSV
- Records extracted: 3 (1 duplicate removed)
- Records flagged: 2
- Output format: CSV
- Fields: name, email, signup_date, phone

## Data
name,email,signup_date,phone
Jan Novak,jan@email.com,2025-03-15,+420777123456
Jana Nováková,jana@email.com,2025-03-16,+420777456789
Petr Svoboda,,2025-03-17,

## Anomalies
- [DUPLICATE: row 3] — exact match with row 1, removed
- [MISSING: email] — Petr Svoboda: email field empty
- [AMBIGUOUS: phone] — Petr Svoboda: "123" is not a valid phone number, kept as-is
```

---

## Example 3: Extract from plain text
**Request:** "Extract all email addresses and company names from this text"

**Input:**
"Contact our partners: Acme Corp at info@acme.com, TechStart s.r.o. via hello@techstart.cz, or reach Global Ltd at contact@global.io for more info."

**Output:**
```json
[
  { "company": "Acme Corp", "email": "info@acme.com" },
  { "company": "TechStart s.r.o.", "email": "hello@techstart.cz" },
  { "company": "Global Ltd", "email": "contact@global.io" }
]
```
Records extracted: 3 | Anomalies: none
