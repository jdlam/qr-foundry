# QR Foundry — Plan Index

This file is a lightweight index. All planning resources live in this directory.

## Product & Architecture

- [`FEATURES.md`](FEATURES.md) — Master feature list, user stories, feature matrix, and implementation status across all services
- [`ARCHITECTURE.md`](ARCHITECTURE.md) — System-wide architecture, service interactions, pricing model, auth/quota/scan flows, data ownership, environment matrix
- [`product-spec.md`](product-spec.md) — Original product specification (pricing model, feature tiers, UI layouts, technical architecture, data flow, distribution strategy)
- [`mockups.md`](mockups.md) — Marketing site design mockups (6 design directions)
- [`qr-forge-mockup.jsx`](qr-forge-mockup.jsx) — React UI mockup component

## Per-Service Plans

| Service | Repo | Plan | Status |
|---------|------|------|--------|
| **Redirect Worker** | `qr-foundry-worker` | [`worker.md`](worker.md) | Phases 1-7 substantially complete, manual deploy/infra steps pending |
| **Desktop + Web App** | `qr-foundry-app` | [`app.md`](app.md) | Core features + platform abstraction + UI redesign complete, auth/gating/dynamic codes pending |
| **Billing API** | `qr-foundry-api` | [`billing-api.md`](billing-api.md) | Phases 1-4 and 6 complete, Phase 5 (quota writes) and 7 (deploy) pending |
| **Marketing Site** | `qr-foundry-site` | [`marketing-site.md`](marketing-site.md) | Not started |

## Pricing Model (quick reference)

| Tier | Price | Key Features |
|------|-------|-------------|
| Free | $0 | Basic QR generation, PNG export, limited history |
| Pro Trial | $0 / 7 days | All Pro features for 7 days after signup |
| Pro | ~$12-15 one-time | Full customization, all exports, batch, templates |
| Subscription | ~$5-7/month | Pro + dynamic QR codes (25 included), analytics |
| Add-on | TBD per pack | Extra dynamic code slots |

See [`ARCHITECTURE.md`](ARCHITECTURE.md) for full pricing details, trial rules, and quota mapping.
