# QR Foundry — Shared Plans & Documentation

This repo contains the shared planning, architecture, and feature-tracking
documents for the QR Foundry project. It is the single source of truth
referenced by all service repos via `../plans/`.

## Repository Map

| Service | Repo | Domain |
|---------|------|--------|
| **Desktop + Web App** | [`qr-foundry-app`](https://github.com/jdlam/qr-foundry-app) | downloadable / `app.qr-foundry.com` |
| **Redirect Worker** | [`qr-foundry-worker`](https://github.com/jdlam/qr-foundry-worker) | `qrfo.link` |
| **Billing API** | [`qr-foundry-api`](https://github.com/jdlam/qr-foundry-api) | `api.qr-foundry.com` |
| **Marketing Site** | [`qr-foundry-site`](https://github.com/jdlam/qr-foundry-site) | `qr-foundry.com` |

All four repos are cloned as siblings under this directory and reference
`../plans/` for shared documentation.

## Directory Layout

```
qr-foundry/                  ← this repo (qr-foundry-plans)
├── CLAUDE.md                # This file
├── README.md                # Project overview and repo links
├── plans/
│   ├── PLAN.md              # Plan index (start here)
│   ├── architecture/        # Product & architecture docs
│   │   ├── FEATURES.md      # Master feature list (203 features, status tracking)
│   │   ├── ARCHITECTURE.md  # System architecture, data flows, API contracts
│   │   └── product-spec.md  # Original product specification
│   ├── services/            # Per-service implementation plans
│   │   ├── app.md           # Desktop + Web App phases
│   │   ├── worker.md        # Redirect Worker phases
│   │   ├── billing-api.md   # Billing API phases
│   │   └── marketing-site.md# Marketing site phases
│   └── design/              # Design & mockups
│       ├── mockups.md       # Marketing site design mockups
│       └── qr-forge-mockup.jsx  # React UI mockup component
├── qr-foundry-app/          # (gitignored) Desktop + Web App repo
├── qr-foundry-worker/       # (gitignored) Redirect Worker repo
├── qr-foundry-api/          # (gitignored) Billing API repo
└── qr-foundry-site/         # (gitignored) Marketing Site repo
```

## Key Documents

- **[`plans/PLAN.md`](plans/PLAN.md)** — Start here. Lightweight index
  with per-service status and pricing quick reference.
- **[`plans/architecture/FEATURES.md`](plans/architecture/FEATURES.md)** —
  Master feature list with `[x]`/`[ ]`/`[~]` status markers across all
  services. Updated by each repo when features are implemented.
- **[`plans/architecture/ARCHITECTURE.md`](plans/architecture/ARCHITECTURE.md)** —
  System-wide architecture, service interactions, auth/quota/scan flows,
  data ownership, and environment configuration.

## How This Repo Is Used

Each service repo's `CLAUDE.md` contains instructions to update these
shared docs whenever a feature or change is implemented:

- **`plans/architecture/FEATURES.md`** — Check off completed features,
  mark partials with `[~]`, update summary table counts
- **`plans/services/<service>.md`** — Check off completed items in the
  relevant phase, add sub-items if implementation reveals additional work
- **`plans/PLAN.md`** — Update status column when a major milestone
  is reached
- **`plans/architecture/ARCHITECTURE.md`** — Update when system
  architecture, data flows, API contracts, or environment config changes

## Current Status

| Service | Status |
|---------|--------|
| **Worker** | Phases 1-8 complete (168 tests), deployed to production at `qrfo.link` |
| **Billing API** | Phases 1-6 and 8 complete (131 tests), Phase 7 (deploy) pending |
| **Desktop App** | Phases 1-5 complete: core QR features, platform adapters, UI redesign, auth, feature gating, dynamic codes CRUD, analytics, "Make Dynamic" toggle (517 tests); Phase 6 (web deploy) pending |
| **Marketing Site** | Phase 1 complete (landing page, dark/light theme, QR generator, pricing, CI/CD); Phases 2-3 pending |

**Feature totals:** 142 shipped, 5 partial, 59 planned (206 total)

## Pricing Model

All QR generation features are free. You only pay for dynamic QR codes.

| Tier | Monthly | Annual (17% off) | Key Features |
|------|---------|------------------|-------------|
| Free | $0 | — | Everything: all QR types, full customization, all exports, batch, templates, unlimited history |
| Subscription | $6/month | $60/year | Free + 25 dynamic codes, scan analytics |
| Add-on (+25 codes) | +$3/month | +$30/year | Stackable extra dynamic code slots |

See [`plans/architecture/ARCHITECTURE.md`](plans/architecture/ARCHITECTURE.md) for full pricing
details and quota mapping.
