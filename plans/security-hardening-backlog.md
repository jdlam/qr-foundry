# Security Hardening Backlog

Status and follow-ups from the Codex security audit. Ordered by priority.

## Status

| Item | Priority | Status |
|------|----------|--------|
| JWT auth migration | Launch blocker | Done (#15) |
| Rate limiting | P1 | Baseline shipped (Worker KV limiter); WAF hardening deferred |
| Password reset flow | P2 | Done (PR #15) |
| KV sync failure alerting | P3 | Done (PR #11) |
| Subscription UX gating | P4 | Done (App Phases 3-4) |
| Doc drift cleanup | P5 | Done (already fixed) |
| Port mismatch typo | P6 | Done (already fixed) |

---

## P1: Rate limiting — baseline shipped, WAF hardening deferred

Baseline rate limiting is now implemented directly in the Worker (KV-backed per-IP fixed-window limiter on `/:shortCode`, 100 req/10s/IP, returns 429 + `Retry-After`). No paid Cloudflare plan required.

**What remains:** WAF-level rate limiting rules (Cloudflare Pro, $20/month) could provide stricter atomicity and edge-level blocking before requests hit the Worker. Not justified for MVP-level traffic. Revisit if traffic grows or if upgrading to CF Pro for other reasons. Consider Durable Object token bucket for stricter guarantees at scale.

## P2: Password reset flow — shipped in PR #15

Password reset is implemented in `qr-foundry-api`:
- `POST /api/auth/forgot-password` generates a reset token and sends email
- `POST /api/auth/reset-password` validates the token and updates the password
- Resend handles transactional email delivery

## P3: KV sync failure alerting — shipped in PR #11

KV sync failures no longer rely on console logs alone. The Billing API alerting path was added so quota-sync failures are visible when they occur.

**Operational note:** Ensure `DISCORD_WEBHOOK_URL` is configured for deployed Billing API environments so the shipped alerting path can deliver notifications.

## P4: Subscription UX gating — status updated

Dynamic code management UI and analytics dashboard are now shipped in app Phases 3-4. Subscription users can create/manage dynamic codes and view analytics.

**Action:** Keep checkout and upgrade-entry surfaces aligned across app and marketing site.

## P5: Doc drift cleanup — status updated

Pricing and tier docs were updated to match the simplified model (free static features + subscription for dynamic codes).

**Action:** Keep `FEATURES.md`, `PLAN.md`, and service plans synchronized via `DOC_SYNC.md`.

## P6: Port mismatch typo — resolved

Billing API docs now consistently reference local preview runtime at `localhost:8787`.

---

## Not doing (over-engineering for MVP)

| Item | Why skip |
|------|----------|
| httpOnly cookies for web auth | Requires BFF proxy, CSRF protection. CSP header (`script-src 'self'`) is sufficient for MVP. |
| Durable retry queue / outbox for KV sync | Alerting (P3) is enough. Manual fix on failure. |
| Reconciliation cron job for quota | `GET /api/usage` already has self-healing recount. |
| CI check for forbidden doc terms | Solo dev, no team confusion risk. |
| Formal load testing | CF Workers autoscale, traffic will be low at launch. |
