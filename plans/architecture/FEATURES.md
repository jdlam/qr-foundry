# QR Foundry — Master Feature List

## Product Overview

QR Foundry is a cross-platform QR code generator shipping as a Tauri desktop app (macOS, Windows, Linux) and a web app (`app.qr-foundry.com`). It covers the full lifecycle from generation and customization to dynamic QR codes with changeable destinations and scan analytics. Five services work together: the desktop/web app (shared React codebase), a Cloudflare Worker for redirects and dynamic code CRUD (`qrfo.link`), a Billing API for auth and subscriptions (`api.qr-foundry.com`), and a marketing site (`qr-foundry.com`). See [ARCHITECTURE.md](ARCHITECTURE.md) for the full system diagram and service interaction flows.

## Pricing Tiers

All QR generation features are free. You only pay for dynamic QR codes.

| Tier | Monthly | Annual (17% off) | Summary |
|------|---------|------------------|---------|
| **Free** | $0 | — | Everything: all QR types, full customization, PNG/SVG export, batch, templates, scanner, unlimited history. No account required. |
| **Subscription** | $6/month | $60/year ($5/mo) | Free + 25 dynamic QR codes, scan analytics dashboard, code management. Requires account. |
| **Add-on** (+25 codes) | +$3/month | +$30/year ($2.50/mo) | Additional 25 dynamic code slots. Stackable (buy multiple). Requires active subscription. |

Full pricing breakdown, revenue per channel, and quota mapping in [ARCHITECTURE.md](ARCHITECTURE.md).

## Feature Matrix

Status key: **[x]** = shipped, **[ ]** = planned, **[~]** = partially implemented

