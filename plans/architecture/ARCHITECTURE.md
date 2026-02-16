# QR Foundry — System Architecture

## Services Overview

QR Foundry is composed of five services. Each has a single responsibility and communicates with the others through well-defined interfaces.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                            User Touchpoints                                  │
│                                                                              │
│   Browser (scan)      Desktop App (Tauri)      Web App (browser)             │
│        │                │           │           │           │                 │
│        │                │           │           │           │                 │
│        ▼                │           ▼           │           ▼                 │
│   ┌──────────┐          │     ┌──────────┐     │     ┌──────────┐            │
│   │ Worker   │          │     │ Billing  │     │     │ Worker   │            │
│   │ Redirect │          │     │ API      │◄────┘     │ CRUD API │            │
│   │ qrfo.link│          │     │ api.qr.. │           │ qrfo.link│            │
│   └──────────┘          │     └────┬─────┘           └──────────┘            │
│        │                │          │                       ▲                  │
│        │                └──────────┼───────────────────────┘                  │
│        │                           │                                          │
│        ▼                           │  KV API write                            │
│   ┌──────────┐                     │  (_quota:: keys)                         │
│   │ KV Store │◄────────────────────┘                                          │
│   └──────────┘                                                                │
│                                                                              │
│   ┌──────────────┐     ┌──────────────┐                                      │
│   │ Analytics    │     │ Marketing    │     Browser (site)                    │
│   │ Engine       │     │ Site         │◄──────────│                           │
│   └──────────────┘     │ qr-foundry.. │                                      │
│                        └──────────────┘                                      │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Key connections:**
- **Desktop App → Billing API** — auth (login/signup), plan tier checks, subscription management
- **Desktop App → Worker CRUD API** — create, list, update, delete dynamic codes
- **Web App → Billing API** — same auth and plan tier checks as desktop
- **Web App → Worker CRUD API** — same dynamic code CRUD as desktop
- **Billing API → Worker KV** — writes `_quota::` keys after purchase/subscription events (the only cross-service write)
- **Browser (scan) → Worker Redirect** — public 302 redirects for scanned QR codes

### Which service does what

| Responsibility | Service |
|---|---|
| User authentication (signup, login, JWT issuance) | Billing API |
| Subscription lifecycle (create, upgrade, downgrade, cancel) | Billing API |
| Add-on management (`POST /api/billing/addon` — add/remove dynamic code slot packs) | Billing API |
| Subscription lifecycle (cancel, payment failure, grace periods, code deactivation) | Billing API (webhooks) + Worker (cron) |
| Plan tier API (`GET /api/me/plan` — what features a user has) | Billing API |
| Quota management (setting `maxCodes` per user) | Billing API (writes to Worker KV) |
| Dynamic code CRUD (create, list, update, delete) | Worker |
| Quota enforcement (rejecting creates/reactivations over limit) | Worker (reads from KV) |
| Public redirects (`qrfo.link/:shortCode` → 302) | Worker |
| Scan analytics logging | Worker (writes to Analytics Engine) |
| Scan analytics querying | Worker (reads from Analytics Engine) |
| Feature gating UI (show/hide features based on plan) | Desktop App / Web App |
| QR generation, customization, export | Desktop App / Web App |

---

## Pricing Model

All QR generation features are **free with no account required**. The only paid feature is dynamic QR codes (changeable destinations + scan analytics), which requires a subscription.

| Tier | Monthly | Annual (17% off) | Features |
|------|---------|------------------|----------|
| **Free** | $0 | — | Everything: all QR types, full customization, PNG/SVG export, batch, templates, scanner, unlimited history. No account required. |
| **Subscription** | $6/month | $60/year ($5/mo) | Free + 25 dynamic QR codes, scan analytics dashboard, code management. Requires account. |
| **Add-on** (+25 codes) | +$3/month | +$30/year ($2.50/mo) | Additional 25 dynamic code slots. Stackable (buy multiple). Requires active subscription. |

### Why No Pro Tier?

The free tier includes all QR generation, customization, and export features. There is no one-time Pro purchase or trial period. This maximizes adoption — users get the full product immediately and only pay when they need dynamic codes with changeable destinations.

