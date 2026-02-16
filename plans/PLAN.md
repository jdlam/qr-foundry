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
| **Redirect Worker** | `qr-foundry-worker` | [`services/worker.md`](services/worker.md) | Phases 1-8 complete, deployed to production at `qrfo.link`. Grace period cron enforcement implemented |
| **Desktop + Web App** | `qr-foundry-app` | [`services/app.md`](services/app.md) | Phases 1-6 complete (auth, gating, dynamic codes CRUD, analytics, platform abstraction, web deploy to `app.qr-foundry.com`); release pipeline + auto-updater added |
| **Billing API** | `qr-foundry-api` | [`services/billing-api.md`](services/billing-api.md) | Phases 1-9 complete, deployed to production at `api.qr-foundry.com` |
| **Marketing Site** | `qr-foundry-site` | [`services/marketing-site.md`](services/marketing-site.md) | Phase 1 complete; Phase 2 partially complete (`/pricing`, CTA routes, download/legal pages); Phase 3 partially complete (`/blog`, sitemap baseline) |

## Current Releases

| Service | Version | Date | Domain |
|---------|---------|------|--------|
| **Redirect Worker** | v0.1.0 | 2026-02-13 | `qrfo.link` |
| **Billing API** | v0.1.2 | 2026-02-14 | `api.qr-foundry.com` |
| **Desktop + Web App** | v0.2.0 | 2026-02-14 | downloadable / `app.qr-foundry.com` |
| **Marketing Site** | v0.1.0 | 2026-02-13 | `qr-foundry.com` |

## Pricing Model (quick reference)

All QR generation features are free. You only pay for dynamic QR codes.

| Tier | Monthly | Annual (17% off) | Key Features |
|------|---------|------------------|-------------|
| Free | $0 | — | Everything: all QR types, full customization, PNG/SVG export, batch, templates |
| Subscription | $6/month | $60/year | Free + 25 dynamic codes, scan analytics |
| Add-on (+25 codes) | +$3/month | +$30/year | Stackable extra dynamic code slots |

See [`architecture/ARCHITECTURE.md`](architecture/ARCHITECTURE.md) for full pricing details and quota mapping.
