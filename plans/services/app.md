# QR Foundry App — Implementation Plan

**Repo:** `qr-foundry-app`
**Services:** Desktop app (Tauri) + Web app (`app.qr-foundry.com`)

## Overview

This plan covers the work needed to integrate the desktop app with the Billing API and Worker API, add feature gating, build the dynamic code management UI and analytics dashboard, abstract platform differences, and ship a web version.

The desktop app's core QR generation, customization, and export features are already built (see [`product-spec.md`](../architecture/product-spec.md) for completed phases). This plan picks up from there.

For system-wide architecture, see [`ARCHITECTURE.md`](../architecture/ARCHITECTURE.md).

---

## Phase 1: Auth Integration

**Goal:** Users can sign up, log in, and maintain a session. The app stores and sends JWTs for authenticated API calls.

- [x] Implement signup flow (calls Billing API `POST /api/auth/signup`)
  - Auto-starts 7-day Pro trial on signup
  - Returns JWT token
- [x] Implement login flow (calls Billing API `POST /api/auth/login`)
- [x] Implement logout (clear stored token)
- [x] Implement token refresh (call Billing API `POST /api/auth/refresh` before expiry)
  - Scheduled via `setTimeout` 5 minutes before JWT `exp`
- [x] Token storage abstraction:
  - Desktop: `LazyStore` from `@tauri-apps/plugin-store` (`platform/tauri/auth.ts`)
  - Web: `localStorage` (`platform/web/auth.ts`)
  - Both export `{ getToken, setToken, clearToken }` via `AuthAdapter` interface
- [x] Add auth state to app store (Zustand `authStore` with user, plan, token, loading states)
- [x] Add login/signup UI (`AuthModal` using `@radix-ui/react-dialog`)
- [x] Handle session expiry gracefully (redirect to login, show message)
  - Proactive token refresh scheduling works (5min before expiry via `setTimeout`)
  - Token expiry check on app startup (clears expired tokens)
  - 401 interceptor on all authenticated API calls → "Session expired" toast + auto-logout
  - Deduplication prevents toast spam on concurrent failures
  - Hook catch blocks suppress redundant error toasts via `isSessionExpired()` guard
- [~] Add "Account" section in settings (email, plan tier, logout)
  - Sidebar bottom section shows email, plan tier badge, and Sign Out when logged in
  - No dedicated settings screen yet

**Dependencies:** Billing API Phase 2 (Auth) must be deployed.

**Exit criteria:** Users can sign up, log in, and the app persists their session across restarts. JWT is sent with all API calls.

---

## Phase 2: Feature Gating — REVISED

**Goal:** All QR generation features are free with no account required. The only gated feature is dynamic QR codes, which requires a subscription.

> **Note:** The original plan gated Pro features (advanced customization, SVG export, batch, templates) behind a Pro tier with a 7-day trial. This has been simplified — all QR generation features are now free. The existing feature gating code (`useFeatureAccess`, PRO badges, etc.) needs to be removed.

- [x] ~~Implement `usePlan` hook~~ — still used for dynamic code access check
- [x] ~~Build feature gating system~~ — `useFeatureAccess` hook built but **needs to be removed** (all features are now free)
- [x] ~~Gate features by tier~~ — **needs to be reverted** (remove PRO badges, unlock all features for free users)
- [x] **Remove Pro feature gating from app:**
  - [x] Remove PRO badges from Sidebar tabs (Batch, Templates)
  - [x] Remove gating from input types (vCard, Email, SMS, Geo)
  - [x] Remove gating from SVG export
  - [x] Remove gating from style options (dot styles, eye styles, gradient, logo)
  - [x] Repurpose `useFeatureAccess` hook for dynamic codes only
  - [x] Expand `FREE_FEATURES` to include all QR generation features
  - [x] Keep `authModalStore` (still needed for subscription upsell)
- [x] Gate dynamic codes tab — requires active subscription (shown to all users with "Subscribe" prompt)
  - `useFeatureAccess('dynamic_codes')` in DynamicCodesView with upsell screen for free users, sign-in prompt for logged-out users
- [x] Handle offline gracefully — app works fully offline for all free features
  - Free features have zero network dependencies: client-side QR generation (`qr-code-styling`), localStorage/SQLite storage, browser clipboard/download APIs

