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
| One-time purchases (Pro unlock) | Billing API |
| Add-on purchases (extra dynamic code slots) | Billing API |
| Trial management (7-day Pro trial tracking) | Billing API |
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

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0 | Basic QR generation, basic customization, PNG export, clipboard copy, limited history |
| **Pro Trial** | $0 for 7 days | All Pro features unlocked for 7 days after signup. Reverts to Free when trial expires. |
| **Pro** | ~$12-15 one-time | Full customization (logos, gradients, dot/eye styles), all export formats (PNG, SVG, PDF, EPS), batch CSV generation, QR scanning/import, saved templates, unlimited history |
| **Subscription** | ~$5-7/month | Everything in Pro + dynamic QR codes (changeable destinations), scan analytics dashboard, code management. Includes 25 active dynamic codes. |
| **Add-on** | TBD per pack | Additional dynamic code slots (e.g., buy 25 more) |

### 7-Day Pro Trial

Every new user gets a **free 7-day trial of Pro features** on signup. This lets users experience the full customization, export formats, batch generation, and templates before deciding to purchase. After 7 days:
- User reverts to Free tier (basic customization, PNG only)
- Any QR codes generated during the trial remain in history but advanced exports are locked
- App shows a clear "Your trial has ended — upgrade to Pro" prompt

**Trial does NOT include dynamic QR codes** — those require a separate Subscription purchase.

**Billing API responsibilities for trial:**
- Track `trialStartedAt` and `trialExpiresAt` per user
- `GET /api/me/plan` returns `{ tier: "pro_trial", trialDaysRemaining: N }` during trial
- After expiry, returns `{ tier: "free" }` unless user purchased Pro

