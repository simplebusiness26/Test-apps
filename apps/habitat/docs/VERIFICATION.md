# Verification ledger

## 3 November 2026 — initial implementation
- Implemented: persistent report API, private role sessions, organisation/property checks, D1 schema, private image endpoints, actions/history/export, physics and single-zone scenario, mobile UI.
- Local: 11 Node tests passing against real in-memory SQLite. Includes equation fixtures, independently integrated transient ODE, input validation, role/isolation checks, repair flow, expiry/cascade deletion, photo storage/retrieval/limits and cross-org denial.
- Browser and live verification: recorded in subsequent release entry and bridge Actions logs. Do not infer live success from this entry.
- The local SQLite adapter is not the Cloudflare D1 runtime. A live browser test must establish D1 compatibility, cookies, image delivery and the deployed user journey.
- Not independently field-validated; no physical-device or professional security/accessibility review. Synthetic pilot only.
