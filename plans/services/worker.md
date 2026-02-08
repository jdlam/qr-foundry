# QR Foundry Worker — Implementation Plan

**Repo:** `qr-foundry-worker`
**Service:** Redirect Worker at `qrfo.link`

## Overview

This plan covers the implementation of the QR Foundry redirect Worker from initial setup through production deployment. Work is broken into phases that each result in a deployable, testable milestone.

For system-wide architecture and how this service fits with the Billing API, desktop app, and web app, see [`ARCHITECTURE.md`](../architecture/ARCHITECTURE.md).

---

## Phase 1: Project Scaffolding & Dev Environment

**Goal:** Repo is set up, tooling works, local dev runs, quality gates are in place, CI runs on PRs, and releases are managed independently from merging.

### Automated (done in IDE)

- [x] Initialize git repo
- [x] Replace ESLint + Prettier with **Biome** as the sole linter/formatter
  - [x] Remove `eslint`, `prettier`, `@typescript-eslint/*`, `eslint-config-prettier` dev dependencies
  - [x] Install `@biomejs/biome`
  - [x] Create `biome.json` config (double quotes, semicolons, 2-space indent, trailing commas, 80-char line width)
  - [x] Remove `.prettierrc` (replaced by biome.json)
  - [x] Update `package.json` scripts (`lint`, `lint:fix`, `format`, `format:check`)
  - [x] Update `lint-staged` config to use `biome check --write`
- [x] Fix all source files to pass Biome lint and format checks
- [x] Set up Husky pre-commit hooks
  - [x] Configure pre-commit hook: `biome check` -> `typecheck` -> `test`
  - [x] Configure commit-msg hook: conventional commit validation via commitlint
- [x] Set up Vitest and write unit tests for existing code
  - [x] `src/utils.test.ts` — short code generation, URL validation, expiry, auth, response helpers
  - [x] `src/api.test.ts` — CRUD operations, auth failures, validation errors, ownership checks
  - [x] `src/index.test.ts` — redirect paths (active, paused, expired, missing, root), health check, API routing
  - [x] Achieve >90% line/function coverage, >85% branch coverage
- [x] Verify `npm run lint`, `npm run typecheck`, and `npm run test` all pass
- [x] Set up GitHub Actions
  - [x] **CI workflow** (`ci.yml`): lint, typecheck, test — runs on every push and PR
  - [x] **Deploy workflow** (`deploy.yml`): deploys to Cloudflare Workers — triggered only by GitHub Releases (tags), independent from PR merges
- [x] Update `CLAUDE.md` with instruction to keep PLAN.md updated as work progresses

### Manual steps (requires action outside IDE)

- [x] **Push repo to GitHub** — `git remote add origin <url> && git push -u origin main`
- [x] **Create Cloudflare KV namespaces** — Go to Cloudflare dashboard -> Workers & Pages -> KV -> Create:
  - Production namespace: `qr-foundry-codes`
  - Preview namespace: `qr-foundry-codes-preview`
  - Dev namespace: `qr-foundry-codes-dev`
  - Update `wrangler.toml` with the real namespace IDs
- [x] **Set API_TOKEN secret** — `wrangler secret put API_TOKEN` (enter a strong random token)
- [x] **Add GitHub Actions secrets** — In the repo Settings -> Secrets and variables -> Actions:
  - `CLOUDFLARE_API_TOKEN` — API token with Workers permissions
  - `CLOUDFLARE_ACCOUNT_ID` — Your Cloudflare account ID
- [x] **Configure branch protection on `main`** — Settings -> Branches -> Add rule:
  - Require status checks (CI) to pass before merging
  - Require PR reviews (optional but recommended)
- [x] **Verify `wrangler dev` serves health check** — Run `npm run dev` and confirm `localhost:8787/health` returns 200

**Exit criteria:** A commit with a deliberate lint error is blocked by the pre-commit hook. CI runs on PRs. Deploys happen only when a GitHub Release is created. `wrangler dev` serves a health check at `localhost:8787/health`.