| Feature | Free | Subscription | Status |
|---------|------|--------------|--------|
| **QR Generation** | | | |
| URL input | Yes | Yes | [x] |
| Plain text input | Yes | Yes | [x] |
| WiFi input | Yes | Yes | [x] |
| Phone input | Yes | Yes | [x] |
| vCard input | Yes | Yes | [x] |
| Email input | Yes | Yes | [x] |
| SMS input | Yes | Yes | [x] |
| Geo/location input | Yes | Yes | [x] |
| Calendar event input | Yes | Yes | [ ] |
| Live preview | Yes | Yes | [x] |
| **Customization** | | | |
| Foreground/background colors | Yes | Yes | [x] |
| Gradient fills | Yes | Yes | [x] |
| Dot styles (square, rounded, dots, classy, classy-rounded, extra-rounded) | Yes | Yes | [x] |
| Eye/corner styles (square, rounded, circle, leaf) | Yes | Yes | [x] |
| Logo embedding (drag-drop) | Yes | Yes | [x] |
| Logo sizing (10-40% of QR area) | Yes | Yes | [x] |
| Logo shape (square/circle mask) | Yes | Yes | [x] |
| Logo placement (center only; corners/finder eyes planned) | Yes | Yes | [~] |
| Transparent backgrounds | Yes | Yes | [x] |
| Error correction manual control (L/M/Q/H) | Yes | Yes | [x] |
| **Validation** | | | |
| Built-in scan validation (render-decode-compare) | Yes | Yes | [x] |
| Three-state feedback (pass/marginal/fail) | Yes | Yes | [x] |
| Smart warnings (logo + EC risk detection) | Yes | Yes | [x] |
| Auto-reset on content/style change | Yes | Yes | [x] |
| Batch validation | Yes | Yes | [x] |
| **Export** | | | |
| PNG export (up to 4096x4096, size presets) | Yes | Yes | [x] |
| SVG export | Yes | Yes | [x] |
| PDF export (print-ready, bleed/trim marks) | Yes | Yes | [ ] |
| EPS export | Yes | Yes | [ ] |
| Clipboard copy | Yes | Yes | [x] |
| Web asset pack (favicons + manifest + HTML meta) | Yes | Yes | [ ] |
| **Batch Generation** | | | |
| CSV import and parse | Yes | Yes | [x] |
| Bulk generation with progress | Yes | Yes | [x] |
| Per-row validation during generation | Yes | Yes | [x] |
| ZIP export | Yes | Yes | [~] |
| Apply style template to batch | Yes | Yes | [x] |
| **QR Scanner** | | | |
| Decode from dropped image | Yes | Yes | [x] |
| Decode from clipboard paste | Yes | Yes | [~] |
| Re-generate decoded content | Yes | Yes | [x] |
| Copy decoded content | Yes | Yes | [x] |
| Open URL in browser | Yes | Yes | [x] |
| **History** | | | |
| Save generated QRs (unlimited) | Yes | Yes | [x] |
| Search history | Yes | Yes | [x] |
| Load from history | Yes | Yes | [~] |
| **Templates** | | | |
| Save style presets | Yes | Yes | [x] |
| Load style presets | Yes | Yes | [x] |
| Default template | Yes | Yes | [ ] |
| **Dynamic QR Codes** | | | |
| Create dynamic code (encodes `qrfo.link/:shortCode`) | -- | Yes | [x] Worker |
| Custom short codes | -- | Yes | [x] Worker |
| List codes with status filter | -- | Yes | [x] Worker |
| Edit destination URL | -- | Yes | [x] Worker |
| Pause/resume codes | -- | Yes | [x] Worker |
| Delete codes | -- | Yes | [x] Worker |
| Quota enforcement (active codes only) | -- | Yes | [x] Worker |
| Usage endpoint (active/paused/expired counts) | -- | Yes | [x] Worker |
| Public 302 redirect | -- | Yes | [x] Worker |
| Branded 404 page (not found/paused/expired) | -- | Yes | [x] Worker |
| Dynamic code management UI (app) | -- | Yes | [x] App |
| "Make Dynamic" toggle in generator | -- | Yes | [x] App |
| **Scan Analytics** | | | |
| Scan event logging (Analytics Engine) | -- | Yes | [x] Worker |
| Per-code analytics API | -- | Yes | [x] Worker |
| Overview analytics API | -- | Yes | [x] Worker |
| Analytics dashboard UI (app) | -- | Yes | [x] App |
| Per-code analytics view (app) | -- | Yes | [x] App |
| Date range filtering | -- | Yes | [x] Worker |
| Granularity toggle (hourly/daily/weekly) | -- | Yes | [x] Worker |
| Response caching (5-10 min) | -- | Yes | [x] Worker |
| **User Accounts & Auth** | | | |
| Signup | -- | -- | [x] Billing API |
| Login | -- | -- | [x] Billing API |
| JWT issuance and validation | -- | -- | [x] Billing API |
| Token refresh | -- | -- | [x] Billing API |
| Password reset | -- | -- | [x] Billing API |
| Login/signup UI | -- | -- | [x] App |
| Token storage (LazyStore / localStorage) | -- | -- | [x] App |
| **Billing & Subscriptions** | | | |
| Stripe Checkout (Subscription) | -- | -- | [x] Billing API |
| Add-on management (`POST /api/billing/addon`) | -- | -- | [x] Billing API |
| Stripe Customer Portal | -- | -- | [x] Billing API |
| Stripe webhook handler | -- | -- | [x] Billing API |
| Quota writes to Worker KV | -- | -- | [x] Billing API |
| **Feature Gating** | | | |
| Plan tier API (`GET /api/me/plan`) | -- | -- | [x] Billing API |
| `<FeatureGate>` component | -- | -- | [x] App |
| Subscription upsell prompts | -- | -- | [x] App |
| **Platform & Distribution** | | | |
| macOS desktop app (Tauri) | Yes | Yes | [x] |
| Windows desktop app (Tauri) | Yes | Yes | [x] |
| Linux desktop app (Tauri) | Yes | Yes | [x] |
| Web app (`app.qr-foundry.com`) | Yes | Yes | [x] |
| Platform adapters (8 adapters including auth) | -- | -- | [x] App |
| Sidebar navigation | Yes | Yes | [x] App |
| Title bar with theme toggle | Yes | Yes | [x] App |
| Status bar (dimensions, EC level, validation) | Yes | Yes | [x] App |
| Dark/light/system theme | Yes | Yes | [x] App |
| Design token system (60+ CSS variables) | Yes | Yes | [x] App |
| **Marketing Site** | | | |
| Landing page with embedded QR generator | -- | -- | [x] Site |
| Pricing comparison page | -- | -- | [~] Site |
| Blog/SEO content | -- | -- | [~] Site |
| **Infrastructure** | | | |
| Worker CI/CD (lint, typecheck, test on PR) | -- | -- | [x] Worker |
| Worker deploy workflow (Releases -> production) | -- | -- | [x] Worker |
| Billing API CI/CD (lint, typecheck, test on PR) | -- | -- | [x] Billing API |
| Billing API deploy workflow | -- | -- | [x] Billing API |
| Custom domain `qrfo.link` | -- | -- | [x] Worker |
| Custom domain `api.qr-foundry.com` | -- | -- | [x] Billing API |
| Rate limiting on redirect path | -- | -- | [x] Worker |

## Feature Details

### QR Code Generation

Create QR codes from multiple content types with real-time live preview.

