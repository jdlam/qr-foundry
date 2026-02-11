# QR Foundry — Plan Index

This file is a lightweight index. All planning resources live in this directory.

## Product & Architecture

- [`architecture/FEATURES.md`](architecture/FEATURES.md) — Master feature list, user stories, feature matrix, and implementation status across all services
- [`architecture/ARCHITECTURE.md`](architecture/ARCHITECTURE.md) — System-wide architecture, service interactions, pricing model, auth/quota/scan flows, data ownership, environment matrix
- [`architecture/product-spec.md`](architecture/product-spec.md) — Original product specification (pricing model, feature tiers, UI layouts, technical architecture, data flow, distribution strategy)
- [`design/mockups.md`](design/mockups.md) — Marketing site design mockups (6 design directions)
- [`design/qr-forge-mockup.jsx`](design/qr-forge-mockup.jsx) — React UI mockup component

## Per-Service Plans

| Service | Repo | Plan | Status |
|---------|------|------|--------|
| **Redirect Worker** | `qr-foundry-worker` | [`services/worker.md`](services/worker.md) | Phases 1-7 complete, deployed to production at `qrfo.link` |
| **Desktop + Web App** | `qr-foundry-app` | [`services/app.md`](services/app.md) | Core features + platform abstraction + UI redesign + auth integration complete; feature gating/dynamic codes/analytics pending |
| **Billing API** | `qr-foundry-api` | [`services/billing-api.md`](services/billing-api.md) | Phases 1-4 and 6 complete, Phase 5 (quota writes) and 7 (deploy) pending |
| **Marketing Site** | `qr-foundry-site` | [`services/marketing-site.md`](services/marketing-site.md) | Phase 1 complete (landing page + CI/CD), Phases 2-3 pending |

## Pricing Model (quick reference)

All QR generation features are free. You only pay for dynamic QR codes.

| Tier | Monthly | Annual (17% off) | Key Features |
|------|---------|------------------|-------------|
| Free | $0 | — | Everything: all QR types, full customization, all exports, batch, templates |
| Subscription | $6/month | $60/year | Free + 25 dynamic codes, scan analytics |
| Add-on (+25 codes) | +$3/month | +$30/year | Stackable extra dynamic code slots |

See [`architecture/ARCHITECTURE.md`](architecture/ARCHITECTURE.md) for full pricing details and quota mapping.
