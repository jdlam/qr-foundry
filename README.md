# QR Foundry

QR Foundry is a QR code generator that ships as a **desktop app** (macOS, Windows, Linux via Tauri), a **web app** (`app.qr-foundry.com`), and a **dynamic QR code service** with scan analytics.

## Repositories

| Service | Repo | Stack | Domain |
|---------|------|-------|--------|
| **Desktop + Web App** | [qr-foundry-app](https://github.com/jdlam/qr-foundry-app) | Tauri + React + TypeScript | downloadable / `app.qr-foundry.com` |
| **Redirect Worker** | [qr-foundry-worker](https://github.com/jdlam/qr-foundry-worker) | Cloudflare Worker + KV + Analytics Engine | `qrfo.link` |
| **Billing API** | [qr-foundry-api](https://github.com/jdlam/qr-foundry-api) | Hono + Drizzle + D1 | `api.qr-foundry.com` |
| **Marketing Site** | [qr-foundry-site](https://github.com/jdlam/qr-foundry-site) | Astro + React + Tailwind CSS v4 | `qr-foundry.com` |
| **Shared Plans** | [qr-foundry-plans](https://github.com/jdlam/qr-foundry-plans) (this repo) | Markdown | — |

## Architecture

```
┌─────────────────┐       ┌──────────────────┐
│  Desktop App    │       │    Web App        │
│  (Tauri+React)  │       │ app.qr-foundry.com│
└────────┬────────┘       └────────┬─────────┘
         │                         │
         │  Auth, plan checks      │
         ├─────────────────────────┤
         │                         │
         ▼                         ▼
┌──────────────────┐    ┌──────────────────────┐
│   Billing API    │    │   Redirect Worker    │
│api.qr-foundry.com│    │     qrfo.link        │
│                  │    │                      │
│ - Auth (JWT)     │    │ - 302 redirects      │
│ - Stripe billing │    │ - CRUD API           │
│ - Plan tiers     │    │ - Scan analytics     │
│ - Quota mgmt ──────────→ KV quota writes     │
└──────────────────┘    └──────────────────────┘
```

## Pricing

All QR generation features are free. You only pay for dynamic QR codes.

| Tier | Price | Key Features |
|------|-------|-------------|
| **Free** | $0 | Everything — all QR types, full customization, PNG/SVG export, batch, templates, unlimited history |
| **Subscription** | $6/month or $60/year | Free + 25 dynamic QR codes, scan analytics |
| **Add-on** | +$3/month or +$30/year | Additional 25 dynamic code slots (stackable) |

## Features

### Desktop + Web App
- 9 QR content types (URL, text, WiFi, phone, vCard, email, SMS, geo, calendar)
- Live preview with real-time style customization
- Colors, gradients, 6 dot styles, 3 eye styles, logo embedding
- Export to PNG, SVG, PDF, EPS (desktop) — PNG, SVG (web)
- Batch generation from CSV
- QR scanning/decoding
- Template save/load
- History with search
- Dark/light/system theme

### Dynamic QR Codes (Subscription)
- Print a QR code once, change its destination anytime
- Short URLs via `qrfo.link`
- Pause/resume/expire codes
- Scan analytics: counts, geography, referrers, time series

## Current Status

| Service | Progress |
|---------|----------|
| **Desktop App** | Core complete — QR generation, customization, export, batch, scanner, templates, history, theming |
| **Worker** | Phases 1-7 automated complete (160 tests) — redirects, CRUD, analytics, quota, validation |
| **Billing API** | Phases 1-4, 6 complete (107 tests) — auth, trials, Stripe, plan tiers |
| **Marketing Site** | Phase 1 complete — landing page, QR generator, dark/light theme, pricing, CI/CD |

**Feature totals:** 120 shipped, 5 partial, 78 planned (203 total)

See [`plans/architecture/FEATURES.md`](plans/architecture/FEATURES.md) for the full feature breakdown.

## Shared Documentation

This repo contains the shared planning docs referenced by all service repos:

| Document | Description |
|----------|-------------|
| [`plans/PLAN.md`](plans/PLAN.md) | Plan index — start here |
| **Architecture** | |
| [`plans/architecture/FEATURES.md`](plans/architecture/FEATURES.md) | Master feature list with status tracking |
| [`plans/architecture/ARCHITECTURE.md`](plans/architecture/ARCHITECTURE.md) | System architecture, data flows, API contracts |
| [`plans/architecture/product-spec.md`](plans/architecture/product-spec.md) | Original product specification |
| **Service Plans** | |
| [`plans/services/app.md`](plans/services/app.md) | Desktop + Web App implementation phases |
| [`plans/services/worker.md`](plans/services/worker.md) | Redirect Worker implementation phases |
| [`plans/services/billing-api.md`](plans/services/billing-api.md) | Billing API implementation phases |
| [`plans/services/marketing-site.md`](plans/services/marketing-site.md) | Marketing site implementation phases |
| **Design** | |
| [`plans/design/mockups.md`](plans/design/mockups.md) | Marketing site design mockups |

## Local Setup

All repos are cloned as siblings under one parent directory:

```bash
mkdir qr-foundry && cd qr-foundry

# Clone this repo (plans) at the root level
git clone https://github.com/jdlam/qr-foundry-plans.git .

# Clone service repos as siblings
git clone https://github.com/jdlam/qr-foundry-app.git
git clone https://github.com/jdlam/qr-foundry-worker.git
git clone https://github.com/jdlam/qr-foundry-api.git
git clone https://github.com/jdlam/qr-foundry-site.git
```

Each service repo references `../plans/` for shared documentation.
See individual repo READMEs for service-specific setup instructions.