**User stories:**
- As a free user, I want to paste a URL and instantly see a QR code so that I can download it without creating an account.
- As a free user, I want to create a vCard QR code with my full contact information so that people can scan it at conferences and save my details.
- As a user, I want to see the QR code update in real time as I type so that I can see exactly what I am generating before exporting.
- As a free user, I want to manually set the error correction level so that I can balance between data density and scan reliability for print use cases.

**Features:**
- [x] URL input with live preview (App, Free)
- [x] Plain text input (App, Free)
- [x] WiFi input (SSID, password, encryption, hidden toggle) (App, Free)
- [x] Phone number input (App, Free)
- [x] vCard input (name, org, title, email, phone, URL, address) (App, Free)
- [x] Email compose input (App, Free)
- [x] SMS input (App, Free)
- [x] Geographic location input (App, Free)
- [ ] Calendar event input (App, Free) — no form or formatter implemented yet
- [x] Live preview canvas with real-time updates (App)
- [x] Error correction selection: L/M/Q/H with guidance (App, Free)

**Services:** Desktop App, Web App

### Customization

Style QR codes with brand colors, gradients, logos, and custom dot/eye patterns.

**User stories:**
- As a free user, I want to change the foreground and background colors so that my QR code matches my brand's color scheme.
- As a free user, I want to embed my company logo in the center of the QR code so that it looks professional on printed materials.
- As a free user, I want to apply a gradient fill across the QR dots so that the code looks modern and visually appealing.
- As a free user, I want to choose from different dot and eye styles (rounded, diamond, circle, leaf) so that I can create a unique visual identity.
- As a free user, I want to export with a transparent background so that I can place the QR code on any colored surface or photograph.

**Features:**
- [x] Foreground/background color picker (App, Free)
- [x] Linear gradient fills across QR dots (App, Free)
- [x] Dot styles: square, rounded, dots, classy, classy-rounded, extra-rounded (App, Free)
- [x] Eye/corner styles: square, rounded, circle, leaf (App, Free)
- [x] Logo embedding via drag-drop (App, Free)
- [x] Adjustable logo size: 10-40% of QR area with real-time preview (App, Free)
- [x] Logo shape: square or circle mask with automatic padding (App, Free)
- [~] Logo placement: center only (corners and finder eyes not yet implemented) (App, Free)
- [x] Logo auto-resize (max 512px), transparent border trimming, auto-compression over 500KB (App, Free)
- [x] Transparent background (PNG/SVG with alpha channel) (App, Free)

**Services:** Desktop App, Web App

### Validation

Verify that styled QR codes remain scannable after customization.

**User stories:**
- As a user, I want to verify my QR code scans correctly before printing so that I do not waste materials on an unscannable code.
- As a user, I want to receive a warning when my logo is too large relative to the error correction level so that I can adjust before exporting.
- As a user generating a batch of codes, I want every code validated automatically so that I can identify failures before export.

**Features:**
- [x] One-click scan validation: renders QR to image, decodes it, compares with original content (App)
- [x] Three-state feedback: pass (scans clean), marginal (low confidence), fail (cannot decode) (App)
- [x] Smart warnings when logo size + EC level combo risks scanability (App)
- [x] Auto-reset: validation resets when any style or content changes (App)
- [x] Batch validation: validates every code during batch generation, flags failures before export (App, Free)

**Services:** Desktop App (Rust backend for decode), Web App

### Export

Save QR codes in multiple formats for screen and print.

**User stories:**
- As a free user, I want to download my QR code as a PNG so that I can use it in documents and social media.
- As a free user, I want to copy the QR code to my clipboard so that I can paste it directly into a design tool.
- As a free user, I want to export as SVG so that my QR code scales perfectly for any print size.
- As a free user, I want print-ready PDF export with bleed and trim marks so that my print shop can use the file directly.
- As a free user, I want a web asset pack (favicons, manifest.json, HTML meta tags) generated from my QR code so that I can add it to my website in one step.

**Features:**
- [x] PNG export with multiple size presets (up to 4096x4096) (App, Free)
- [x] SVG export (vector, infinitely scalable) (App, Free)
- [ ] PDF export (print-ready with optional bleed/trim marks) (App, Free)
- [ ] EPS export (professional print workflows) (App, Free)
- [x] Clipboard copy (one-click) (App, Free)
- [ ] Web asset pack: full favicon set + manifest.json + HTML meta tags + browserconfig.xml (App, Free)

**Services:** Desktop App (Rust backend for PNG/SVG/PDF/EPS), Web App (browser-based PNG/SVG/clipboard)

### Batch Generation

Generate multiple QR codes from a CSV file in a single operation.