**App responsibilities for trial:**
- Show trial banner with days remaining ("3 days left in your Pro trial")
- Show upgrade prompt when trial ends
- Gracefully degrade features (don't delete anything, just lock advanced features)

### Pricing → Quota Mapping

The Worker enforces a numeric quota (`maxCodes`). It doesn't know about plans or pricing. Both pricing models reduce to a single number:

| Event | Billing API action |
|-------|-------------------|
| User subscribes (25 codes/month) | Write `_quota::userId` with `maxCodes = 25` |
| User buys add-on code slots | Read current `maxCodes`, add purchased amount, write back |
| User downgrades or cancels | Lower `maxCodes`. Existing codes keep working but new creates are blocked until user deletes or re-upgrades |
| User exceeds quota and tries to create | Worker returns 403 with actionable error: "delete unused codes or upgrade" |

---

## Service Details

### 1. Marketing Site — `qr-foundry.com`

**Purpose:** Landing page, pricing, download links, documentation.

- **Stack:** Static site (Astro, Next.js, or similar). Deployed on Vercel or Cloudflare Pages.
- **Responsibilities:**
  - Explain the product and pricing tiers (Free, Pro, Subscription)
  - Host download links for the desktop app and link to the web app
  - SEO and social presence
- **Dependencies:** None at runtime. Purely static.
- **Repo:** `qr-foundry-site`

### 2. Desktop App — downloadable

**Purpose:** QR code generation, customization, scanning, and dynamic code management.

- **Stack:** Tauri + React. Runs locally on macOS, Windows, Linux.
- **Responsibilities:**
  - All static QR generation and customization (runs fully offline for Free/Pro)
  - Template management, batch export, QR scanning/import
  - Dynamic code management UI for Subscription users (calls the Worker API and Billing API)
  - Auth token storage (OS keychain via Tauri secure storage)
- **Dependencies at runtime:**
  - **Billing API** — for authentication, plan tier checks, subscription/purchase status
  - **Worker CRUD API** — for creating, listing, updating, and deleting dynamic codes
- **Repo:** `qr-foundry-app`

### 2b. Web App — `app.qr-foundry.com`

**Purpose:** Browser-based version of the desktop app for users who don't want to install software.

- **Stack:** React (same UI codebase as the desktop app). Deployed on Vercel or Cloudflare Pages.
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

**Purpose:** Authentication, subscription management, purchases, trial tracking, and quota control.

- **Stack:** TBD. Options: Cloudflare Worker, a small Node/Bun server, or a serverless function platform. Must integrate with Stripe (or similar) for payments.
- **Responsibilities:**
  - User authentication (signup with auto 7-day Pro trial, login, JWT issuance, password reset)
  - Trial management (track `trialStartedAt`/`trialExpiresAt`, compute trial status)
  - One-time Pro purchase (unlock Pro features permanently)
  - Subscription lifecycle (create, upgrade, downgrade, cancel — for dynamic QR codes)
  - Add-on purchases (extra dynamic code slots)
  - **Quota management** — the source of truth for how many active dynamic codes a user is allowed. Writes `UserQuota` records to the Worker's KV store after purchase/subscription events.
  - Plan tier API (`GET /api/me/plan`) — returns the user's current entitlements for feature gating
- **Dependencies at runtime:**
  - Stripe (or equivalent payment processor)
  - Cloudflare KV API (to write quota records to the Worker's namespace)
  - A database for user accounts and subscription state (Postgres, Turso, D1, etc.)
- **Repo:** `qr-foundry-api` (does not exist yet)

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
    │     (auto-starts 7-day    │                       │
    │      Pro trial)           │                       │
    │◄─── JWT token ───────────│                       │
    │                           │                       │
    │──── login ──────────────►│                       │
    │◄─── JWT token ───────────│                       │
    │                           │                       │
    │──── GET /api/me/plan ───►│                       │
    │◄─── { tier, features,    │                       │
    │       maxCodes,           │                       │
    │       trialDaysRemaining }│                       │
    │                           │                       │
    │──── API call + JWT ─────────────────────────────►│
    │                           │    (Worker validates   │
    │                           │     JWT signature +    │
    │                           │     expiry, extracts   │
    │                           │     ownerId from claims)│
    │◄─── response ───────────────────────────────────│
```

Both the desktop app and web app use the same auth flow — the only difference is token storage (OS keychain for desktop, `httpOnly` cookie or `localStorage` for web). The Worker validates JWTs issued by the Billing API. No separate auth system for the Worker — it trusts JWTs signed by the Billing API.

For launch, the Worker uses a single shared bearer token (simple, single-user). The Billing API will issue per-user JWTs when multi-user support is added. The Worker's `authenticateRequest` function is designed to be swapped from shared-token to JWT validation without changing any other code.

### Feature Gating Flow

```
Desktop App / Web App       Billing API              Worker
    │                           │                       │
    │──── GET /api/me/plan ───►│                       │
    │◄─── { tier: "pro",       │                       │
    │       features: [...],    │                       │
    │       maxCodes: 25 }      │                       │
    │                           │                       │
    │  (App shows/hides UI      │                       │
    │   based on tier. Free     │                       │
    │   users see lock icons    │                       │
    │   on Pro features.)       │                       │
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
| Trial tracking (`trialStartedAt`, `trialExpiresAt`) | Billing API | Database |
| Pro purchase records | Billing API | Database + Stripe |
| Add-on purchase records | Billing API | Database + Stripe |
| Quota limits (`maxCodes` per user) | Billing API (writes) / Worker (reads) | Cloudflare KV (`_quota::` keys) |
| Dynamic QR code records | Worker | Cloudflare KV |
| Scan analytics | Worker | Cloudflare Analytics Engine |
| Static QR codes, templates, local history | Desktop App | Local filesystem / SQLite |

---

## Environment Matrix

| Environment | Trigger | Redirect Worker | KV Namespace | Analytics | Billing API | Web App | Marketing Site |
|-------------|---------|----------------|-------------|-----------|-------------|---------|----------------|
| **Production** | Release / manual | `qr-foundry-worker` | `qr-foundry-codes` | `qr_scans` | `api.qr-foundry.com` | `app.qr-foundry.com` | `qr-foundry.com` |
| **Preview** | Merge to `main` | `qr-foundry-worker-preview` | `qr-foundry-codes-preview` | `qr_scans_preview` | TBD | TBD | `qr-foundry-site-preview.<account>.workers.dev` |
| **Dev** | Pull request | `qr-foundry-worker-dev` | `qr-foundry-codes-dev` | `qr_scans_dev` | `localhost` | `localhost:5173` | `qr-foundry-site-dev.<account>.workers.dev` |

### Deployment Details

| Service | Platform | CI/CD | Config |
|---------|----------|-------|--------|
| **Marketing Site** | Cloudflare Workers (static assets) | GitHub Actions: dev on PR, preview on merge, production on release/manual | `wrangler.toml` + `.github/workflows/deploy.yml` |
| **Redirect Worker** | Cloudflare Workers + KV + Analytics Engine | TBD | `wrangler.toml` |
| **Billing API** | TBD | TBD | — |
| **Web App** | TBD | TBD | — |

### DNS (Cloudflare)

All subdomains managed in a single Cloudflare DNS zone for `qr-foundry.com`:

| Record | Type | Target |
|--------|------|--------|
| `qr-foundry.com` | CNAME (proxied) | `qr-foundry-site.<account>.workers.dev` |
| `www` | CNAME (proxied) | `qr-foundry.com` (redirect rule to apex) |
| `api.qr-foundry.com` | Worker route | `qr-foundry-worker` |
| `app.qr-foundry.com` | CNAME (proxied) | TBD |

### GitHub Secrets Required

| Repo | Secret | Purpose |
|------|--------|---------|
| `qr-foundry-site` | `CLOUDFLARE_API_TOKEN` | Wrangler deploy (Workers edit permission) |

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

- **Per-user JWT auth:** Replace the shared bearer token. The Billing API issues JWTs, the Worker validates them. The `ownerId` comes from JWT claims instead of being hardcoded to `"default"`.
- **Custom redirect domains:** Let users bring their own domains (e.g., `go.company.com`). Requires Cloudflare for SaaS or custom hostname configuration on the Worker.
- **Rate limiting:** Protect the redirect path from abuse. Cloudflare's built-in rate limiting or a Durable Object token bucket.
- **Webhook from Billing → Worker:** Instead of the Billing API writing directly to KV, it could call a webhook endpoint on the Worker that handles quota updates. Adds a layer of validation but also latency.
