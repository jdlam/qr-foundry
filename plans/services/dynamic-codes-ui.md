# Dynamic Codes UI — App Phases 3-4

> **COMPLETED:** All 4 PRs have been merged. Dynamic codes CRUD, analytics views, and the "Make Dynamic" toggle are shipped in app Phases 3-4. See [app.md](app.md) for the phase checklists.

## Context

Subscriptions need to be enabled at launch. The Worker API for dynamic codes is fully built and deployed (`qrfo.link`), but the app has only a placeholder tab. Users who subscribe need to manage dynamic codes (create, list, edit, pause, delete) and view scan analytics. This plan implements both features across 4 PRs in `qr-foundry-app/`.

## PR Dependency Graph

```
PR 1: Worker API Client + Types (foundation)
  ├── PR 2: Dynamic Codes Store + Hook + CRUD View
  │     └── PR 4: "Make Dynamic" Toggle in Generator
  └── PR 3: Analytics Views (per-code + overview)
```

PRs 2 and 3 can run in parallel after PR 1 merges. PR 4 depends on PR 2.

**MVP launch:** PRs 1 + 2 (functional CRUD). PRs 3 + 4 are fast follow-ups (1-2 days each).

---

## PR 1: Worker API Client + Types

**Branch:** `feat/worker-api-client`

### New files

**`src/api/worker.ts`** — Mirror `src/api/billing.ts` exactly:
- `WORKER_BASE` from `import.meta.env.VITE_WORKER_URL || 'https://qrfo.link'`
- `WorkerApiError` class (same pattern as `ApiError`)
- `request<T>(path, options)` with `ApiResponse<T>` envelope unwrapping
- `authHeaders(token)` helper
- `workerApi` object with all methods:

```typescript
export const workerApi = {
  createCode(token, body: CreateCodeRequest): Promise<DynamicQRRecord>,
  listCodes(token, status?: CodeStatus): Promise<DynamicQRRecord[]>,
  getCode(token, shortCode): Promise<DynamicQRRecord>,
  updateCode(token, shortCode, body: UpdateCodeRequest): Promise<DynamicQRRecord>,
  deleteCode(token, shortCode): Promise<{ deleted: string }>,
  getUsage(token): Promise<UsageResponse>,
  getCodeAnalytics(token, shortCode, params?: AnalyticsParams): Promise<ScanAnalyticsResponse>,
  getAnalyticsOverview(token, params?: AnalyticsParams): Promise<ScanAnalyticsSummary>,
};
```

**`src/api/worker.test.ts`** — Mock `globalThis.fetch`, test each method (success + error paths, correct URLs/headers/bodies, query param construction).

### Modified files

**`src/api/types.ts`** — Add Worker types:
```typescript
export type CodeStatus = 'active' | 'paused' | 'expired';

export interface DynamicQRRecord {
  shortCode: string; destinationUrl: string; createdAt: string; updatedAt: string;
  status: CodeStatus; expiresAt?: string; password?: string; label?: string; ownerId: string;
}

export interface CreateCodeRequest {
  destinationUrl: string; label?: string; expiresAt?: string; password?: string; customCode?: string;
}

export interface UpdateCodeRequest {
  destinationUrl?: string; status?: 'active' | 'paused';
  label?: string | null; expiresAt?: string | null; password?: string | null;
}

export interface UsageResponse {
  ownerId: string; limit: number; total: number;
  active: number; paused: number; expired: number; remaining: number;
}

export type Granularity = 'hour' | 'day' | 'week';
export interface AnalyticsParams { start?: string; end?: string; granularity?: Granularity; }
export interface TimeSeriesPoint { date: string; count: number; }
export interface RankedItem { name: string; count: number; }

export interface ScanAnalyticsResponse {
  shortCode: string; period: { start: string; end: string }; totalScans: number;
  scansOverTime: TimeSeriesPoint[]; topCountries: RankedItem[];
  topCities: RankedItem[]; topReferers: RankedItem[];
}

export interface ScanAnalyticsSummary {
  period: { start: string; end: string }; totalScans: number;
  scansOverTime: TimeSeriesPoint[];
  topCodes: (RankedItem & { label?: string })[]; topCountries: RankedItem[];
}
```

**`src/vite-env.d.ts`** — Add `VITE_WORKER_URL: string` to `ImportMetaEnv`.

---

## PR 2: Dynamic Codes Store + Hook + DynamicCodesView

**Branch:** `feat/dynamic-codes-view` | **Depends on:** PR 1

### New files

**`src/stores/dynamicCodesStore.ts`** — Zustand store:
- State: `codes`, `selectedCode`, `usage`, `statusFilter`, per-operation loading booleans (`isLoadingCodes`, `isCreating`, `isUpdating`, `isDeleting`)
- Mutations: `setCodes`, `setSelectedCode`, `setUsage`, `setStatusFilter`, `updateCodeInList`, `removeCodeFromList` (clears selectedCode if removed), `addCodeToList` (prepend, newest first), `reset`