**User stories:**
- As a free user, I want to import a CSV of URLs and generate branded QR codes for all of them at once so that I can prepare materials for a product catalog.
- As a free user, I want to apply a saved style template to an entire batch so that all codes match my brand identity.
- As a free user, I want to export all generated codes as a ZIP file so that I can hand them off to my design team.

**Features:**
- [x] CSV drop zone with parsing (expected columns: content, type, label) (App, Free)
- [x] Preview table with row status (pending, generating, validating, done, error) (App, Free)
- [x] Apply current style template to all batch items (App, Free)
- [x] Bulk generation with per-row validation (App, Free)
- [x] Individual download from preview (App, Free)
- [~] ZIP export of all generated codes (App, Free) — partially implemented, toast confirmation pending
- [x] Format selection (PNG/SVG) for batch output (App, Free)

**Services:** Desktop App (Rust CSV parsing + batch generation), Web App

### QR Scanner

Decode existing QR codes from images or clipboard.

**User stories:**
- As a user, I want to drop a QR code image into the app and see its decoded content so that I can verify what a code contains.
- As a user, I want to re-generate a scanned QR code with my own styling so that I can create a branded version of an existing code.

**Features:**
- [x] Decode from dropped image file (App, Free)
- [~] Decode from clipboard paste (Cmd+V) (App, Free) — partially working
- [x] Display decoded content with detected type, EC level, and QR version (App, Free)
- [x] Copy decoded content to clipboard (App, Free)
- [x] Open decoded URL in browser (App, Free)
- [x] Re-generate: load decoded content into the Generator tab (App, Free)

**Services:** Desktop App (jsQR for frontend decode, rqrr for Rust-side), Web App

### History & Templates

Save and organize previously generated QR codes and reusable style presets.

**User stories:**
- As a free user, I want my generated QR codes saved automatically so that I can revisit them without re-entering content.
- As a free user, I want unlimited history with search so that I can find any QR code I have ever generated.
- As a free user, I want to save my brand's style settings as a template so that I can apply them to new QR codes with one click.

**Features:**
- [x] Auto-save generated QRs to history with thumbnail (App)
- [x] Unlimited history (App, Free) — originally 10-code limit for Free, now unlimited for all users
- [x] Searchable history list (App)
- [~] Click history item to reload content and style (App) — partially working
- [x] Save style presets as named templates (App, Free)
- [x] Load template to apply all style settings (App, Free)
- [ ] Default template applied on startup (App, Free) — backlog
- [x] SQLite storage for history and templates (Desktop App)

**Services:** Desktop App (SQLite), Web App (localStorage adapters)

### Dynamic QR Codes

Create QR codes whose destination URL can be changed after printing. The QR encodes a short URL (`qrfo.link/:shortCode`) that redirects to the current destination.

**User stories:**
- As a Subscription user, I want to create a dynamic QR code so that I can print it on materials and change the destination URL later without reprinting.
- As a Subscription user, I want to pause a dynamic code so that it temporarily stops redirecting while I update my campaign.
- As a Subscription user, I want to see how many of my 25 code slots I have used so that I know when to purchase more or clean up unused codes.
- As a Subscription user, I want to set a custom short code so that the URL in the QR code is meaningful and recognizable.

**Features (Worker API — shipped):**
- [x] Create dynamic code with generated or custom short code (Worker, see worker.md Phase 3)
- [x] 7-character short codes from 55-char alphabet (excludes ambiguous chars: 0, O, l, 1, I) (Worker)
- [x] Custom short code with availability check and collision detection (Worker)
- [x] List all codes for an owner with optional status filter (active/paused/expired) (Worker)
- [x] Get single code details with ownership check (Worker)
- [x] Update destination URL, status, label, expiration, password (partial updates) (Worker)
- [x] Pause/resume codes (status toggle) (Worker)
- [x] Delete codes permanently with ownership check (Worker)
- [x] CORS preflight handling (Worker)
- [x] Public 302 redirect: `qrfo.link/:shortCode` -> destination URL (Worker)
- [x] Branded 404 pages with reason-specific messages (not found / paused / expired) (Worker)
- [x] Root path and nested paths redirect to marketing site (Worker)
- [x] Quota enforcement: active codes only count against limit (Worker, see worker.md Phase 4)
- [x] Lazy quota bootstrap with self-healing recount (Worker)
- [x] Usage endpoint: returns active/paused/expired counts and remaining quota (Worker)
- [x] Input sanitization: label, password, expiration date validators (Worker, see worker.md Phase 7)

**Features (App UI — shipped):**
- [x] Worker API client module (`api/worker.ts`) with `WorkerApiError` and typed methods (App)
- [x] "Make Dynamic" toggle in the generator (App)
- [x] Dynamic Codes list view with status filter and usage bar (App)
- [x] Code detail view: inline edit destination, label, pause/resume, delete, copy short URL (App)
- [x] Quota limit display in code detail (App)