---

## Phase 2: Core Redirect Flow

**Goal:** A dynamic QR code can be created via the API and scanned to redirect.

### Automated (done in IDE)

- [x] Implement and test `generateShortCode` — verify character set, length, randomness
  - 7-char codes from 55-char alphabet (excludes ambiguous: 0, O, l, 1, I)
  - Tests: length, character set, uniqueness across 20+ generations
- [x] Implement and test `isValidUrl` — valid protocols, reject javascript:, edge cases
  - Allows http, https, mailto, tel; rejects javascript:, ftp:, data:, invalid strings
- [x] Implement and test `isExpired` — active codes, expired codes, codes with no expiry
- [x] Implement KV read in the redirect handler (`GET /:shortCode`)
  - [x] Active code -> 302 with correct Location header
  - [x] Paused code -> branded 404 page
  - [x] Expired code -> branded 404 page, status updated in KV via waitUntil
  - [x] Missing code -> branded 404 page
  - [x] Malformed KV data -> branded 404 page (graceful JSON parse failure)
  - [x] Root path (`/`) -> redirect to marketing site
  - [x] Nested paths -> redirect to marketing site
- [x] Write tests for every redirect branch (`src/index.test.ts`)
- [x] Test coverage: `utils.ts` at 100%, `index.ts` at 97%+ lines, 85% branches

### Manual steps (requires action outside IDE)

- [x] **Manual test with wrangler dev** — Run `npm run dev`, create a KV entry via wrangler CLI, hit the local dev server, confirm redirect works

**Exit criteria:** All redirect paths return correct status codes and headers. Test coverage >90% on `utils.ts` and redirect handler.

---

## Phase 3: CRUD API

**Goal:** The desktop app can create, list, read, update, and delete dynamic codes.

### Automated (done in IDE)

- [x] Implement `authenticateRequest` and test auth failure/success paths
  - Bearer token validation, missing header, wrong token, non-Bearer scheme
- [x] Implement `POST /api/codes` (create)
  - [x] Generated short code path
  - [x] Custom short code path with availability check
  - [x] Validation: missing URL, invalid URL, invalid custom code format, invalid JSON
  - [x] Collision retry logic (up to 5 attempts)
  - [x] Custom code conflict -> 409
- [x] Implement `GET /api/codes` (list) with owner filtering
  - Filters by ownerId metadata, sorts newest first
- [x] Implement `GET /api/codes/:code` (get single) with ownership check
- [x] Implement `PUT /api/codes/:code` (update)
  - [x] Partial updates (destination, status, label, expiry, password)
  - [x] Validation on updated fields (URL validation)
  - [x] Ownership check (returns 404 for wrong owner, not 403)
  - [x] Null to clear optional fields (expiresAt, password)
  - [x] Updates `updatedAt` timestamp
- [x] Implement `DELETE /api/codes/:code` with ownership check
- [x] Implement CORS preflight handler (OPTIONS -> 204 with CORS headers)
- [x] Write unit tests for every handler (`src/api.test.ts` — 34 tests)
  - Success paths, validation errors, auth failures, 404s, ownership boundaries, method not allowed
- [x] Test coverage: `api.ts` at 97%+ lines, 97%+ branches

### Manual steps (requires action outside IDE)

- [ ] **Manual CRUD test local** — Run `npm run dev`, then test the full cycle via ./scripts/test-api.sh localhost:8787 <dev_api_token>
  - Token found in `.dev.env`
- [ ] **Manual CRUD test remote** — Run `npm run dev`, then test the full cycle via ./scripts/test-api.sh qr-foundry-worker-dev.jonlam92.workers.dev <dev_api_token>
  - Token found in `.env`

**Exit criteria:** All API endpoints return correct responses for valid and invalid inputs. No endpoint leaks data across owners.

---

## Phase 4: Quota Enforcement & Status Management