**`src/stores/dynamicCodesStore.test.ts`**

**`src/hooks/useDynamicCodes.ts`** — Wraps store + `workerApi` calls:
- Gets token from `useAuthStore.getState().token`
- `fetchCodes(status?)`, `fetchUsage()`, `createCode(body)`, `updateCode(shortCode, body)`, `deleteCode(shortCode)`, `selectCode(code)`, `setStatusFilter(status)`
- Error handling: catch `WorkerApiError`, `toast.error(message)`, return `null`/`false`
- Success: `toast.success(...)`, optimistic updates to store

**`src/hooks/useDynamicCodes.test.ts`**

**`src/components/dynamic/DynamicCodesView.tsx`** — Two-panel layout (replicate `HistoryView.tsx` pattern):

```
Left panel (w-72):                    Right panel (flex-1):
┌────────────────────────┐           ┌─────────────────────────────┐
│ DYNAMIC CODES (5/25)   │           │ [Selected code detail]      │
│ Status: [All ▾]        │           │ Short URL + copy button     │
│ [+ New Code]           │           │ Destination URL (editable)  │
│                        │           │ Status + Created date       │
│ ┌──────────────────┐   │           │ Label (editable)            │
│ │ abc123  ACTIVE   │   │           │                             │
│ │ example.com      │   │           │ [Pause] [Delete]            │
│ │ My Link   2d ago │   │           │ [Copy URL] [Analytics]      │
│ ├──────────────────┤   │           │                             │
│ │ xyz789  PAUSED   │   │           │ ── Quota ──                 │
│ │ shop.com         │   │           │ ████████░░  5/25 used       │
│ │ Sale     1w ago  │   │           │                             │
│ └──────────────────┘   │           │ OR: [Empty state]           │
│                        │           │ OR: [Create form]           │
└────────────────────────┘           └─────────────────────────────┘
```

- Left panel: header with count + status filter dropdown, "New Code" button, scrollable card list
- Right panel: empty state / code detail with inline editing / create form
- Feature gate: `useFeatureAccess('dynamic_codes')` — show upsell screen if no access
- Cards: shortCode, truncated destination, status badge (colored), label, relative time
- Detail: inline edit destination + label, pause/resume + delete with `window.confirm()`, copy short URL
- Quota bar: horizontal bar `active / limit`, colored (green → yellow → red)

**`src/components/dynamic/CreateCodeForm.tsx`** — Inline form in right panel:
- Destination URL (required), label (optional), custom code (optional), expiration (optional)
- Submit calls `createCode`, shows loading state

**`src/components/dynamic/QuotaBar.tsx`** — Small reusable quota bar component.

**`src/components/dynamic/DynamicCodesView.test.tsx`**

### Modified files

**`src/App.tsx`**:
- Remove `DynamicCodesPlaceholder` function
- Import `DynamicCodesView` from `./components/dynamic/DynamicCodesView`
- Replace `case 'dynamic'` to render `<DynamicCodesView />`

**`src/components/layout/Sidebar.tsx`**:
- Remove `badge: 'soon'` from the `dynamic` nav item in `NAV_ITEMS` (line 92)

---

## PR 3: Analytics Views

**Branch:** `feat/analytics-views` | **Depends on:** PR 1 (and ideally PR 2 for integration)

### New files

**`src/hooks/useAnalytics.ts`** — `useState`-based hook (not a store, analytics is transient):
- State: `codeAnalytics`, `overview`, `isLoading`, `dateRange`, `granularity`
- Actions: `fetchCodeAnalytics(shortCode)`, `fetchOverview()`, `setDateRange`, `setGranularity`
- Default date range: last 30 days, granularity: `'day'`

**`src/hooks/useAnalytics.test.ts`**

**`src/components/dynamic/AnalyticsView.tsx`** — Per-code analytics, shown in right panel when "View Analytics" is clicked:
- Back button to return to code detail
- Date range selector + granularity toggle
- Total scans display
- Scans over time (CSS horizontal bars)
- Top countries, cities, referers (CSS horizontal bars)

**`src/components/dynamic/AnalyticsOverview.tsx`** — Aggregate dashboard, accessible via toggle at top of DynamicCodesView:
- Same date range + granularity controls
- Total scans, scans over time
- Top codes ranking (with labels)
- Top countries

**`src/components/dynamic/BarChart.tsx`** — Simple CSS bar chart (no charting library):
```typescript
interface BarChartProps {
  items: { label: string; value: number; subLabel?: string }[];
  maxItems?: number; // default 10
}
```
- Horizontal bars using div width as percentage of max value
- Uses `var(--accent)` for fill, `var(--input-bg)` for track

**`src/components/dynamic/DateRangeSelector.tsx`** — Compact controls:
- Native `<input type="date">` for start/end
- 3-option select for granularity (Hour / Day / Week)
- Quick presets: "7d", "30d", "90d"

