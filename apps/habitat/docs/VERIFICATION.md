# Verification ledger

## 3 November 2026 — initial implementation
- Implemented: persistent report API, private role sessions, organisation/property checks, D1 schema, private image endpoints, actions/history/export, physics and single-zone scenario, mobile UI.
- Local: 11 Node tests passing against real in-memory SQLite. Includes equation fixtures, independently integrated transient ODE, input validation, role/isolation checks, repair flow, expiry/cascade deletion, photo storage/retrieval/limits and cross-org denial.
- Browser and live verification: recorded in subsequent release entry and bridge Actions logs. Do not infer live success from this entry.
- The local SQLite adapter is not the Cloudflare D1 runtime. A live browser test must establish D1 compatibility, cookies, image delivery and the deployed user journey.
- Not independently field-validated; no physical-device or professional security/accessibility review. Synthetic pilot only.

Local Playwright passed the complete journey, real generated-image upload, unauthorized image denial, role change, export and simulation at widths 320/390/430/1280. Initial bridge run 41571913239 deployed source 7abd614 but failed adding a Cron Trigger (10072), so live browser checks were skipped. Corrected deployment uses immediate access expiry plus provisioning-triggered cleanup; no other app cron was altered.

## Live verification evidence
- Run [41572110669](https://github.com/simplebusiness26/agentCart/actions/runs/41572110669), source `f6f8eb27c1b486920d7c6a1bc41af1872b2c65a2`: deployment and live mobile journey PASSED. Worker upload version `76202f3e89204b108894dc051667f072`. Job status was failure only because GitHub artifact storage quota prevented screenshot upload. No user data or other artifacts were deleted to make room.
- Live Playwright exercised: create workspace, resident key login, write report, persisted calculation, browser-generated image re-encoding/upload/read, anonymous image denial, manager login, inspection/repair/review, resident case export, simulation, widths 320/390/430/1280, zero page exceptions.
- Direct workspace network attempts to execute the live test were blocked by execution-network responses; successful live browser verification ran on the GitHub bridge runner, not the local environment. The public homepage was also inspected in the cloud browser.
- Latest local suite: 12 passing tests, including an independent higher-accuracy vapour-pressure equation inverted by bisection at 15 conditions (<0.1°C dew-point difference).

Run 41572295556: deployment and mobile browser verification passed again for source bd5555e. The additional Python HTTP-client test received a non-JSON upstream 403 before reaching application logic; it is replaced by equivalent checks in independent real browser contexts. This does not count as a passed isolation check.

## Continuation — 3 November 2026
The previous run 41572510726 deployed c654e01 but its browser test failed at the immediate image `complete` assertion, before isolation checks. Image verification now awaits successful decoding and still rejects corrupt/unavailable images.

Implemented in this continuation:
- Printable case pack with measurements, model limitations, history and private derivative-image SHA-256 manifest; browser print/save-PDF after images decode.
- Explicit manager-confirmed deletion of the current synthetic workspace; cascading reports/photos/history/identities/sessions, clearing credentials from UI memory on logout/deletion.
- Browser journey covers separate-organisation denials, printable evidence pack and deletion; no test credentials are logged or committed.
- Local build and 13 tests pass. New deletion test covers resident denial, missing confirmation, foreign-origin rejection, cascade, old-key/session revocation and survival of a second organisation.
Live verification for this change is pending the isolated bridge run. Real-user release gates and automatic retention limitations remain in effect.


## Verified continuation release
- Final source `cc7c42b980e72add00d1ac3db90e7eb04dcfcc5e`, deployed via isolated bridge run [41574537130](https://github.com/simplebusiness26/agentCart/actions/runs/41574537130): **SUCCESS**, all steps green.
- Live URL: https://habitat-pilot.ai-seo.workers.dev/
- Bridge build and all 13 Node/SQLite/engineering tests passed; Cloudflare deployment verified live D1 health and exact source hash.
- Live Chromium journey passed: resident login/report/calculation, generated image re-encoding/upload/decoded retrieval, anonymous denial, separate-organisation report/export/image denial, resident denial of manager action, manager inspection/repair/review, JSON export, printable case pack with images/digests, print stylesheet and PDF rendering, simulation, manager-confirmed workspace deletion and revoked session.
- Report and case-pack layouts checked at 320/390/430/1280 pixels. No page exceptions. Physical Android/iOS, print-destination UI and accessibility audit remain unverified.
- The initial continuation run 41574226939 proved live isolation but found the new case-pack handler in the wrong scope; corrected by 89543ce and verified by both 41574474744 and the final run. No failures were suppressed.
- No paid dependency added; only dedicated HABITAT Worker/D1 and the existing isolated bridge launcher changed. Artifact upload remains omitted due to existing GitHub quota.
- Still synthetic-only: verified identity/recovery/MFA, server-side image sanitisation, guaranteed automatic retention cleanup, operator/legal/privacy review, notifications, restore tests and field-calibrated multi-room digital twin remain incomplete. Manual synthetic deletion is not a complete production retention programme.


## Homepage explanation release — 3 November 2026
Source `96ab1f2d116c03d55f8c9dbfe9c9a1ee7e11c872` deployed and verified by bridge run [41575257805](https://github.com/simplebusiness26/agentCart/actions/runs/41575257805): SUCCESS. Expanded benefits, current use cases, intended audiences, future roadmap and five-step demo/access-key walkthrough. No standard signup is claimed. All 13 automated tests and full live browser journey passed, with homepage overflow checks at 320/390/430/1280 pixels. First run stopped on an ambiguous text locator introduced by quoting the login label in the walkthrough; exact control matching corrected it without suppressing an application failure.


## V2 foundation — 4 November 2026
On isolated `habitat-v2-foundation`, rewrote roadmap and added standalone priority assessment domain logic with tests. Local Node 24 build and all 15 Node/SQLite tests pass (13 existing, 2 new). The new module is deliberately not wired into the Worker, D1 or UI; these tests do not prove authorisation of a real endpoint. Source files were fetched through GitHub connector; no live deployment, browser test, Cloudflare check or V2 end-to-end test performed. Existing pilot remains synthetic-only. The model is not a legal rules engine and the role string requires server-side authorisation before integration.
