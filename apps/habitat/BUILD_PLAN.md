# HABITAT — engineering and development roadmap

Owner specification: a housing intelligence platform, not merely a reporting dashboard. Repository boundary: all product code, algorithms, migrations, tests and documentation live in `apps/habitat/`. Other Test-apps applications remain independent.

## Release gates and current scope
The first release is an explicitly fictional seven-day pilot. The nine-step resident → secure evidence → engineering assessment → explanation → manager → actions → history → export → mobile journey is the first acceptance target. Implemented is not synonymous with deployed or independently verified. See VERIFICATION.md for actual evidence.

## Stage 1 — functioning investigation pilot (implemented; verification recorded separately)
1. Isolated Cloudflare Worker and D1; same-origin UI and API; no paid dependencies.
2. High-entropy role access keys stored only as hashes; expiring HttpOnly Secure SameSite cookies; org/property authorization on every data endpoint.
3. Synthetic workspace provisioning, manager multi-property view, assigned resident view.
4. Create a concern without measurements, or calculate from three contemporaneous readings. Missing readings never become invented inputs.
5. Private photographs, limited sizes and counts, digest, timestamps and role-checked retrieval.
6. Manager inspection/repair/review actions; resident notes and reopening; append-only application history.
7. JSON case/history export and simulation export; mobile forms, image resizing, clear failures.
8. Dew point, surface RH and uncertainty sensitivity; heat transfer, moisture balance and exact single-zone transient solution.
9. Current housing guidance with applicability caveats; no automated legal hazard classification or deadlines.
10. Local equation tests, independent numerical ODE comparison, real SQLite workflow tests, browser tests and live D1 verification.

## Stage 2 — safe real-user pilot (not implemented; required before personal data)
- Identify controller/operator, document lawful bases and processors; complete DPIA screening and any required assessment.
- Invite-only verified membership, strong authentication/recovery, session management and revocation, manager MFA, resident identity/tenancy checks. Never allow self-selected arbitrary manager roles.
- Rights requests, correction/deletion workflow, retention rules, export access logging, backups/restoration test, incident response and support ownership.
- Replace minimal JPEG validation with server-side decoding/re-encoding, pixel limits, malware checks and explicit original/derivative evidence provenance. Configure private object storage only if free access is verified; otherwise require approval.
- Penetration test including IDOR, cross-org access, cookie scope, CSRF, XSS, injection, abusive provisioning, concurrent writes and quota exhaustion. Harden storage reservation and report/action concurrency.
- WCAG 2.2 AA assessment: screen reader, keyboard, focus on route change, zoom, error summaries, low literacy and translated workflows. Physical Android/iOS testing and unstable-network recovery.
- Notify the assigned manager with verified delivery and retry/escalation. Real reporting must never imply monitoring that does not exist.
Acceptance: two real organisations fully isolated; resident cannot see another household; recovery and deletion tested; written operational/privacy approval; restore exercise succeeds.

## Stage 3 — inspection and repairs operations
- Structured inspections (location, extent, duration, recurrence, ingress checks, ventilation performance, sensor model/calibration and measurement time).
- Structured repair work orders: assignee, scope, due date, status, cost estimate, access appointments, completion evidence and resident feedback.
- Human-assessed hazard priority with rationale, vulnerability handling only where lawful/necessary, urgent escalation and alternative accommodation workflow.
- Jurisdiction/tenure-specific policy engine: versioned sources, effective dates, awareness-time records, business-day/holiday calendars, event deadlines, notices and overrides. Obtain housing-law review. Never call an automated outcome legally conclusive.
- Printable accessible case pack with evidence manifest, chronological history and provenance; bulk property filtering and portfolio prioritisation.
Acceptance: simulate missed appointment, recurrence, disputed completion, changed severity and overdue action without losing history.

## Stage 4 — engineering depth
- Component-by-component fabric model: U-values, areas, thermal bridges, measured/assumed provenance and ranges.
- Ventilation measurements, extract flow, infiltration uncertainty and explicit pressure/temperature dependencies.
- Multi-room RC network, hourly weather/solar and occupancy schedules; conservative moisture transport, buffering and phase change; validate against independent solvers and published benchmark cases.
- Correlated uncertainty and parameter sensitivity; show which additional measurement most reduces uncertainty. Keep model discrepancy distinct from instrument tolerance.
- Diagnostically separate condensation potential, water ingress, plumbing leaks and rising damp hypotheses. Human inspection determines cause; photos support records rather than automatic species/health labels.
Acceptance: conservation tests, step-size/stability checks, analytic limiting cases, benchmark fixtures with sources, blind measured-data validation and error distributions.

## Stage 5 — long-term digital twin
- Versioned building/zone/component graph, immutable measurement streams, timestamp/timezone quality, sensor provenance and consent.
- Time-varying boundary conditions, retrofit scenarios, calibration with held-out data, residual drift and model-version history.
- Explicit identifiability checks; do not fit more parameters than data supports. Predictions carry confidence/sensitivity and validity horizon.
- Organisation portfolio comparisons normalised for weather/occupancy, aggregate privacy controls, human prioritisation and feedback.
Acceptance: calibrated model outperforms baseline on held-out weeks, transparent uncertainty, reproducible snapshots, cross-property privacy controls.

## Stage 6 — sustainable operations
- Free-tier usage budgeting and graceful capacity limits before scaling. No paid upgrade without approval.
- Deployment rollback, migration/version ledger, offsite backup strategy, uptime/error monitoring without sensitive logs, scheduled retention verification.
- Security dependency maintenance and release evidence; routine authoritative-source review before legal policy changes.
- Commercial discovery with housing providers and resident organisations after useful pilot evidence, not a claim of compliance certification.

## Working rules
Never commit secrets, real images, tenant data or production dumps to this public repo. Keep AISO/Niches/Xplorer resources untouched. Use bridge access that is actually verified. A successful upload is a deployment, not proof that a user journey works. Mark blockers explicitly and maintain the verification record on each release.

## Continuation increment — 3 November 2026
Implemented printable case packs (including derivative evidence manifest) and manager-confirmed synthetic-workspace deletion with role/origin checks and session/key revocation. Thirteen local tests pass; see verification ledger for live status. These complete part of Stage 3 export and part of Stage 2 deletion work, but do not complete either stage or authorise personal data.