### Pricing → Quota Mapping

The Worker enforces a numeric quota (`maxCodes`). It doesn't know about plans or pricing. Subscriptions reduce to a single number:

| Event | Billing API action |
|-------|-------------------|
| User subscribes ($6/month or $60/year) | Write `_quota::userId` with `maxCodes = 25` |
| User adds add-on via `POST /api/billing/addon` | Recompute `maxCodes` from subscription base + `addon_count` (25 + 25×N), update Worker KV |
| User cancels subscription | Set `maxCodes = 0`, **instantly deactivate all dynamic codes** (set status to `"paused"` in Worker KV) |
| Payment fails (past_due) | Set `maxCodes = 0`, write grace period deadline (now + 24h). After 24h, deactivate all codes |
| User removes add-on via `POST /api/billing/addon` (base still active) | Lower `maxCodes`. Write grace period deadline (now + 24h) if active codes exceed new limit. After 24h, auto-pause newest excess codes |
| User exceeds quota and tries to create | Worker returns 403 with actionable error: "delete unused codes or upgrade" |

### Stripe Products

| Product | Stripe Mode | Prices |
|---------|------------|--------|
| QR Foundry Subscription | `subscription` | $6/month, $60/year |
| 25 Extra Dynamic Codes | `subscription` | $3/month, $30/year |

---

## Service Details

### 1. Marketing Site — `qr-foundry.com`

**Purpose:** Landing page, pricing, download links, documentation.

- **Stack:** Astro static site deployed on Cloudflare Workers (assets mode).
- **Responsibilities:**
  - Explain the product and pricing tiers (Free, Subscription)
  - Host download links for the desktop app and link to the web app
  - SEO and social presence
- **Dependencies:** None at runtime. Purely static.
- **Repo:** `qr-foundry-site`

### 2. Desktop App — downloadable

**Purpose:** QR code generation, customization, scanning, and dynamic code management.

- **Stack:** Tauri + React. Runs locally on macOS, Windows, Linux.
- **Responsibilities:**
  - All static QR generation and customization (runs fully offline for Free users)
  - Template management, batch export, QR scanning/import
  - Dynamic code management UI for Subscription users (calls the Worker API and Billing API)
  - Auth token storage (OS keychain via Tauri secure storage)
- **Dependencies at runtime:**
  - **Billing API** — for authentication, plan tier checks, subscription/purchase status
  - **Worker CRUD API** — for creating, listing, updating, and deleting dynamic codes
- **Repo:** `qr-foundry-app`

### 2b. Web App — `app.qr-foundry.com`

**Purpose:** Browser-based version of the desktop app for users who don't want to install software.

- **Stack:** React (same UI codebase as the desktop app). Deployed on Cloudflare Workers (assets mode).
- **Responsibilities:**
  - Same core functionality as the desktop app, minus platform-specific features (OS keychain, native file dialogs)
  - QR code generation, customization, and export (PNG, SVG, clipboard via browser APIs)
  - Dynamic code management for Subscription users
  - Analytics dashboard
  - Auth via browser session/cookies instead of OS keychain
- **What's shared with the desktop app:**
  - React components (UI, forms, code management panels, analytics charts)
  - API client module (same Worker and Billing API calls)
  - Types and validation logic
  - State management (stores, hooks)
- **What differs from the desktop app:**
  - No Tauri-specific APIs (file system, native menus, OS keychain, system tray)
  - Auth token stored in `httpOnly` cookies or `localStorage` instead of OS keychain
  - No QR scanning/import via camera (could add via browser MediaDevices API later)
  - No batch export to local filesystem (browser download instead)
- **Dependencies at runtime:**
  - **Billing API** — for authentication, plan tier checks, subscription/purchase status
  - **Worker CRUD API** — for creating, listing, updating, and deleting dynamic codes
- **Repo:** `qr-foundry-app` (same repo — shared React codebase, separate build targets)

### 3. Billing API — `api.qr-foundry.com`

**Purpose:** Authentication, subscription management, add-ons, and quota control.