**Goal:** Users have a code limit enforced by the Worker, can deactivate/reactivate codes, and can query usage counts. Only active codes count against the quota — pausing a code frees a slot.

The Billing API (see [`billing-api.md`](billing-api.md)) is responsible for writing `_quota::` records to Worker KV after purchase/subscription events. The Worker only reads and enforces these limits. See [`ARCHITECTURE.md`](ARCHITECTURE.md) for the full quota flow.

### Automated (done in IDE)

**Step 1: Types and constants**
- [x] Add `UserQuota` interface to `src/types.ts` — `{ ownerId, maxCodes, currentCount, updatedAt }`
- [x] Add `UsageResponse` interface to `src/types.ts` — `{ ownerId, limit, total, active, paused, expired, remaining }`
- [x] Add `DEFAULT_MAX_CODES` to the `Env` interface in `src/types.ts`
- [x] Add `QUOTA_KEY_PREFIX` constant (`"_quota::"`) to `src/utils.ts`
- [x] Add `DEFAULT_MAX_CODES` to `wrangler.toml` vars for each environment (production: `"50"`, preview: `"50"`, dev: `"100"`)
- [x] Update `createMockEnv` in test files to include `DEFAULT_MAX_CODES`

**Step 2: `getOrCreateQuota` helper**
- [x] Implement `getOrCreateQuota(env, ownerId)` in `src/utils.ts`
  - Reads `_quota::${ownerId}` from KV
  - If found, returns parsed `UserQuota`
  - If not found (first call for this user), scans KV list to count existing codes for the owner, creates a `UserQuota` with `maxCodes = parseInt(env.DEFAULT_MAX_CODES) || 50` and `currentCount` from the scan, writes it to KV with `{ type: "quota" }` metadata
- [x] Write unit tests: bootstrap with existing codes, bootstrap with zero codes, read existing quota, skip `_quota::` keys during count, default max codes fallback

