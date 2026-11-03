# HABITAT
Housing intelligence research pilot: a working resident-to-manager investigation journey backed by Cloudflare Workers and an isolated D1 database.

**Synthetic data only. Not a production resident service.** Access keys are credentials, not verified identities. No email, account recovery or emergency monitoring is provided.

## Run
Node 24 recommended. All commands run in `apps/habitat`.

```
npm ci
npm run build
npm test
npm run dev
```

Visit http://localhost:8787. For browser checks, install Chromium (`npx playwright install chromium`) and run `npm run test:browser` while the server is running. `HABITAT_URL` selects a deployed target. Browser tests create only synthetic data.

## Product
- Private seven-day demo workspace with separate resident and manager access keys.
- Two fictional properties; resident can access only their assigned home, manager both.
- Reports with optional measurements, deterministic engineering results and uncertainty.
- Private JPEG evidence stored in D1; browser re-encodes images, at most 3 × 180 kB/report.
- Inspection, repair planning, completion, review, reopening and chronological history.
- Authenticated JSON report/history export, and scenario exports.
- Single-zone thermal and moisture scenario with a 24-hour graph.

## Architecture
`src/worker.js` is the shared API and security boundary; `src/engineering.js` contains pure calculations. `public/` is the mobile web UI. `scripts/build.mjs` packages these as three Worker ES modules, with no runtime npm dependency. `migrations/0001.sql` owns the schema. `tests/db.js` runs the same query interface against real SQLite locally; live tests are required to verify D1 semantics.

D1 binary evidence is deliberately a small-pilot compromise, not the proposed long-term object store. It avoids R2 subscription/card requirements and public image URLs. Application caps and seven-day cleanup reduce storage, but account-wide free-tier quotas still apply. No paid service is provisioned.

## Deployment
The existing AISO bridge is GitHub Actions in `simplebusiness26/agentCart`, where Cloudflare credentials already exist. A dedicated `bridge/habitat` branch hosts only a thin launcher; it checks out an immutable Test-apps source SHA and runs this app's deployment script. No AISO production branch, database, Worker or existing workflow is changed.

`scripts/deploy.mjs` restricts mutations to Worker `habitat-pilot` and D1 `habitat-pilot`; it never prints credentials. It resolves the account's actual workers.dev subdomain, applies idempotent schema, uploads modules, enables the subdomain, installs cleanup cron, and verifies the deployed source hash. Re-deploy by pinning the reviewed new SHA in the bridge launcher. Source changes do not silently auto-deploy.

See [BUILD_PLAN.md](BUILD_PLAN.md), [engineering](docs/ENGINEERING.md), [privacy](docs/PRIVACY.md), [housing requirements](docs/HOUSING.md) and [verification](docs/VERIFICATION.md).