**Dependencies:** None for free features. Billing API must be deployed for subscription check.

**Exit criteria:** All QR generation features work without login. Dynamic codes tab prompts for subscription. No PRO badges anywhere in the app.

---

## Phase 3: Dynamic Code Management UI

**Goal:** Subscription users can create, view, edit, pause/resume, and delete dynamic QR codes from the app.

- [x] Build Worker API client module (`api/worker.ts`)
  - `createCode`, `listCodes`, `getCode`, `updateCode`, `deleteCode`, `getUsage`, `getCodeAnalytics`, `getAnalyticsOverview`
  - All methods send JWT as Bearer token
  - `WorkerApiError` class with status codes, `ApiResponse<T>` envelope unwrapping
- [x] "Make Dynamic" option in the generator
  - When creating a QR code, Subscription users see a "Make Dynamic" toggle
  - When enabled, QR encodes `qrfo.link/:shortCode` instead of the raw URL
  - Calls `POST /api/codes` on the Worker API
  - Shows the generated short code and current destination
- [x] Dynamic Codes list view (new tab in navigation)
  - Two-panel layout: left panel with scrollable code list, right panel with detail/create/analytics
  - Status filter (All / Active / Paused / Expired)
  - Usage bar showing "X of Y codes used" (QuotaBar component)
- [x] Code detail view
  - Edit destination URL inline
  - Edit label
  - Pause/resume toggle with confirmation (`window.confirm`)
  - Delete with confirmation dialog
  - Copy short URL to clipboard
  - Link to analytics view (per-code + overview)
- [x] Handle quota limits in UI
  - Show "X / Y used" in quota bar on code detail
  - Show quota error message from Worker 403 responses via toast

**Dependencies:** Worker Phase 3 (CRUD API) and Phase 4 (Quota) must be deployed.

**Exit criteria:** A Subscription user can create a dynamic QR code, print it, change the destination from the app, and the printed code now goes to the new URL.

---

## Phase 4: Analytics Dashboard

**Goal:** Subscription users can see scan metrics for their dynamic codes.

The Worker-side analytics endpoints (`GET /api/analytics/:code` and `GET /api/analytics`) are built in the Worker plan Phase 5.

- [x] Add analytics API methods to Worker client (`api/worker.ts`)
  - `getCodeAnalytics(shortCode, start?, end?, granularity?)` -> `ScanAnalyticsResponse`
  - `getAnalyticsOverview(start?, end?, granularity?)` -> `ScanAnalyticsSummary`
- [x] Per-code analytics view (`AnalyticsView` component, accessible from code detail "View Analytics" button)
  - Total scans display
  - CSS horizontal bar charts: scans over time, top countries, top cities, top referrers (no charting library needed)
  - Date range picker with quick presets (7d/30d/90d) and granularity toggle (hour/day/week)
  - Back button returns to code detail
- [x] Overview dashboard (`AnalyticsOverview` component, accessible via codes/analytics toggle in left panel)
  - Total scans across all codes for selected time range
  - Most-scanned codes ranking (with labels)
  - Aggregate country breakdown
  - Scans over time chart (aggregate)
- [x] Charting: CSS horizontal bar charts (`BarChart` component) — no external charting library needed
- [x] Loading states and empty states for analytics views

**Dependencies:** Worker Phase 5 (Scan Analytics API) must be deployed.

**Exit criteria:** Users can see scan trends, geographic distribution, and traffic sources for each dynamic code and across all codes — in both desktop and web apps.

---

## Phase 5: Platform Abstraction ✅

**Goal:** All platform-specific code is behind adapter interfaces so the same React codebase builds for both Tauri and web.

