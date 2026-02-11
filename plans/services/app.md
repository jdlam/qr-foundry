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
- [ ] Handle session expiry gracefully (redirect to login, show message)
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
- [ ] **Remove Pro feature gating from app:**
  - Remove PRO badges from Sidebar tabs (Batch, Templates)
  - Remove gating from input types (vCard, Email, SMS, Geo)
  - Remove gating from SVG export
  - Remove gating from style options (dot styles, eye styles, gradient, logo)
  - Remove `useFeatureAccess` hook (or repurpose for dynamic codes only)
  - Remove `FeatureKey` type and `FREE_FEATURES` constant (or simplify)
  - Keep `authModalStore` (still needed for subscription upsell)
- [ ] Gate dynamic codes tab — requires active subscription (shown to all users with "Subscribe" prompt)
- [ ] Handle offline gracefully — app works fully offline for all free features

**Dependencies:** None for free features. Billing API must be deployed for subscription check.

**Exit criteria:** All QR generation features work without login. Dynamic codes tab prompts for subscription. No PRO badges anywhere in the app.

---

## Phase 3: Dynamic Code Management UI

**Goal:** Subscription users can create, view, edit, pause/resume, and delete dynamic QR codes from the app.

- [ ] Build Worker API client module (`api/worker.ts`)
  - `createDynamicCode(destinationUrl, label?, customCode?)` -> `DynamicQRRecord`
  - `listDynamicCodes(status?)` -> `DynamicQRRecord[]`
  - `getDynamicCode(shortCode)` -> `DynamicQRRecord`
  - `updateDynamicCode(shortCode, updates)` -> `DynamicQRRecord`
  - `deleteDynamicCode(shortCode)` -> void
  - `getUsage()` -> `UsageResponse`
  - All methods send JWT as Bearer token
  - Error handling: 401 -> redirect to login, 403 -> show quota message, network errors -> retry with backoff
- [ ] "Make Dynamic" option in the generator
  - When creating a QR code, Subscription users see a "Make Dynamic" toggle
  - When enabled, QR encodes `qrfo.link/:shortCode` instead of the raw URL
  - Calls `POST /api/codes` on the Worker API
  - Shows the generated short code and current destination
- [ ] Dynamic Codes list view (new tab in navigation)
  - Lists all dynamic codes with label, short code, destination, status, scan count
  - Status filter (All / Active / Paused / Expired)
  - Usage bar showing "X of Y codes used"
- [ ] Code detail view
  - Edit destination URL inline
  - Edit label
  - Pause/resume toggle with confirmation
  - Delete with confirmation dialog
  - Copy short URL to clipboard
  - Link to analytics view
- [ ] Handle quota limits in UI
  - Show "X of Y codes remaining" in the codes list header
  - Disable "Make Dynamic" when at quota limit with upgrade prompt
  - Show quota error message from Worker 403 responses

**Dependencies:** Worker Phase 3 (CRUD API) and Phase 4 (Quota) must be deployed.

**Exit criteria:** A Subscription user can create a dynamic QR code, print it, change the destination from the app, and the printed code now goes to the new URL.

---

## Phase 4: Analytics Dashboard

**Goal:** Subscription users can see scan metrics for their dynamic codes.

The Worker-side analytics endpoints (`GET /api/analytics/:code` and `GET /api/analytics`) are built in the Worker plan Phase 5.

- [ ] Add analytics API methods to Worker client (`api/worker.ts`)
  - `getCodeAnalytics(shortCode, start?, end?, granularity?)` -> `ScanAnalyticsResponse`
  - `getAnalyticsOverview(start?, end?, granularity?)` -> `ScanAnalyticsSummary`
- [ ] Per-code analytics view (accessible from code detail view)
  - Scan count summary (total scans, scans today/this week)
  - Line/bar chart: scans over time (hourly, daily, weekly granularity toggle)
  - Top countries list with counts
  - Top cities list with counts
  - Top referers (direct, social, other sites)
  - Recent scans table with timestamp, country, city, referer
  - Date range picker for filtering
- [ ] Overview dashboard (accessible from dynamic codes tab)
  - Total scans across all codes for selected time range
  - Most-scanned codes ranking
  - Aggregate country breakdown
  - Scans over time chart (aggregate)
- [ ] Charting library integration (e.g., recharts, chart.js, or lightweight alternative)
- [ ] Loading states and empty states for analytics views

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

## Phase 6: Web Build + Deployment

**Goal:** `app.qr-foundry.com` serves a fully functional QR code management UI in the browser.

- [ ] Add `vite.config.web.ts` for the web build target
- [ ] Create web entry point that uses `platform/web/*` adapters
- [ ] Add `npm run dev:web` and `npm run build:web` scripts
- [ ] Implement web auth flow (login/signup form, token storage in cookies/localStorage)
- [ ] Handle session expiry and refresh in browser context
- [ ] CORS configuration — ensure Worker allows `app.qr-foundry.com` origin
- [ ] Deploy web app to Vercel or Cloudflare Pages
- [ ] Configure `app.qr-foundry.com` DNS
- [ ] Set up CI/CD for web builds

### Verification

- [ ] All shared components render correctly in both desktop and web
- [ ] QR generation, customization, and export work in browser
- [ ] Dynamic code CRUD works through the web interface
- [ ] Analytics dashboard works through the web interface
- [ ] Auth flow works end-to-end in browser

### Manual steps (requires action outside IDE)

- [ ] **Configure DNS** — Point `app.qr-foundry.com` to Vercel/Cloudflare Pages
- [ ] **Update CORS on Worker** — Add `app.qr-foundry.com` to allowed origins
- [ ] **Update marketing site** — Add "Use in browser" option alongside desktop download links

**Exit criteria:** `app.qr-foundry.com` serves a fully functional QR code management UI. Users can create, customize, and export QR codes; manage dynamic codes; and view analytics — all in the browser.