**Services:** Worker (API + redirect), Desktop App (UI), Web App (UI)

### Scan Analytics

Track how dynamic QR codes are scanned: counts, geographic data, traffic sources, and trends over time.

**User stories:**
- As a Subscription user, I want to see how many times each of my dynamic codes has been scanned so that I can measure campaign effectiveness.
- As a Subscription user, I want to see which countries and cities my scans come from so that I can understand my audience geography.
- As a Subscription user, I want to view scan trends over time (daily, weekly) so that I can correlate spikes with marketing campaigns.
- As a Subscription user, I want an overview dashboard across all my codes so that I can see my total reach at a glance.

**Features (Worker API — shipped):**
- [x] Scan event logging to Analytics Engine via `ctx.waitUntil` (non-blocking) (Worker)
- [x] Captured data points: short code, country, city, user agent, referer (Worker)
- [x] Per-code analytics endpoint: `GET /api/analytics/:code` (Worker, see worker.md Phase 5)
- [x] Overview analytics endpoint: `GET /api/analytics` (Worker, see worker.md Phase 5)
- [x] SQL API queries (total scans, time series, top countries, top cities, top referers, top codes) (Worker)
- [x] Ownership enforcement: KV check before querying analytics (Worker)
- [x] Date range filtering with sensible defaults (last 30 days) (Worker)
- [x] Granularity toggle: hourly, daily, weekly (Worker)
- [x] Response caching: 5 min per-code, 10 min overview (Worker)
- [x] Labels from KV records attached to top codes in overview (Worker)

**Features (App UI — shipped):**
- [x] Analytics API client methods in `api/worker.ts` (App)
- [x] Per-code analytics view (`AnalyticsView`): total scans, CSS bar charts for time series/countries/cities/referrers (App)
- [x] Overview dashboard (`AnalyticsOverview`): total scans, most-scanned codes, aggregate country breakdown, time chart (App)
- [x] CSS horizontal bar charts (`BarChart` component) — no external charting library needed (App)
- [x] Date range picker with quick presets (7d/30d/90d) and granularity toggle (`DateRangeSelector`) (App)
- [x] Loading and empty states (App)

**Services:** Worker (event logging + query API), Desktop App (dashboard UI), Web App (dashboard UI)

### User Accounts & Auth

Account system for subscription access and cross-device session management.

**User stories:**
- As a new user, I want to sign up so I can create and manage dynamic QR codes.
- As a returning user, I want to log in and have my session persist across app restarts so that I do not need to re-authenticate every time.
- As a user, I want to reset my password via email so that I can recover my account if I forget my credentials.

