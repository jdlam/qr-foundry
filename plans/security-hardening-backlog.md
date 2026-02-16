# Security Hardening Backlog

Remaining items from the Codex security audit. Ordered by priority.

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

## P2: Password reset flow — do before launch (~half day)

No password reset exists. Users who forget passwords can't recover accounts.

**Action:** Implement in `qr-foundry-api`:
- `POST /api/auth/forgot-password` — generate token, store in DB with TTL, send email
- `POST /api/auth/reset-password` — validate token, update password
- Use a transactional email service (Resend or Postmark, both have free tiers)

## P3: KV sync failure alerting — do before launch (small)

`syncQuota` silently logs KV failures. If quota sync fails, a subscriber's codes don't work.

**Manual prerequisite:**
- [ ] Create a Discord webhook (Server Settings > Integrations > Webhooks) and store the URL as a Cloudflare Worker secret (`DISCORD_WEBHOOK_URL`) on the Billing API

**Action:** Add a notification via the Discord webhook after the `console.error` in `syncQuota` when `writeQuota` returns `false`. Don't build a full retry queue — just know when it breaks so you can fix manually. Optionally add a single retry with 1s delay for transient failures.

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