**Step 3: Status filtering on `GET /api/codes`**
- [x] Modify `listCodes` to accept `Request` parameter (to read query params)
- [x] Add optional `?status=active|paused|expired` query parameter filtering
  - Filter using KV metadata `status` field (avoids deserializing records that don't match)
  - Return 400 for invalid status values
  - No filter = return all (backward compatible)
- [x] Add `_quota::` key skip to the list loop (defensive — quota keys have no `ownerId` in metadata)
- [x] Update call site in `handleApiRequest` to pass `request` to `listCodes`
- [x] Write tests: filter by each status, no filter returns all, invalid status returns 400, quota keys excluded

**Step 4: Cap enforcement on `POST /api/codes`**
- [x] Before code generation, call `getOrCreateQuota` and count active codes for the owner
- [x] If active count >= `maxCodes`, return 403 with message: "Code limit reached. You have N of M allowed active codes. Pause or delete unused codes, or upgrade your plan."
- [x] After successful KV write, increment `currentCount` and write updated quota
- [x] Write tests: create under limit succeeds, create at limit returns 403, counter increments after create

**Step 5: Cap check on `PUT /api/codes/:code` (reactivation)**
- [x] When `body.status` changes to `"active"` from `"paused"` or `"expired"`, check quota
- [x] If active count >= `maxCodes`, return 403 with message: "Code limit reached. Cannot reactivate — you have N of M allowed active codes."
- [x] No cap check needed when pausing (freeing a slot) or for non-status updates
- [x] Write tests: reactivate under limit succeeds, reactivate at limit returns 403, pause always succeeds

**Step 6: Counter update on `DELETE /api/codes/:code`**
- [x] After successful KV delete, decrement `currentCount` in quota (only if the deleted code was active)
- [x] Floor at 0 with `Math.max(0, ...)` to handle drift
- [x] Write tests: counter decrements on delete, does not decrement for paused code

**Step 7: `GET /api/usage` endpoint**
- [x] Implement `getUsage(env, ownerId)` handler in `src/api.ts`
  - Scans KV list metadata, tallies by status (skip `_quota::` keys)
  - Returns `UsageResponse` with `{ ownerId, limit, total, active, paused, expired, remaining }`
  - `remaining = limit - active` (only active codes count against quota)
  - Self-healing: if cached `currentCount` in quota differs from computed active count, correct it via inline write
- [x] Add `/api/usage` routing in `handleApiRequest` (before the `/api/codes` regex)
- [x] Write tests: correct counts with mixed statuses, empty user, remaining floors at 0, self-healing corrects drift, 405 for non-GET

**Step 8: Integration verification**
- [x] All tests pass (`npm run test`) — 107 tests
- [x] Type checks pass (`npm run typecheck`)
- [x] Lint passes (`npm run lint`)
- [ ] Manual test with `wrangler dev`: create codes up to the limit, verify 403, pause one, create succeeds, check `/api/usage`

### Manual steps (requires action outside IDE)

- [ ] **Set `DEFAULT_MAX_CODES` for deployed environments** — Verify the var is picked up after next deploy (or set via `wrangler secret` if you prefer secrets over vars)
- [ ] **Seed a test quota record** — For manual testing, use `wrangler kv:key put "_quota::default" '{"ownerId":"default","maxCodes":5,"currentCount":0,"updatedAt":"..."}' --binding QR_CODES --env dev` to test with a low limit

### Design decisions

- **Only active codes count against the quota.** Pausing a code frees a slot. Reactivating consumes one. Deleting also frees a slot (if the code was active).
- **Quotas, not plans.** The Worker enforces a numeric `maxCodes` limit. The Billing API (a separate service) is responsible for setting that number based on the user's plan or purchases.
- **`_quota::` prefix in the same KV namespace.** Avoids creating new KV namespaces per environment. Safe because short codes can never start with `_` or contain `:`.
- **Lazy quota bootstrap.** The first API call that needs a quota auto-creates the record by scanning KV. After that, reads are O(1).
- **Race conditions accepted for v1.** Two concurrent creates could both pass the cap check. At 25-50 code caps from a single desktop app, this is a ~1 code overshoot at worst. The self-healing recount in `GET /api/usage` corrects drift.
- **403 for cap exceeded, not 429.** This is a policy/authorization limit, not a rate limit.

**Exit criteria:** Creating a code at the limit returns 403. Pausing a code frees a slot. `GET /api/usage` returns accurate counts. Reactivating at the limit is blocked. All tests pass with >90% coverage on new code.

---

## Phase 5: Scan Analytics

**Goal:** Every scan is logged to Analytics Engine, and users can query scan data — where scans came from, when they happened, and how many occurred in a given time frame — through an authenticated API endpoint.

### Automated (done in IDE)

**Step 1: Mark existing write-side as complete**
- [x] Implement `logScanEvent` using Analytics Engine `writeDataPoint`
  - [x] Capture: short code, country, city, user agent, referer
  - [x] Non-blocking via `ctx.waitUntil` — analytics failure never affects redirect
- [x] Write tests verifying `waitUntil` is called on successful redirect

**Step 2: Types for analytics responses**
- [x] Add `ScanAnalyticsResponse` interface to `src/types.ts` (shortCode, period, totalScans, scansOverTime, topCountries, topCities, topReferers)
- [x] Add `ScanAnalyticsSummary` interface for the overview across all codes (period, totalScans, scansOverTime, topCodes with labels, topCountries)
- [x] Add `AnalyticsEngineResponse` interface for raw SQL API responses
- [x] Add `CLOUDFLARE_ACCOUNT_ID`, `ANALYTICS_API_TOKEN`, `ANALYTICS_DATASET` to the `Env` interface
- [x] Replace unused `ScanEvent` and `CodeAnalytics` types

**Step 3: Analytics query helper**
- [x] Implement `queryAnalyticsEngine(env, sql)` helper in `src/analytics.ts`
  - Uses Cloudflare Analytics Engine **SQL API** (not GraphQL — updated from original plan)
  - POSTs SQL to `https://api.cloudflare.com/client/v4/accounts/${accountId}/analytics_engine/sql`
  - Requires `ANALYTICS_API_TOKEN` secret with Analytics Engine read permissions
  - Returns parsed `AnalyticsEngineResponse`
- [x] Input validation helpers: `isValidDateParam`, `isValidGranularity`, `toSqlDate`, `isValidShortCode`
- [x] SQL query builders for per-code and overview queries (all inputs pre-validated, blob columns hardcoded)
- [x] Response parsers: `parseTotal`, `parseTimeSeries`, `parseRankedItems`
- [x] Analytics Engine blob index mapping:
  - `blob1` = shortCode, `blob2` = country, `blob3` = city, `blob4` = userAgent, `blob5` = referer
  - `double1` = 1 (scan count), `index1` = shortCode (for efficient filtering)

**Step 4: `GET /api/analytics/:code` endpoint (per-code)**
- [x] Implement `getCodeAnalytics(request, env, shortCode, ownerId)` handler
  - Validates code format, ownership via KV, and query params (start, end, granularity)
  - Runs 5 SQL queries in parallel via `Promise.all`
  - Returns `ScanAnalyticsResponse` with `Cache-Control: public, max-age=300`
  - Returns 400 (bad params), 404 (not found / wrong owner), 502 (query failed)
- [x] Add `/api/analytics/:code` routing in `handleApiRequest`
- [x] Write tests: 12 tests covering valid shape, defaults, ownership, missing code, invalid params, 502, SQL verification

**Step 5: `GET /api/analytics` endpoint (overview across all codes)**
- [x] Implement `getAnalyticsOverview(request, env, ownerId)` handler
  - Lists owner's codes from KV (excludes `_quota::` keys)
  - Returns empty analytics (not error) for owners with zero codes
  - Reads labels from KV records and attaches to topCodes
  - Runs 4 SQL queries in parallel via `Promise.all`
  - Returns `ScanAnalyticsSummary` with `Cache-Control: public, max-age=600`
- [x] Add `/api/analytics` routing in `handleApiRequest`
- [x] Write tests: 9 tests covering empty result, labels, ownership filtering, quota key exclusion, 502

**Step 6: Caching**
- [x] Add `Cache-Control` headers to analytics responses
  - Per-code endpoint: `public, max-age=300` (5 minutes)
  - Overview endpoint: `public, max-age=600` (10 minutes)
- [x] Added optional `extraHeaders` parameter to `jsonResponse` helper for Cache-Control support

**Step 7: Integration verification**
- [x] All 133 tests pass (`npm run test`) — 107 existing + 26 new
- [x] Type checks pass (`npm run typecheck`)
- [x] Lint passes (`npm run lint`)
- [x] Added route tests in `api.test.ts`: GET/POST /api/analytics and /api/analytics/:code
- [ ] Manual test with `wrangler dev`: create codes, generate scans, query analytics, verify response shapes and date filtering

### Manual steps (requires action outside IDE)

- [ ] **Create Cloudflare API token** with "Account Analytics Read" permission
- [ ] **Set `ANALYTICS_API_TOKEN` secret** — `wrangler secret put ANALYTICS_API_TOKEN --env production/preview/dev`
- [ ] **Replace `<account_id>` placeholder** in `wrangler.toml` with your real Cloudflare account ID
- [ ] **Generate test scan data** — Hit redirect URLs to populate Analytics Engine with queryable data
- [ ] **Test endpoints with `wrangler dev`** — Verify analytics responses return correctly

### Design decisions

- **SQL API instead of GraphQL.** The SQL API is the current Cloudflare standard for querying Analytics Engine. Simpler than GraphQL, supports `SUM(_sample_interval)` for accurate sampled counts.
- **Ownership check via KV, not Analytics Engine.** The endpoint first verifies the code belongs to the owner (fast KV lookup), then queries Analytics Engine. This prevents users from querying analytics for codes they don't own.
- **Time range required (with sensible defaults).** Unbounded queries over all historical data could be slow and expensive. Default to last 30 days.
- **Separate per-code and overview endpoints.** The desktop app needs both: a detail view for individual codes and a dashboard summarizing all codes.
- **Cache analytics responses.** Scan data doesn't need to be real-time. A 5-minute cache drastically reduces API calls for users refreshing dashboards.
- **SQL injection safety.** Dates validated with strict ISO regex + Date parse, granularity is an exact allowlist, short codes validated by KV ownership check + regex, blob columns are hardcoded string literals.

**Exit criteria:** `GET /api/analytics/:code` returns scan counts, geographic breakdown, and timeline for a given code and time range. `GET /api/analytics` returns an aggregate overview. Both endpoints enforce ownership and return cached responses.

---

## Phase 6: Infrastructure & Deployment

**Goal:** Production deployment with custom domain and CI/CD.

> **Note:** CI/CD pipeline (GitHub Actions for lint, typecheck, test, deploy) was set up in Phase 1. This phase covers the remaining infrastructure items.

- [ ] Register or configure `qrfo.link` custom domain
- [ ] Add custom domain route in Cloudflare dashboard pointing to the Worker
- [ ] Deploy to production: `npm run deploy`
- [ ] Smoke test production endpoints
  - [ ] `qrfo.link/health` returns 200
  - [ ] Create a test code via API, scan it, verify redirect
  - [ ] Verify branded 404 for nonexistent codes
- [ ] Set up basic uptime monitoring (Cloudflare or UptimeRobot on `/health`)

**Exit criteria:** `qrfo.link` serves redirects in production. Uptime monitoring is active.

---

## Phase 7: Hardening & Launch Prep

**Goal:** Production-ready with protections and polish.

### Automated (done in IDE)

- [x] Input sanitization audit — added `isValidLabel`, `isValidPassword`, `isValidExpiresAt` validators; wired into `createCode` and `updateCode` handlers
- [x] Error page polish — branded 404 with QR Foundry wordmark, reason-specific messages (not_found / paused / expired)
- [x] API documentation — complete endpoint reference in `API.md` covering all 10 routes
- [x] Tests — 160 total tests (27 new), all passing with lint and typecheck clean
- [ ] Load testing — verify KV read latency stays under 50ms at expected traffic
- [ ] Security review — auth bypass, ownership boundary enforcement, CORS policy
- [ ] Update marketing site with dynamic QR code feature and Subscription pricing

### Manual steps (requires action outside IDE)

- [ ] **Rate limiting on the redirect path** — Configure in Cloudflare Dashboard:
  - Go to Security → WAF → Rate limiting rules → Create rule
  - Rule name: "Redirect path rate limit"
  - Matching: hostname equals `qrfo.link` AND URI path does NOT start with `/api/` AND URI path does NOT equal `/health`
  - Rate: 100 requests per 10 seconds per IP
  - Action: Block (429) for 60 seconds
  - Deploy to production only

**Exit criteria:** The service handles abuse gracefully and is ready for public launch.

---

## Future (Post-Launch)

These are not blockers for launch but are planned for future iterations:

- **Per-user JWT auth** — Replace single bearer token. Billing API issues JWTs, Worker validates them. `ownerId` comes from JWT claims. See [`billing-api.md`](billing-api.md).
- **Password-protected links** — Serve an HTML challenge page for gated redirects
- **Custom redirect domains** — Let users bring their own domains (Cloudflare for SaaS)
- **Bulk operations API** — Batch create/update/delete for CSV-driven workflows
- **Webhook notifications** — Notify users when a code hits a scan milestone
- **A/B redirect testing** — Split traffic between two destination URLs with configurable weights
- **QR code expiration warnings** — Email or in-app notification before a code expires
