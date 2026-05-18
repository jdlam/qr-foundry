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
│   │   ├── FEATURES.md      # Master feature list (103 matrix items, status tracking)
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
- **[`plans/DOC_SYNC.md`](plans/DOC_SYNC.md)** — Required documentation
  sync workflow and pre-merge checklist.

## How This Repo Is Used

Each service repo's `CLAUDE.md` contains instructions to update these
shared docs whenever a feature or change is implemented:

- **`plans/architecture/FEATURES.md`** — Check off completed features,
  mark partials with `[~]`, keep implementation summary current
- **`plans/services/<service>.md`** — Check off completed items in the
  relevant phase, add sub-items if implementation reveals additional work
- **`plans/PLAN.md`** — Update status column when a major milestone
  is reached
- **`plans/architecture/ARCHITECTURE.md`** — Update when system
  architecture, data flows, API contracts, or environment config changes

## Documentation Sync Gate (Required)

Use this checklist for every implementation change and every strategy change.
Treat it as part of Definition of Done.

1. Update `plans/architecture/FEATURES.md` status markers (`[x]`, `[~]`, `[ ]`) for shipped/partial/planned behavior.
2. Update `plans/services/<service>.md` phase checklist and notes for the service that changed.
3. Update `plans/PLAN.md` service status when a phase or milestone status changes.
4. Update `plans/architecture/ARCHITECTURE.md` when contracts, auth flow, env config, runtime stack, or deployment assumptions change.
5. If a change intentionally does **not** affect shared docs, add a one-line note in the PR/commit message: `Docs impact: none (reason)`.
6. Run `./scripts/check-doc-drift.sh` before merge.

Never merge strategy or implementation changes with stale shared docs.

## Current Status

| Service | Version | Status |
|---------|---------|--------|
| **Worker** | v0.2.0 | Phases 1-8 complete (187 tests); free-tier redirect rate limiting + status validation hardening shipped, deployed to production at `qrfo.link` |
| **Billing API** | v0.2.0 | Phases 1-9 complete (203 tests); 14-day Stripe-native free trial for first-time subscribers shipped, deployed to production at `api.qr-foundry.com` |
| **Desktop + Web App** | v0.3.0 | Phases 1-7 complete: core QR features, platform adapters, UI redesign, auth, feature gating, dynamic codes CRUD, analytics, web deploy to `app.qr-foundry.com`, 11 QR types incl. Calendar/Bitcoin/Google Review (588 tests) |
| **Marketing Site** | v0.2.2 | Phases 1-3 complete: landing page, pricing (with 14-day trial + refund policy surfaced), blog (5 SEO articles), CTAs |

**Feature totals:** maintain counts in `plans/architecture/FEATURES.md` as part of the Documentation Sync Gate.

## Pricing Model

All QR generation features are free. You only pay for dynamic QR codes.

| Tier | Monthly | Annual (17% off) | Key Features |
|------|---------|------------------|-------------|
| Free | $0 | — | Everything: all QR types, full customization, PNG/SVG export, batch, templates, scanner, unlimited history |
| Subscription | $6/month | $60/year | Free + 25 dynamic codes, scan analytics |
| Add-on (+25 codes) | +$3/month | +$30/year | Stackable extra dynamic code slots |

See [`plans/architecture/ARCHITECTURE.md`](plans/architecture/ARCHITECTURE.md) for full pricing
details and quota mapping.
