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
| **Redirect Worker** | `qr-foundry-worker` | [`services/worker.md`](services/worker.md) | Phases 1-7 substantially complete, manual deploy/infra steps pending |
| **Desktop + Web App** | `qr-foundry-app` | [`services/app.md`](services/app.md) | Core features + platform abstraction + UI redesign complete, auth/gating/dynamic codes pending |
| **Billing API** | `qr-foundry-api` | [`services/billing-api.md`](services/billing-api.md) | Phases 1-4 and 6 complete, Phase 5 (quota writes) and 7 (deploy) pending |
| **Marketing Site** | `qr-foundry-site` | [`services/marketing-site.md`](services/marketing-site.md) | Not started |

## Pricing Model (quick reference)

| Tier | Price | Key Features |
|------|-------|-------------|
| Free | $0 | Basic QR generation, PNG export, limited history |
| Pro Trial | $0 / 7 days | All Pro features for 7 days after signup |
| Pro | ~$12-15 one-time | Full customization, all exports, batch, templates |
| Subscription | ~$5-7/month | Pro + dynamic QR codes (25 included), analytics |
| Add-on | TBD per pack | Extra dynamic code slots |

See [`architecture/ARCHITECTURE.md`](architecture/ARCHITECTURE.md) for full pricing details, trial rules, and quota mapping.
