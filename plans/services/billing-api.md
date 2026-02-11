# QR Foundry Billing API — Implementation Plan

**Repo:** `qr-foundry-api`
**Service:** Billing API at `api.qr-foundry.com`

## Overview

The Billing API handles authentication, subscription management, one-time purchases, trial tracking, and quota control. It is the source of truth for what a user has purchased and what features they can access. Both the desktop app and web app call this API for auth and plan checks.

For system-wide architecture, see [`ARCHITECTURE.md`](../architecture/ARCHITECTURE.md).

---

## Phase 1: Scaffold ✅

**Goal:** Project is set up with framework, database, and basic infrastructure.

- [x] Choose framework — **Hono on Cloudflare Workers** with Vite for dev/build
- [x] Initialize repo with TypeScript, Biome (linting/formatting), Vitest (testing)
- [x] Design database schema (Drizzle ORM + Turso/SQLite):
  - `users` — id, email, passwordHash, createdAt, updatedAt
  - `subscriptions` — id, userId, stripeSubscriptionId, status, plan, currentPeriodStart, currentPeriodEnd, createdAt
  - `purchases` — id, userId, stripePaymentId, product ("pro" | "addon_25"), createdAt
  - `trials` — id, userId, startedAt, expiresAt
- [x] Set up database migrations (Drizzle Kit)
- [x] Set up environment configuration (dev, preview, production)
- [x] Add health check endpoint (`GET /health`)
- [x] Set up CI pipeline (`ci.yml` — lint, typecheck, test)
- [x] Set up deploy pipeline (`deploy.yml` — preview on main merge, production on release)
- [x] Set up Husky pre-commit hooks (lint-staged + typecheck + test)
- [x] Set up commit-msg hook (conventional commit validation)

**Exit criteria:** Project builds, tests run, health check responds, database migrations work. ✅

---

## Phase 2: Auth ✅

**Goal:** Users can sign up, log in, and receive JWTs for authenticated API calls.

- [x] Implement `POST /api/auth/signup`
  - Creates user account
  - Auto-starts 7-day Pro trial (writes trial record)
  - Returns JWT
- [x] Implement `POST /api/auth/login`
  - Validates credentials
  - Returns JWT
- [x] Implement `POST /api/auth/refresh`
  - Accepts valid (non-expired or recently-expired) JWT
  - Returns new JWT with extended expiry
- [x] Implement JWT issuance and validation
  - Claims: `sub` (user ID), `email`, `iat`, `exp`
  - Signing key managed as secret
  - Expiry: 7 days (configurable)
- [ ] Implement `POST /api/auth/forgot-password` (send reset email) — deferred, requires email service
- [ ] Implement `POST /api/auth/reset-password` (validate token, update password) — deferred
- [x] Implement `GET /api/me` (return current user info)
- [x] Password hashing (PBKDF2-SHA256 via Web Crypto API)
- [ ] Email verification flow (optional for launch, but schema should support it) — deferred
- [x] Write tests for all auth endpoints

**Exit criteria:** Users can sign up, log in, and receive valid JWTs. JWTs contain correct claims for the Worker to extract `ownerId`. ✅ (Email flows deferred to a later phase.)

---

## Phase 3: Trial Management ✅

**Goal:** New users get a 7-day Pro trial. The system tracks trial status and returns correct plan tier.

- [x] On signup, create trial record: `{ userId, startedAt: now, expiresAt: now + 7 days }`
- [x] Trial status computation:
  - If `now < expiresAt` -> `pro_trial` with `trialDaysRemaining = ceil((expiresAt - now) / day)`
  - If `now >= expiresAt` and no Pro purchase -> `free`
  - If Pro purchased -> `pro` (regardless of trial status)
  - If Subscription active -> `subscription`
- [x] Trial does NOT include dynamic QR codes (that requires a Subscription)
- [x] Trial cannot be restarted (one trial per user, enforced by unique constraint)
- [x] Write tests: trial active, trial expired, trial with Pro purchase, trial with Subscription

**Exit criteria:** New signups get a 7-day trial. Plan tier API correctly reports trial status and days remaining. ✅

---

## Phase 4: Stripe Integration ✅

**Goal:** Users can purchase Pro (one-time), subscribe for dynamic codes, and buy add-on slots. All payment events are tracked.

- [x] Integrate Stripe SDK
- [x] Implement `POST /api/billing/checkout` — create Stripe Checkout session
  - Products: `pro` (one-time), `subscription` (recurring), `addon_25` (one-time add-on)
  - Returns Checkout URL for redirect
- [x] Implement `POST /api/billing/portal` — create Stripe Customer Portal session
  - For managing subscription (upgrade, downgrade, cancel, update payment method)
- [x] Implement Stripe webhook handler (`POST /api/webhooks/stripe`)
  - `checkout.session.completed` — record purchase or subscription start
  - `customer.subscription.updated` — handle upgrade/downgrade
  - `customer.subscription.deleted` — handle cancellation
  - `invoice.payment_failed` — log only (Stripe dunning handles retries)
- [ ] Create Stripe products and prices (in Stripe dashboard or via API) — **manual step**:
  - Pro: one-time ~$15
  - Subscription: ~$6/month recurring
  - Add-on 25 codes: one-time ~TBD
