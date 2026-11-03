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