- **Stack:** Hono on Cloudflare Workers (built with Vite), Cloudflare D1 (Drizzle ORM), Stripe.
- **Responsibilities:**
  - User authentication (signup, login, JWT issuance, password reset)
  - Subscription lifecycle (create, cancel, payment failure handling, code deactivation)
  - Add-on purchases (extra dynamic code slots)
  - Grace period management (write deadlines to Worker KV for deferred enforcement)
  - **Quota management** — the source of truth for how many active dynamic codes a user is allowed. Writes `UserQuota` records to the Worker's KV store after purchase/subscription events.
  - Plan tier API (`GET /api/me/plan`) — returns the user's current entitlements for feature gating
- **Dependencies at runtime:**
  - Stripe (or equivalent payment processor)
  - Cloudflare KV API (to write quota records to the Worker's namespace)
  - A database for user accounts and subscription state (Cloudflare D1)
- **Repo:** `qr-foundry-api`

### 4. Redirect Worker — `qrfo.link`

**Purpose:** Dynamic QR code redirects and CRUD API for code management.

- **Stack:** Cloudflare Worker with KV and Analytics Engine.
- **Responsibilities:**
  - **Public redirects** — `qrfo.link/:shortCode` → 302 to destination URL
  - **Scan analytics** — log every scan to Analytics Engine (non-blocking)
  - **CRUD API** — create, list, read, update, delete dynamic codes (authenticated)
  - **Quota enforcement** — read the user's quota from KV and enforce limits on create and reactivation. Does NOT set quotas — that's the Billing API's job.
  - **Usage reporting** — `GET /api/usage` returns active/paused/expired counts and remaining quota
- **Dependencies at runtime:**
  - Cloudflare KV (`QR_CODES` namespace)
  - Cloudflare Analytics Engine (`SCAN_ANALYTICS` dataset)
- **Repo:** `qr-foundry-worker`

---

## How the Services Interact

### Auth Flow

```
Desktop App / Web App       Billing API              Worker
    │                           │                       │
    │──── signup ──────────────►│                       │
    │                           │                       │
    │◄─── JWT token ───────────│                       │
    │                           │                       │
    │──── login ──────────────►│                       │
    │◄─── JWT token ───────────│                       │
    │                           │                       │
    │──── GET /api/me/plan ───►│                       │
    │◄─── { tier, features,    │                       │
    │       maxCodes }          │                       │
    │                           │                       │
    │──── API call + JWT ─────────────────────────────►│
    │                           │    (Worker validates   │
    │                           │     JWT signature +    │
    │                           │     expiry, extracts   │
    │                           │     ownerId from claims)│
    │◄─── response ───────────────────────────────────│
```

Both the desktop app and web app use the same auth flow — the only difference is token storage (OS keychain via adapter for desktop, `localStorage` via adapter for web). The Worker validates JWTs issued by the Billing API using the shared signing key.

### Feature Gating Flow

```
Desktop App / Web App       Billing API              Worker
    │                           │                       │
    │──── GET /api/me/plan ───►│                       │
    │◄─── { tier: "free",      │                       │
    │       features: [...],    │                       │
    │       maxCodes: 0 }       │                       │
    │                           │                       │
    │  (App checks features.    │                       │
    │   All QR features are     │                       │
    │   free. Dynamic codes     │                       │
    │   require subscription.)  │                       │
    │                           │                       │
    │──── POST /api/codes ────────────────────────────►│
    │                           │    (Worker independently│
    │                           │     enforces quota —    │
    │                           │     even if the app has │
    │                           │     a bug, the server   │
    │                           │     won't allow over-   │
    │                           │     quota creates)      │
    │◄─── 201 or 403 ────────────────────────────────│
```

### Quota Flow

```
User purchases Subscription     Billing API              Worker KV
    │                               │                       │
    │──── Stripe payment ──────────►│                       │
    │                               │──── KV API write ────►│
    │                               │   _quota::userId      │
    │                               │   { maxCodes: 25 }    │
    │                               │                       │
    │   (later, in the app)         │                       │
    │──── POST /api/codes ─────────────────────────────────►│
    │                               │         (Worker reads quota,
    │                               │          checks activeCount < maxCodes,
    │                               │          creates code or returns 403)
    │◄─── 201 Created ────────────────────────────────────│
```

Key design decisions:
- **Billing API writes quotas directly to KV** (Option A). No runtime dependency from Worker → Billing API. Redirects and creates stay fast.
- **Worker only enforces, never sets.** The Worker reads `_quota::` records and checks limits. It never decides what the limit should be.
- **Quota records use a `_quota::` key prefix** in the same KV namespace. Safe because short codes can never start with `_` or contain `:`.
- **Only active codes count against the quota.** Pausing a code frees a slot. Reactivating consumes one (and can be rejected at the limit).

### Subscription Lifecycle & Dynamic Code Deactivation

When a user's subscription state changes, their dynamic QR codes must be managed accordingly. The Billing API handles instant actions in webhooks; the Worker handles grace-period enforcement via a cron job.

#### Deactivation Rules

| Scenario | Action | Timing |
|----------|--------|--------|
| **Subscription canceled** (`customer.subscription.deleted`) | Deactivate all dynamic codes | **Instant** — webhook sets all codes to `status: "paused"` |
| **Payment failure** (`invoice.payment_failed`, status → `past_due`) | Deactivate all dynamic codes | **24h grace period** — webhook writes `gracePeriodDeadline` to quota; Worker cron enforces |
| **Add-on count reduced** (via `POST /api/billing/addon`, base subscription still active) | Pause newest excess codes | **24h grace period** — `customer.subscription.updated` webhook writes `gracePeriodDeadline` and `targetMaxCodes`; Worker cron pauses excess |
| **Base canceled but add-on still exists** | Deactivate all codes | **Instant** — no base = `maxCodes: 0`, same as subscription canceled |

#### Reactivation Rules

| Scenario | Action |
|----------|--------|
| **User re-subscribes** after cancellation | Codes stay paused. User **manually reactivates** from the Dynamic Codes dashboard (up to new `maxCodes`). This lets users choose which codes to restore if they have more codes than their new limit allows. |
| **Payment resolved** (past_due → active) | Same as re-subscribe — codes stay paused, user manually reactivates. |
| **Add-on re-added** | `maxCodes` increases. Excess-paused codes stay paused; user manually reactivates. |

#### Implementation: Quota Record Extension

The `_quota::userId` KV record is extended with optional grace period fields:

```json
{
  "ownerId": "user123",
  "maxCodes": 25,
  "currentCount": 30,
  "updatedAt": "2025-01-15T00:00:00Z",
  "gracePeriodDeadline": "2025-01-16T00:00:00Z",
  "targetMaxCodes": 25,
  "gracePeriodReason": "addon_canceled"
}
```

- `gracePeriodDeadline` — ISO timestamp. If set and in the future, codes over `targetMaxCodes` are not yet paused.
- `targetMaxCodes` — The new `maxCodes` that takes effect after the grace period. For full cancellation/payment failure, this is `0`.
- `gracePeriodReason` — `"payment_failed"` | `"addon_canceled"` (for logging/debugging).

When there is no grace period (instant deactivation or grace expired), these fields are absent.

#### Implementation: Worker Cron

The Worker runs a **hourly cron trigger** (`0 * * * *`) via a `scheduled` event handler:

1. List all `_quota::` keys from KV
2. For each with a `gracePeriodDeadline` that has passed:
   a. If `targetMaxCodes` is `0`: pause all codes for that owner
   b. If `targetMaxCodes` > `0`: count active codes; pause the newest excess codes (by `createdAt`) until active count <= `targetMaxCodes`
3. Update quota record: set `maxCodes = targetMaxCodes`, remove grace period fields, update `currentCount`

This keeps the redirect path completely untouched — redirects never check quota or grace periods.

#### Implementation: Billing API Webhook Actions

| Webhook Event | Billing API Action |
|---------------|-------------------|
| `customer.subscription.deleted` | Set `maxCodes = 0` in quota. List all user's codes via KV, set each to `status: "paused"`. |
| `customer.subscription.updated` (addon count reduced) | Recompute `maxCodes` from `addon_count`. If active codes > new max, write `gracePeriodDeadline` (now + 24h) and `targetMaxCodes`. |
| `invoice.payment_failed` | Write `gracePeriodDeadline` (now + 24h), `targetMaxCodes: 0`, `gracePeriodReason: "payment_failed"`. |
| `customer.subscription.updated` (reactivation) | Recompute and write `maxCodes`. Clear any `gracePeriodDeadline`. Do NOT reactivate paused codes. |

**Note:** Add-on management uses a single Stripe subscription with multiple line items (1 base + N addon items). The `POST /api/billing/addon` endpoint adds/removes addon line items, which triggers a `customer.subscription.updated` webhook to sync the local `addon_count` and quota.

#### Why Manual Reactivation?

When a user re-subscribes, they may have fewer code slots than before (e.g., had base + add-on = 50, re-subscribed with base only = 25). Auto-reactivating would require arbitrarily choosing which codes to restore. Manual reactivation lets users pick the codes that matter most to them.

### Scan Flow

```
Someone scans QR            Worker                   Analytics Engine
    │                           │                       │
    │──── GET qrfo.link/Xk7 ──►│                       │
    │                           │── KV lookup ──►       │
    │◄─── 302 redirect ────────│                       │
    │                           │── writeDataPoint ────►│
    │                           │   (via waitUntil,     │
    │                           │    non-blocking)      │
```

---

## Data Ownership

| Data | Owner | Storage |
|------|-------|---------|
| User accounts, emails, passwords | Billing API | Database |
| Subscription state, payment history | Billing API | Database + Stripe |
| Grace period deadlines (deactivation scheduling) | Billing API (writes) / Worker cron (enforces) | Cloudflare KV (`_quota::` keys) |
| Add-on purchase records | Billing API | Database + Stripe |
| Quota limits (`maxCodes` per user) | Billing API (writes) / Worker (reads) | Cloudflare KV (`_quota::` keys) |
| Dynamic QR code records | Worker | Cloudflare KV |
| Scan analytics | Worker | Cloudflare Analytics Engine |
| Static QR codes, templates, local history | Desktop App | Local filesystem / SQLite |

---

## Environment Matrix

### Service URLs per Environment

Each environment tier is self-contained — all services within a tier reference each other, never across tiers.

| Service | Local | Dev (PR) | Preview (main) | Production (release) |
|---------|-------|----------|----------------|---------------------|
| **Marketing Site** | `http://localhost:4321` | `qr-foundry-site-dev.<account>.workers.dev` | `qr-foundry-site-preview.<account>.workers.dev` | `qr-foundry.com` |
| **Billing API** | `http://localhost:5173` (`bun run dev`) / `http://localhost:8787` (`bun run preview`) | `qr-foundry-api-dev.<account>.workers.dev` | `qr-foundry-api-preview.<account>.workers.dev` | `api.qr-foundry.com` |
| **Redirect Worker** | `http://localhost:8787` (`npm run dev`) | `qr-foundry-worker-dev.<account>.workers.dev` | `qr-foundry-worker-preview.<account>.workers.dev` | `qrfo.link` |
| **App (web)** | `http://localhost:5173` (`npm run dev:web`) | `qr-foundry-app-dev.<account>.workers.dev` | `app-preview.qr-foundry.com` | `app.qr-foundry.com` |
| **App (desktop)** | `tauri://localhost` | `tauri://localhost` | `tauri://localhost` | `tauri://localhost` |

### Cross-Service URL References

These are the env vars / config values each service uses to reference other services. All must match the correct tier.

| Service | Config | Local | Dev | Preview | Production |
|---------|--------|-------|-----|---------|------------|
| **Worker** | `FALLBACK_URL` (wrangler.toml / .dev.vars) | `http://localhost:4321` | `https://qr-foundry-site-dev.<account>.workers.dev` | `https://qr-foundry-site-preview.<account>.workers.dev` | `https://qr-foundry.com` |
| **API** | `CORS_ORIGINS` (wrangler.toml / .dev.vars) | `http://localhost:5173,http://localhost:4321,tauri://localhost` | `https://qr-foundry-site-dev.<account>.workers.dev,tauri://localhost,http://localhost:5173` | `https://app-preview.qr-foundry.com,https://qr-foundry-site-preview.<account>.workers.dev,tauri://localhost,http://localhost:5173` | `https://app.qr-foundry.com,tauri://localhost` |
| **App** | `VITE_API_URL` (.env files) | `http://localhost:8787` | `http://localhost:8787` | `https://qr-foundry-api-preview.<account>.workers.dev` | `https://api.qr-foundry.com` |
| **App** | `VITE_WORKER_URL` (.env files; optional) | unset (falls back to `https://qrfo.link`) | unset (falls back to `https://qrfo.link`) | unset (falls back to `https://qrfo.link`) | `https://qrfo.link` |

**Note:** The web app (`npm run dev:web`) runs on `http://localhost:5173` (Vite default). The Tauri desktop app (`npm run tauri dev`) runs on `http://localhost:1420`.

### Worker & API Cloudflare Resources

| Environment | Worker name | API name | KV Namespace | Analytics |
|-------------|-------------|----------|-------------|-----------|
| **Production** | `qr-foundry-worker` | `qr-foundry-api` | `qr-foundry-codes` | `qr_scans` |
| **Preview** | `qr-foundry-worker-preview` | `qr-foundry-api-preview` | `qr-foundry-codes-preview` | `qr_scans_preview` |
| **Dev** | `qr-foundry-worker-dev` | `qr-foundry-api-dev` | `qr-foundry-codes-dev` | `qr_scans_dev` |

### Local Development

To run all services locally, start each in a separate terminal:

| Service | Command | Port | Directory |
|---------|---------|------|-----------|
| Marketing Site | `npm run dev` | 4321 | `qr-foundry-site/` |
| Billing API | `bun run dev` | 5173 | `qr-foundry-api/` |
| Billing API (Worker runtime) | `bun run preview` | 8787 | `qr-foundry-api/` |
| Redirect Worker | `npm run dev` | 8787 (default wrangler port) | `qr-foundry-worker/` |
| App (web) | `npm run dev:web` | 5173 | `qr-foundry-app/` |
| App (desktop) | `npm run tauri dev` | 1420 | `qr-foundry-app/` |

**Local overrides:** Workers use `.dev.vars` files (gitignored) to override wrangler.toml vars for local dev. Copy `.dev.vars.example` → `.dev.vars` in each Worker repo. The app uses `.env.development` (committed) for Vite env vars.

### Deployment Pipeline (all services)

All services follow the same CI/CD pattern:

| Trigger | Deploys to | Purpose |
|---------|------------|---------|
| Pull request | **dev** | Review changes before merge |
| Push to `main` (PR merge) | **preview** | Verify after merge, before production |
| GitHub Release published | **production** | Promote to live |
| Manual workflow dispatch | **any** | Ad-hoc deploys |

#### Release Process

1. Open a PR → auto-deploys to **dev** for review
2. Merge PR to `main` → auto-deploys to **preview**
3. Verify preview looks correct
4. Create a GitHub Release to deploy to **production**:
   - **CLI:** `gh release create v0.1.0 --title "v0.1.0" --notes "Release notes"`
   - **UI:** Repo → Releases → Draft a new release → create tag → target `main` → Publish

### Deployment Details

| Service | Platform | CI/CD | Config |
|---------|----------|-------|--------|
| **Marketing Site** | Cloudflare Workers (static assets) | GitHub Actions: dev→PR, preview→main, production→release | `wrangler.toml` + `.github/workflows/{ci,deploy}.yml` |
| **Redirect Worker** | Cloudflare Workers + KV + Analytics Engine | GitHub Actions: dev→PR, preview→main, production→release | `wrangler.toml` + `.github/workflows/{ci,deploy}.yml` |
| **Billing API** | Cloudflare Workers + D1 | GitHub Actions: dev→PR, preview→main, production→release | `wrangler.toml` + `.github/workflows/{ci,deploy}.yml` |
| **Desktop App** | GitHub Releases (direct download) | GitHub Actions: production→release | `tauri.conf.json` + `.github/workflows/{ci,deploy}.yml` |
| **Web App** | Cloudflare Workers (static assets) | GitHub Actions: dev→PR, preview→main, production→release | `wrangler.toml` + `.github/workflows/deploy-web.yml` |

### DNS (Cloudflare)

All subdomains managed in a single Cloudflare DNS zone for `qr-foundry.com`.

**Important:** Do NOT manually CNAME to `*.workers.dev` — that triggers Error 1014 (CNAME Cross-User Banned) because `workers.dev` is on Cloudflare's own account. Use Worker **Custom Domains** instead, which are configured in each service's `wrangler.toml` and automatically create the DNS records on deploy.

| Record | Type | Target |
|--------|------|--------|
| `qr-foundry.com` | Worker Custom Domain | `qr-foundry-site` (via `wrangler.toml` routes) |
| `www` | CNAME (proxied) → Redirect Rule | `qr-foundry.com` + 301 redirect rule to apex |
| `api.qr-foundry.com` | Worker Custom Domain | `qr-foundry-api` (via `wrangler.toml` routes) |
| `app.qr-foundry.com` | Worker Custom Domain | `qr-foundry-app` (via `wrangler.toml` routes) |

### GitHub Secrets Required

| Repo | Secret | Purpose |
|------|--------|---------|
| `qr-foundry-site` | `CLOUDFLARE_API_TOKEN` | Wrangler deploy (Workers edit permission) |
| `qr-foundry-site` | `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account identifier |
| `qr-foundry-app` | `CLOUDFLARE_API_TOKEN` | Wrangler deploy for web app (`deploy-web.yml`) |
| `qr-foundry-app` | `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account identifier |
| `qr-foundry-worker` | `CLOUDFLARE_API_TOKEN` | Wrangler deploy (Workers edit permission) |
| `qr-foundry-worker` | `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account identifier |
| `qr-foundry-api` | `CLOUDFLARE_API_TOKEN` | Wrangler deploy (Workers edit permission) |
| `qr-foundry-api` | `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account identifier |

---

## Code Sharing Strategy: Desktop + Web

The desktop app (Tauri + React) and web app (React) share the same React codebase. The key to making this work:

```
qr-foundry-app/
  src/
    ui/              ← Shared React components, hooks, state management
    api/             ← Shared API client (Worker + Billing API calls)
    types/           ← Shared types (synced from Worker's types.ts)
    platform/
      tauri/         ← Tauri-specific: OS keychain, native file dialogs, system tray
      web/           ← Web-specific: cookie auth, browser downloads, clipboard API
    App.tsx          ← Shared root component
  src-tauri/         ← Rust backend for Tauri
  vite.config.ts     ← Build config with conditional platform imports
```

The `platform/` directory contains adapter modules that abstract platform differences behind a common interface. For example:

- `platform/tauri/auth.ts` — stores JWT in OS keychain via Tauri secure storage
- `platform/web/auth.ts` — stores JWT in `httpOnly` cookie or `localStorage`
- Both export the same `{ getToken, setToken, clearToken }` interface

The build system (Vite) uses path aliases to resolve `@platform/*` imports to the correct platform directory at build time.

---

## Per-Service Plans

Detailed implementation plans:

- [`worker.md`](../services/worker.md) — Redirect Worker (`qr-foundry-worker`)
- [`app.md`](../services/app.md) — Desktop + Web App (`qr-foundry-app`)
- [`billing-api.md`](../services/billing-api.md) — Billing API (`qr-foundry-api`)
- [`marketing-site.md`](../services/marketing-site.md) — Marketing Site (`qr-foundry-site`)

---

## Future Considerations

- **JWT hardening:** Move from shared HS256 secret to asymmetric signing (issuer/audience checks, key rotation via JWKS).
- **Custom redirect domains:** Let users bring their own domains (e.g., `go.company.com`). Requires Cloudflare for SaaS or custom hostname configuration on the Worker.
- **Rate limiting hardening:** Redirect path now includes Worker-level KV rate limiting (free-tier compatible). Consider Durable Object token bucket for stricter atomicity at higher scale.
- **Webhook from Billing → Worker:** Instead of the Billing API writing directly to KV, it could call a webhook endpoint on the Worker that handles quota updates. Adds a layer of validation but also latency.