- [x] Create `src/platform/` directory with adapter interfaces (`src/platform/types.ts`)
  - [x] `ExportAdapter` — QR export (PNG, SVG; PDF/EPS on Tauri only)
  - [x] `ClipboardAdapter` — Copy to clipboard
  - [x] `FilesystemAdapter` — File picking, reading
  - [x] `HistoryAdapter` — Persist QR history (SQLite on Tauri, localStorage on web)
  - [x] `TemplateAdapter` — Save/load templates (SQLite on Tauri, localStorage on web)
  - [x] `ScannerAdapter` — QR decoding (Tauri file read vs jsQR in browser)
  - [x] `BatchAdapter` — Batch processing (CSV import, zip creation)
  - [x] `DragDropAdapter` — Drag-drop file handling
  - [x] `auth` adapter — `{ getToken, setToken, clearToken }` via `AuthAdapter` interface
    - `platform/tauri/auth.ts` — `LazyStore` from `@tauri-apps/plugin-store`
    - `platform/web/auth.ts` — `localStorage`
- [x] Configure Vite path aliases (`@platform/*`) to resolve via `VITE_PLATFORM` env var
- [x] Platform detection helpers: `isTauri()`, `isWeb()`, `platformName()`
- [x] Components conditionally hide features not available on web (e.g., ZIP export)
- [x] Verify desktop app still builds and works after restructuring
- [x] `npm run dev:web` and `npm run build:web` scripts

**Exit criteria:** The React codebase is cleanly split between shared code and platform-specific adapters. Desktop app still works identically. ✅ (Auth adapter shipped as part of Phase 1 auth integration.)

---

## Phase 6: Web Build + Deployment ✅

**Goal:** `app.qr-foundry.com` serves a fully functional QR code management UI in the browser.

- [x] ~~Add `vite.config.web.ts` for the web build target~~ — shared `vite.config.ts` with `VITE_PLATFORM=web` env var (done in Phase 5)
- [x] ~~Create web entry point~~ — same entry point, platform adapters resolve at build time via Vite aliases (done in Phase 5)
- [x] `npm run dev:web` and `npm run build:web` scripts (done in Phase 5)
- [x] Implement web auth flow (login/signup form, token storage in localStorage) (done in Phase 1)
- [x] Handle session expiry and refresh in browser context (done in Phase 1)
- [x] CORS configuration — Worker uses `Access-Control-Allow-Origin: *`; Billing API has `app.qr-foundry.com` + workers.dev URLs in CORS origins
- [x] Deploy web app to Cloudflare Workers with `wrangler.toml` + SPA routing (`not_found_handling = "single-page-application"`)
- [x] Configure `app.qr-foundry.com` DNS via `custom_domain = true` route in wrangler.toml
- [x] Set up CI/CD for web builds (`deploy-web.yml`: PR → dev, merge → preview, release → production)
- [x] Per-environment Vite modes: `--mode preview` for dev/preview (preview API), `--mode production` for production

### Verification

- [x] All shared components render correctly in both desktop and web
- [x] QR generation, customization, and export work in browser
- [x] Dynamic code CRUD works through the web interface
- [x] Analytics dashboard works through the web interface
- [x] Auth flow works end-to-end in browser

### Manual steps (requires action outside IDE)

- [x] **Configure DNS** — `custom_domain = true` auto-creates DNS record on first production deploy
- [x] **Update CORS on Billing API** — Added `app.qr-foundry.com` (production) and workers.dev URLs (preview/dev) to `CORS_ORIGINS`
- [ ] **Update marketing site** — Add "Use in browser" option alongside desktop download links

**Exit criteria:** `app.qr-foundry.com` serves a fully functional QR code management UI. Users can create, customize, and export QR codes; manage dynamic codes; and view analytics — all in the browser.

---

## Infrastructure: Release Pipeline & Auto-Updater

**Goal:** Automated release process for the desktop app with in-app update notifications.

- [x] Add `app` target to shared release script (`scripts/release.sh`)
  - Bumps version in 3 files: `package.json`, `tauri.conf.json`, `Cargo.toml`
- [x] Deploy workflow (`.github/workflows/deploy.yml`)
  - Triggers on GitHub Release publish
  - Builds macOS (arm64 + x86_64), Linux, Windows via `tauri-apps/tauri-action`
  - Attaches binaries, signatures, and `latest.json` to the release
- [x] Tauri auto-updater plugin
  - Checks for updates on startup (desktop only)
  - Shows toast notification with "Install & restart" / "Later" actions
  - Signing key pair generated, public key in `tauri.conf.json`
- [x] `@tauri-apps/plugin-process` for relaunch after update install