**`src/components/dynamic/AnalyticsView.test.tsx`**
**`src/components/dynamic/AnalyticsOverview.test.tsx`**

### Modified files

**`src/components/dynamic/DynamicCodesView.tsx`** — Add sub-view state:
- Right panel can show: code detail, code analytics, overview analytics, create form
- "View Analytics" button on code detail switches to per-code analytics
- Toggle row at left panel top: `[Codes] [Analytics]` to switch to overview mode

---

## PR 4: "Make Dynamic" Toggle in Generator

**Branch:** `feat/make-dynamic-toggle` | **Depends on:** PR 2

### Approach

The toggle appears in InputPanel when `inputType === 'url'` and user has `dynamic_codes` access. When enabled, export/copy creates a dynamic code on the Worker first, then encodes `https://qrfo.link/:shortCode` instead of the raw URL. The preview always shows the raw destination URL — only the exported image uses the short URL.

### Modified files

**`src/stores/qrStore.ts`** — Add fields:
```typescript
isDynamic: boolean;           // toggle state
dynamicShortCode: string | null; // set after Worker API call
dynamicLabel: string;         // optional label for the dynamic code
```
- `setIsDynamic(false)` resets `dynamicShortCode`
- `setContent(...)` resets `dynamicShortCode` (content changed, new code needed)
- `reset()` resets all three fields

**`src/stores/qrStore.test.ts`** — Add tests for new fields.

**`src/components/generator/InputPanel.tsx`** — After content input, when `inputType === 'url'`:
```tsx
{inputType === 'url' && (
  <div>
    <label>Dynamic Code</label>
    <ToggleSwitch checked={isDynamic} onChange={handleDynamicToggle} />
    {isDynamic && (
      <input placeholder="Label (optional)" value={dynamicLabel} onChange={...} />
      <div>QR will redirect via qrfo.link. Change destination later.</div>
    )}
  </div>
)}
```
- `handleDynamicToggle`: calls `requireAccess()` first, gates behind subscription
- Toggle hidden for non-URL input types

**`src/components/generator/Preview.tsx`** — Add `createDynamicCodeIfNeeded` callback:
```typescript
const createDynamicCodeIfNeeded = async (): Promise<string | null> => {
  const { isDynamic, dynamicShortCode, content, dynamicLabel } = useQrStore.getState();
  if (!isDynamic) return content;
  if (dynamicShortCode) return `https://qrfo.link/${dynamicShortCode}`;

  // Create code via Worker API
  const token = useAuthStore.getState().token;
  if (!token) { useAuthModalStore.getState().open(); return null; }

  const record = await workerApi.createCode(token, { destinationUrl: content, label: dynamicLabel || undefined });
  useQrStore.getState().setDynamicShortCode(record.shortCode);
  toast.success(`Dynamic code created: qrfo.link/${record.shortCode}`);
  return `https://qrfo.link/${record.shortCode}`;
};
```
- Each export handler (`handleExportPng`, `handleExportSvg`, `handleCopy`) calls this first
- If it returns `null`, abort export
- If it returns a URL different from `content`, temporarily set content for export, then restore
- Show "Dynamic: qrfo.link/abc123" badge below preview once code is created

**`src/components/generator/InputPanel.test.tsx`** — Tests: toggle visibility, feature gating, label input.
**`src/components/generator/Preview.test.tsx`** — Tests: dynamic code creation on export, reuse existing shortCode, auth gate, error handling.

---

## Key Patterns to Follow

| Pattern | Source file | How to replicate |
|---------|------------|-----------------|
| API client structure | `src/api/billing.ts` | Same `request<T>`, error class, `authHeaders`, exported object |
| Two-panel layout | `src/components/history/HistoryView.tsx` | Left `w-72` + right `flex-1`, same card/list/detail structure |
| Zustand store | `src/stores/qrStore.ts` | `create<T>((set, get) => ({...}))`, typed interface |
| Feature gating | `src/hooks/useFeatureAccess.ts` | `const { hasAccess, requireAccess } = useFeatureAccess('dynamic_codes')` |
| Hover effects | All components | JS `onMouseEnter`/`onMouseLeave`, NEVER CSS `:hover` |
| Toasts | Throughout | `toast.success(...)`, `toast.error(...)` from `sonner` |
| Styling | Throughout | Tailwind for layout, `style={{ color: 'var(--text-primary)' }}` for colors |
| Delete confirmation | `HistoryView.tsx:69` | `window.confirm('message')` |

## Verification

After each PR:
1. `npm run test` — all tests pass
2. `npm run typecheck` — clean
3. `npm run lint` — clean
4. `npm run dev:web` — manual smoke test:
   - Use `__dev.simulateSubscription()` in console
   - Navigate to Dynamic Codes tab
   - Create, edit, pause, delete codes (PRs 1-2)
   - View analytics (PR 3)
   - Use "Make Dynamic" toggle in generator (PR 4)
   - Use `__dev.simulateFreeTier()` to verify feature gate shows upsell