**Features (Billing API — mostly shipped):**
- [x] Signup endpoint with JWT issuance (Billing API, see billing-api.md Phase 2)
- [x] Login with credential validation (Billing API)
- [x] JWT issuance with claims: `sub` (user ID), `email`, `iat`, `exp` (7-day expiry) (Billing API)
- [x] Token refresh endpoint (Billing API)
- [x] Password reset flow: forgot password email (Resend) + reset token + password update (Billing API, PR #15)
- [ ] Email verification (optional for launch, schema supports it) (Billing API) — deferred
- [x] User info endpoint: `GET /api/me` (Billing API)
- [x] Password hashing: PBKDF2-SHA256 via Web Crypto API (Billing API)

**Features (App — shipped):**
- [x] Login/signup UI (`AuthModal` using `@radix-ui/react-dialog`) (App, see app.md Phase 1)
- [x] Token storage: `LazyStore` from `@tauri-apps/plugin-store` with file `auth.json` (Desktop App)
- [x] Token storage: `localStorage` with key `qr-foundry-token` (Web App)
- [x] Shared `AuthAdapter` interface with `{ getToken, setToken, clearToken }` (App)
- [x] Auth state in Zustand `authStore` (user, plan, token, loading states) (App)
- [x] Session expiry handling (401 interceptor + "Session expired" toast + auto-logout) (App)
- [~] Account section in sidebar (email, plan tier badge, Sign Out button) (App) — no dedicated settings screen yet
- [x] Token refresh scheduled 5 minutes before JWT `exp` via `setTimeout` (App)

**Services:** Billing API, Desktop App, Web App

### Billing & Subscriptions

Payment processing for recurring subscriptions and add-on code packs.

**User stories:**
- As a user, I want to subscribe monthly for dynamic QR codes so that I can manage changeable codes and view scan analytics.
- As a power user, I want to buy additional code slots so that I can manage more than 25 active dynamic codes.
- As a subscriber, I want to manage my subscription (upgrade, downgrade, cancel, update payment) through a self-service portal.

**Features:**
- [x] Stripe Checkout sessions for Subscription product (Billing API, see billing-api.md Phase 4)
- [x] Stripe Customer Portal for subscription management (Billing API)
- [x] Stripe webhook handler: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed` (Billing API)
- [x] Purchase and subscription state tracking in database (Billing API)
- [x] Quota writes to Worker KV after purchase/subscription events (Billing API, see billing-api.md Phase 5)
- [x] Add-on management via `POST /api/billing/addon` — add/remove line items on single Stripe subscription, updates `addon_count` (Billing API)
- [x] Quota recomputation on add-on count change (25 base + 25 per addon from single subscription row) (Billing API)
- [x] Quota reduction on subscription cancel/downgrade — instant deactivation for base sub, 24h grace period for addon (Billing API)
- [x] Grace period enforcement via Worker cron — hourly scan of expired grace periods, pauses excess codes (Worker)
- [x] Instant code deactivation on base subscription cancellation — bulk-writes paused status to Worker KV (Billing API)
- [x] Grace period on payment failure — 24h deadline before code deactivation (Billing API + Worker cron)
- [x] Grace period clearing on subscription reactivation (Billing API)
- [ ] Mac App Store IAP integration (Desktop App, future)
- [ ] Microsoft Store IAP integration (Desktop App, future)
- [ ] Gumroad license key validation (Desktop App, future)

**Services:** Billing API, Stripe, Desktop App, Web App

### Trial Management

Removed from the pricing model. There is no trial tier; all QR generation features are free.

### Feature Gating

Plan-based UI gating: show/hide features, display lock icons, and prompt upgrades.

**User stories:**
- As a free user, I want all QR generation features available without signup so I can use the full product immediately.
- As a free/logged-out user, I want clear prompts when I open dynamic code features so I understand subscription requirements.
- As a subscription user, I want dynamic code and analytics access to unlock automatically after login.
- As a user offline, I want free features to keep working so I can continue generating and exporting codes.

**Features:**
- [x] Plan tier API: `GET /api/me/plan` returning tier, features list, and maxCodes (Billing API, see billing-api.md Phase 6)
- [x] Feature key definitions mapped to tiers (basic_qr_types, advanced_customization, svg_export, batch_generation, templates, dynamic_codes, analytics, etc.) (Billing API)
- [x] `usePlan` hook: fetch plan on app startup, cache result (App, via `useAuth` + `authStore.fetchPlan()`)
- [x] `useFeatureAccess` hook + `authModalStore`: gate actions by checking `plan.features`, open auth modal for logged-out users, show upgrade toast for free tier (App)
- [x] Tier-based gating rules: Free (all QR features), Subscription (Free + dynamic codes + analytics) (App)
  - All Pro-era gating removed (Sidebar badges, input type locks, SVG export lock, style option locks)
  - Only `dynamic_codes` and `analytics` gated behind subscription
- [~] Upgrade/purchase prompts in app (App)
  - Dynamic codes gate shows sign-in/upgrade prompts
  - Direct checkout deep-links are not fully wired in all surfaces yet
- [x] Offline graceful degradation: free features work fully offline by design (no network dependencies for QR generation, export, history, templates) (App)

**Services:** Billing API (tier computation), Desktop App (UI gating), Web App (UI gating)

### Platform & Distribution

Ship the same React codebase on desktop (Tauri) and web, with platform-specific adapters.

**User stories:**
- As a macOS user, I want to download a native desktop app from the Mac App Store so that I get a fast, integrated experience with system-level features.
- As a user without admin privileges, I want to use the web app at `app.qr-foundry.com` so that I can generate and manage QR codes without installing software.
- As a developer, I want platform differences abstracted behind adapter interfaces so that UI components work identically on desktop and web.

**Features (shipped):**
- [x] Tauri desktop app scaffold with React + TypeScript (Desktop App)
- [x] macOS, Windows, Linux builds (Desktop App)
- [x] Rust backend for file export, validation, batch, scanner (Desktop App)
- [x] SQLite storage for history and templates (Desktop App)
- [x] Sidebar navigation with 6 tabs (Generator, Batch, Scanner, History, Templates, Dynamic Codes) (App)
- [x] Custom title bar with QR Foundry branding, theme toggle, and window controls (App)
- [x] Status bar showing export dimensions, EC level, and validation state (App)
- [x] Dark/light/system theme with `themeStore`, CSS variables, and localStorage persistence (App)
- [x] Design token system: 60+ CSS variables, Inter + JetBrains Mono fonts, amber accent palette (App)

**Features (partially shipped):**
- [x] Platform adapter: auth (`platform/tauri/auth.ts` via LazyStore, `platform/web/auth.ts` via localStorage) (App)
- [x] Platform adapter: filesystem/export (Tauri invoke vs browser download API) (App)
- [x] Platform adapter: clipboard (Tauri clipboard API vs browser Clipboard API) (App)
- [x] Platform adapter: history (Tauri SQLite vs localStorage) (App)
- [x] Platform adapter: templates (Tauri SQLite vs localStorage) (App)
- [x] Platform adapter: scanner (Tauri file read vs jsQR in browser) (App)
- [x] Platform adapter: batch (Tauri CSV + zip vs browser Blob) (App)
- [x] Platform adapter: drag-drop (Tauri file events vs browser File API) (App)
- [x] Shared adapter interfaces in `src/platform/types.ts` (App)
- [x] Vite path aliases (`@platform/*`) for build-time platform resolution via `VITE_PLATFORM` env var (App)
- [x] Platform detection helpers: `isTauri()`, `isWeb()`, `platformName()` (App)
- [x] Web build config (shared `vite.config.ts` with `VITE_PLATFORM=web` env var) and entry point (App)
- [x] `npm run dev:web` and `npm run build:web` scripts (App)
- [x] Web app deployment to Cloudflare Workers with SPA routing (App)
- [x] DNS configuration: `app.qr-foundry.com` via custom domain route (App)
- [x] Web app CI/CD pipeline (`deploy-web.yml`: PR → dev, merge → preview, release → production) (App)
- [ ] Browser QR scanning via `MediaDevices` API (App, future)
- [ ] Mac App Store submission with IAP (Desktop App, future)
- [ ] Microsoft Store submission with IAP (Desktop App, future)
- [ ] Gumroad direct download distribution (Desktop App, future)

**Services:** Desktop App, Web App

### Marketing Site

Public-facing landing page that explains the product, showcases features, and drives downloads/signups.

**User stories:**
- As a visitor, I want to generate a free QR code directly on the landing page so that I can try the product without downloading anything.
- As a potential customer, I want to see a clear pricing comparison so that I can decide which tier fits my needs.
- As a business owner searching for "branded QR code generator," I want to find QR Foundry in search results so that I discover the tool organically.

**Features:**
- [x] Landing page: hero, feature showcase, live interactive QR generator, CTAs (Site, see marketing-site.md Phase 1)
- [x] Embedded QR generator using the same `qr-code-styling` library as the app (Site)
- [~] Social proof section: testimonials and counters (placeholder data for now) (Site)
- [~] Pricing comparison page with FAQ (basic page shipped with Product + FAQPage structured data; richer comparison/annual toggle pending) (Site, see marketing-site.md Phase 2)
- [~] Blog/content section (teasers shipped; full blog infra pending) (Site, see marketing-site.md Phase 3)
- [~] Technical SEO (meta tags + structured data + robots shipped; sitemap/blog SEO pending) (Site)
- [ ] Google Search Console setup (Site)
- [x] Responsive design: mobile, tablet, desktop (Site)
- [ ] Privacy-friendly analytics: Plausible or Fathom (Site)
- [x] Deployment to Cloudflare Workers with DNS (`qr-foundry.com`) (Site, see marketing-site.md Phase 4)
- [~] Redirects: `www` -> apex, `/app` -> web app (noindexed), `/download` -> store links, `/legal` -> placeholder (site routes shipped; edge redirects can be hardened) (Site)
- [ ] Six design directions explored: Workshop, Matrix, Broadsheet, Playground, Terminal, Gallery (see [mockups.md](../design/mockups.md))

**Services:** Marketing Site (`qr-foundry-site`)

### Settings & Preferences

User-configurable defaults and app behavior. (Backlog — see product-spec.md Section 5.)

**User stories:**
- As a user, I want to set my default export format and size so that I do not need to change it every time I generate a code.
- As a user, I want to choose dark or light theme so that the app matches my system appearance.
- As a user, I want to control whether QR codes are auto-saved to history so that I can keep my history clean during experimentation.

**Features:**
- [ ] Settings infrastructure (Tauri store or SQLite `settings` table) (Desktop App)
- [ ] Native macOS Preferences menu item (Cmd+,) (Desktop App)
- [ ] Settings window or in-app settings tab (App)
- [ ] Default export format (PNG/SVG) (App)
- [ ] Default export size (512px, 1024px, 2048px, 4096px) (App)
- [ ] Default error correction level (L/M/Q/H) (App)
- [x] Theme preference (dark/light/system) (App) — implemented via `themeStore` with localStorage persistence and system preference detection
- [ ] Default template to apply on startup (App)
- [ ] History auto-save toggle (on/off) (App)
- [ ] History retention period (7 days, 30 days, forever) (App)
- [ ] Clear history on app quit toggle (App)
- [ ] Batch export default output folder (App)
- [ ] Batch filename pattern template (App)

**Services:** Desktop App, Web App

### Native App Features

Desktop-specific features leveraging Tauri and OS capabilities. (Backlog — see product-spec.md Section 5.)

**User stories:**
- As a power user, I want keyboard shortcuts for common actions (export, validate, copy) so that I can work faster.
- As a macOS user, I want a proper native menu bar with File, Edit, View, QR, Window, and Help menus so that the app feels like a first-class citizen.
- As a user, I want the app to check for updates automatically so that I always have the latest features and bug fixes.

**Features:**
- [ ] Native menu system via Tauri (File, Edit, View, QR, Window, Help menus) (Desktop App)
- [ ] File menu: New QR, Open (history item), Export, Export As... (Desktop App)
- [ ] Edit menu: Undo, Redo, Cut, Copy, Paste, Select All (Desktop App)
- [ ] View menu: Toggle sidebar, Zoom controls (Desktop App)
- [ ] QR menu: Validate, Copy to Clipboard, Save to History (Desktop App)
- [ ] Keyboard shortcuts customization (Desktop App)
- [x] Auto-updater via Tauri (Desktop App)
- [ ] System tray quick-generate mode (Desktop App)
- [ ] iCloud sync for templates and history (Desktop App, macOS)
- [ ] Quick Actions / Shortcuts integration (Desktop App, macOS)

**Services:** Desktop App

## Backlog / Future Ideas

Features that are explicitly deferred or speculative. Not on any current implementation phase.

### Worker / Dynamic Codes
- [ ] **Password-protected links** — Serve an HTML challenge page for gated redirects (worker.md Future)
- [ ] **JWT hardening** — Move to asymmetric signing + key rotation (issuer/audience checks, JWKS)
- [ ] **Custom redirect domains** — Let users bring their own domains, e.g. `go.mycompany.com` (ARCHITECTURE.md Future)
- [ ] **Bulk operations API** — Batch create/update/delete for CSV-driven workflows (worker.md Future)
- [ ] **Webhook notifications** — Notify users when a code hits a scan milestone (worker.md Future)
- [ ] **A/B redirect testing** — Split traffic between two destination URLs with configurable weights (worker.md Future)
- [ ] **QR code expiration warnings** — Email or in-app notification before a code expires (worker.md Future)
- [ ] **Rate limiting** — Cloudflare WAF rate limiting or Durable Object token bucket (ARCHITECTURE.md Future)

### App
- [ ] **PDF/EPS export** — Print-ready PDF with bleed/trim marks and EPS for professional workflows
- [ ] **Web asset pack** — Full favicon set + manifest.json + HTML meta tags
- [ ] **iCloud sync** — Sync templates and history across devices (product-spec.md Section 5)
- [ ] **Quick Actions / Shortcuts integration** — macOS Shortcuts app integration (product-spec.md Section 5)
- [ ] **Menu bar quick-generate mode** — Generate from system tray without opening the full app (product-spec.md Section 5)
- [ ] **Keyboard shortcuts customization** — User-defined keyboard shortcuts (product-spec.md Section 5)
- [ ] **Browser QR scanning via camera** — `MediaDevices` API on web (app.md Phase 5)

### Billing
- [ ] **Webhook from Billing -> Worker** — Call a webhook endpoint instead of direct KV writes (ARCHITECTURE.md Future)
- [ ] **App Store receipt validation** — Server-side validation for Mac/Microsoft Store purchases
- [ ] **Add-on without subscription** — Whether standalone code slot purchases should be allowed

## Implementation Status Summary

| Area | Current state |
|------|---------------|
| Core QR generation/customization/validation | Shipped in desktop + web codebase |
| Dynamic codes (CRUD + quota + usage) | Shipped in Worker + App |
| Scan analytics (event logging + APIs + UI) | Shipped in Worker + App |
| Billing API (auth, Stripe, quotas, lifecycle, personas) | Shipped and deployed |
| Platform adapters and desktop distribution | Shipped |
| Web app deployment (`app.qr-foundry.com`) | Shipped (Cloudflare Workers, 3-env deploy pipeline) |
| Marketing site | Phase 1 shipped, Phase 2-3 partially complete (pricing page, blog index, FAQ, CTAs, sitemap) |
| Deferred backlog (settings/native advanced features/rate limiting) | Planned |

Use the matrix statuses above (`[x]`, `[~]`, `[ ]`) as the source of truth.
