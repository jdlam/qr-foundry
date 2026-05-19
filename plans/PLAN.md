# QR Foundry — Plan Index

This file is a lightweight index. All planning resources live in this directory.

## Product & Architecture

- [`architecture/FEATURES.md`](architecture/FEATURES.md) — Master feature list, user stories, feature matrix, and implementation status across all services
- [`architecture/ARCHITECTURE.md`](architecture/ARCHITECTURE.md) — System-wide architecture, service interactions, pricing model, auth/quota/scan flows, data ownership, environment matrix
- [`architecture/product-spec.md`](architecture/product-spec.md) — Original product specification (pricing model, feature tiers, UI layouts, technical architecture, data flow, distribution strategy)
- [`DOC_SYNC.md`](DOC_SYNC.md) — Required workflow for keeping plans/docs in sync with implementation and strategy changes
- [`design/mockups.md`](design/mockups.md) — Marketing site design mockups (6 design directions)
- [`design/qr-forge-mockup.jsx`](design/qr-forge-mockup.jsx) — React UI mockup component

## Per-Service Plans

| Service | Repo | Plan | Status |
|---------|------|------|--------|
| **Redirect Worker** | `qr-foundry-worker` | [`services/worker.md`](services/worker.md) | Phases 1-8 complete, deployed to production at `qrfo.link`. v0.2.0 adds free-tier redirect rate limiting and status validation hardening |
| **Desktop + Web App** | `qr-foundry-app` | [`services/app.md`](services/app.md) | Phases 1-7 complete (auth, gating, dynamic codes CRUD, analytics, platform abstraction, web deploy to `app.qr-foundry.com`, 11 QR types incl. Calendar/Bitcoin/Google Review); release pipeline + auto-updater. v0.3.0 ships 3 new QR types |
| **Billing API** | `qr-foundry-api` | [`services/billing-api.md`](services/billing-api.md) | Phases 1-9 complete, deployed to production at `api.qr-foundry.com`. v0.2.0 adds 14-day Stripe-native free trial for first-time subscribers |
| **Marketing Site** | `qr-foundry-site` | [`services/marketing-site.md`](services/marketing-site.md) | Phases 1-3 complete: landing page, pricing (with 14-day trial + refund policy surfaced), blog (5 SEO articles), CTAs. v0.2.3 removes fabricated SocialProof + audits marketing copy for fake claims |

## Current Releases

| Service | Version | Date | Domain |
|---------|---------|------|--------|
| **Redirect Worker** | v0.2.0 | 2026-05-18 | `qrfo.link` |
| **Billing API** | v0.2.0 | 2026-05-18 | `api.qr-foundry.com` |
| **Desktop + Web App** | v0.3.0 | 2026-05-18 | downloadable / `app.qr-foundry.com` |
| **Marketing Site** | v0.2.3 | 2026-05-18 | `qr-foundry.com` |

## Pricing Model (quick reference)

All QR generation features are free. You only pay for dynamic QR codes.

| Tier | Monthly | Annual (17% off) | Key Features |
|------|---------|------------------|-------------|
| Free | $0 | — | Everything: all QR types, full customization, PNG/SVG export, batch, templates, scanner, unlimited history |
| Subscription | $6/month | $60/year | Free + 25 dynamic codes, scan analytics |
| Add-on (+25 codes) | +$3/month | +$30/year | Stackable extra dynamic code slots |

See [`architecture/ARCHITECTURE.md`](architecture/ARCHITECTURE.md) for full pricing details and quota mapping.