- [x] Record purchases in database
- [x] Record subscription state changes in database
- [x] Write tests with mocked Stripe events
- [x] Add `stripeCustomerId` column to users table (nullable, set on first Stripe interaction)
- [x] Add Stripe price ID env vars (`STRIPE_PRICE_PRO`, `STRIPE_PRICE_SUBSCRIPTION`, `STRIPE_PRICE_ADDON_25`)
- [x] Idempotent webhook handlers (check for existing records before inserting)

**Exit criteria:** Users can purchase Pro, subscribe, and buy add-ons. Webhook handles all lifecycle events. Database reflects current subscription state. ✅ (Stripe product/price creation is a manual step.)

---

## Phase 5: Quota Management ✅

**Goal:** After purchase/subscription events, the Billing API writes quota records to the Worker's KV store so the Worker can enforce code limits.

- [x] Implement KV write helper — calls Cloudflare KV API to write `_quota::userId` records
  - Uses Cloudflare API token with KV write permissions
  - Targets the correct KV namespace per environment
- [x] On Subscription start: write `_quota::userId` with `maxCodes = 25`
- [x] On add-on purchase: compute `maxCodes` from DB state (idempotent, not incremental), write back
- [x] On Subscription cancel/downgrade: lower `maxCodes` (existing codes keep working, new creates blocked)
- [x] On Subscription reactivation: restore `maxCodes` to plan level (via idempotent `syncQuota`)
- [x] Handle edge cases:
  - First-time subscriber with no existing quota record (defaults `currentCount` to 0)
  - Add-on without active subscription (computes maxCodes=0, no-op in practice)
  - Downgrade with active codes above new limit (don't delete codes, just block new creates)
  - KV write failures are logged but never fail the webhook (best-effort)
- [x] Write tests for each quota write scenario (14 KV unit tests + 6 webhook integration tests)

**Dependencies:** Worker KV namespace must be accessible via Cloudflare API.

**Exit criteria:** Every purchase/subscription event results in the correct `_quota::` record in Worker KV. The Worker can read these records to enforce limits. ✅

---

## Phase 6: Plan Tier API ✅

**Goal:** Both apps can call `GET /api/me/plan` to determine what features the user has access to.

- [x] Implement `GET /api/me/plan` (authenticated)
  - Computes current tier from: trial status, purchases, subscription state
  - Returns:
    ```json
    {
      "tier": "pro_trial | free | pro | subscription",
      "features": ["advanced_customization", "svg_export", "batch", ...],
      "maxCodes": 0,
      "trialDaysRemaining": 5
    }
    ```
  - Tier priority: `subscription` > `pro` > `pro_trial` > `free`
  - `maxCodes` is 0 for non-subscribers
  - `trialDaysRemaining` only present during `pro_trial`
- [x] Define feature keys and which tiers unlock them:
  - `basic_qr_types` — Free and above
  - `advanced_qr_types` — Pro and above
  - `advanced_customization` — Pro and above
  - `svg_export`, `pdf_export`, `eps_export` — Pro and above
  - `batch_generation` — Pro and above
  - `templates` — Pro and above
  - `unlimited_history` — Pro and above
  - `web_asset_pack` — Pro and above
  - `dynamic_codes` — Subscription only
  - `analytics` — Subscription only
- [ ] Cache plan computation (avoid re-querying DB on every call) — **deferred: queries are simple indexed lookups, no cache layer yet**
- [x] Write tests: each tier returns correct features, tier priority is correct

**Exit criteria:** Both apps can determine the user's plan tier and available features with a single API call. ✅ (Caching deferred.)

---

## Phase 7: Deployment

**Goal:** Billing API is deployed and accessible at `api.qr-foundry.com`.

- [x] Set up deployment pipeline (CI/CD) — `ci.yml` and `deploy.yml` GitHub Actions workflows
- [ ] Configure environments:
  - Production: `api.qr-foundry.com`
  - Preview: TBD
  - Dev: `localhost:8788`
- [ ] Set up secrets management:
  - `JWT_SIGNING_KEY` — for JWT issuance/validation
  - `STRIPE_SECRET_KEY` — for Stripe API calls
  - `STRIPE_WEBHOOK_SECRET` — for webhook signature verification
  - `CLOUDFLARE_KV_API_TOKEN` — for writing quota records to Worker KV
  - `DATABASE_URL` — database connection string
- [ ] Configure DNS for `api.qr-foundry.com`
- [x] Set up CORS to allow requests from:
  - `app.qr-foundry.com` (web app)
  - `localhost:5173` (local dev)
  - `tauri://localhost` (desktop app)
- [ ] Smoke test all endpoints in production
- [ ] Set up uptime monitoring on `/health`

### Manual steps (requires action outside IDE)

- [ ] **Create Stripe account** and configure products/prices
- [ ] **Set up database** (Postgres, D1, Turso, etc.)
- [ ] **Configure DNS** for `api.qr-foundry.com`
- [ ] **Share JWT signing key** — the Worker needs the public key (or shared secret) to validate JWTs issued by this API
- [ ] **Set Cloudflare KV API token** — create a token with write permissions to the Worker's KV namespace

**Exit criteria:** `api.qr-foundry.com` is live. Users can sign up, log in, purchase, and the correct quota records appear in Worker KV.
