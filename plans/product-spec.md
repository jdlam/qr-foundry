# QR Foundry — Product Specification

## App Name Ideas

- **QR Foundry** (craftsmanship connotation, memorable)
- QR Mint
- QR Press
- Codestamp

---

## 1. Pricing Model

| Tier | Price | Includes |
|------|-------|----------|
| **Free** | $0 | Basic QR generation (URL, text, WiFi, phone), basic customization (FG/BG color), PNG export, clipboard copy, limited history (10 codes) |
| **Pro Trial** | $0 for 7 days | All Pro features unlocked for 7 days after signup. Reverts to Free when trial expires. |
| **Pro** | ~$12-15 one-time | Full customization (logos, gradients, dot/eye styles), all export formats (PNG, SVG, PDF, EPS), batch CSV generation, QR scanning/import, saved templates, unlimited history, web asset pack |
| **Subscription** | ~$5-7/month | Everything in Pro + dynamic QR codes (changeable destinations), scan analytics dashboard, code management. Includes 25 active dynamic codes. |
| **Add-on** | TBD per pack | Additional dynamic code slots (e.g., buy 25 more) |

### Revenue per sale

| Channel | Pro (~$15) | Subscription (~$6/mo) |
|---|---|---|
| Mac App Store (15% commission) | ~$12.75 net | ~$5.10/mo net |
| Gumroad (10%) | ~$13.50 net | ~$5.40/mo net |
| Direct (Stripe ~3%) | ~$14.55 net | ~$5.82/mo net |
| Web app (Stripe ~3%) | ~$14.55 net | ~$5.82/mo net |

### 7-Day Pro Trial

Every new user gets a **free 7-day trial of Pro features** on signup. After 7 days:
- User reverts to Free tier (basic customization, PNG only)
- QR codes generated during the trial remain in history but advanced exports are locked
- App shows a clear "Your trial has ended — upgrade to Pro" prompt

**Trial does NOT include dynamic QR codes** — those require a separate Subscription purchase.

### Distribution

| Platform | Channel | Tiers available |
|---|---|---|
| macOS | Mac App Store | Free, Pro (IAP), Subscription (IAP) |
| macOS | Direct download (Gumroad) | Free, Pro (Gumroad), Subscription (Stripe) |
| Windows | Microsoft Store | Free, Pro (IAP), Subscription (IAP) |
| Windows | Direct download (Gumroad) | Free, Pro (Gumroad), Subscription (Stripe) |
| Linux | Direct download (Gumroad) | Free, Pro (Gumroad), Subscription (Stripe) |
| Web | `app.qr-foundry.com` | Free, Pro (Stripe), Subscription (Stripe) |

---

## 2. Feature Set

### Feature availability by tier

| Feature | Free | Pro | Subscription |
|---|---|---|---|
| QR generation (URL, text, WiFi, phone) | Yes | Yes | Yes |
| QR generation (vCard, email, SMS, geo, calendar) | No | Yes | Yes |
| Live preview | Yes | Yes | Yes |
| Basic colors (FG/BG) | Yes | Yes | Yes |
| Advanced customization (gradients, dot/eye styles) | No | Yes | Yes |
| Logo embedding | No | Yes | Yes |
| Error correction manual control | No | Yes | Yes |
| Transparent backgrounds | No | Yes | Yes |
| PNG export | Yes | Yes | Yes |
| SVG export | No | Yes | Yes |
| PDF export | No | Yes | Yes |
| EPS export | No | Yes | Yes |
| Clipboard copy | Yes | Yes | Yes |
| Web asset pack | No | Yes | Yes |
| Batch CSV generation | No | Yes | Yes |
| QR scanning/decoding | Yes | Yes | Yes |
| Built-in scan validation | Yes | Yes | Yes |
| History (limited to 10) | Yes | — | — |
| History (unlimited) | — | Yes | Yes |
| Saved templates | No | Yes | Yes |
| Dynamic QR codes | No | No | Yes |
| Scan analytics dashboard | No | No | Yes |
| Code management (pause/resume/edit destination) | No | No | Yes |

### QR Generation

| Feature | Details |
|---|---|
| Input types | URL, plain text, WiFi, phone (Free); + vCard, email, SMS, geo, calendar (Pro) |
| Live preview | Real-time QR updates as you type |
| Error correction | Manual L/M/Q/H selection with guidance (Pro) |
| Clipboard support | One-click copy to clipboard |

### Customization

| Feature | Details | Tier |
|---|---|---|
| Brand colors | Foreground/background color picker | Free |
| Gradient fills | Linear gradient across QR dots | Pro |
| Logo embedding | Drag-drop logo with placement options: center, individual corners, or all three finder eyes | Pro |
| Logo sizing | Adjustable 10-40% of QR code area with real-time preview | Pro |
| Logo shape | Square or circle mask with automatic padding | Pro |
| Dot styles | Square, rounded, dots, diamond | Pro |
| Eye/corner styles | Square, rounded, circle, leaf | Pro |
| Transparent background | PNG/SVG with alpha channel | Pro |

### Validation

| Feature | Details |
|---|---|
| Built-in scan validation | Renders QR to image, decodes it back, confirms content matches — one-click verify |
| Three-state feedback | Pass (scans clean), Marginal (scans but low confidence), Fail (can't decode) |
| Smart warnings | Proactive tips when logo size + EC level combo risks scanability |
| Auto-reset | Validation resets when any style or content changes, prompting re-check |
| Batch validation | Validates every code during batch generation, flags failures before export |

### Export

| Feature | Details | Tier |
|---|---|---|
| PNG export | Up to 4096x4096, multiple size presets | Free |
| SVG export | Vector output, infinitely scalable | Pro |
| PDF export | Print-ready with optional bleed/trim marks | Pro |
| EPS export | For professional print workflows | Pro |
| Web asset pack | Full favicon set + manifest.json + HTML meta tags | Pro |

### Power Features

| Feature | Details | Tier |
|---|---|---|
| Batch generation | Import CSV, generate multiple codes at once, export as ZIP | Pro |
| QR scanning/reading | Drag-drop or paste image to decode | Free |
| History | Searchable history of all generated codes (10 limit on Free, unlimited on Pro) | Free (limited) / Pro |
| Templates | Save and reuse brand style presets | Pro |

### Dynamic QR Codes (Subscription only)

| Feature | Details |
|---|---|
| Dynamic codes | QR encodes `qrfo.link/:shortCode` — destination can be changed anytime without reprinting |
| Code management | List, edit destination, pause/resume, delete from the app |
| Scan analytics | Per-code scan counts, geographic breakdown, traffic sources, time series |
| Analytics dashboard | Overview across all codes — top codes, total scans, country breakdown |

---

## 2b. UI Layout — Main Views

### Primary View: Generator

```
┌─────────────────────────────────────────────────────────────────────┐
│  QR Foundry                                          [_] [□] [x]     │
├──────────────────────┬──────────────────────────────────────────────┤
│                      │                                              │
│  INPUT               │            LIVE PREVIEW                      │
│  ┌────────────────┐  │                                              │
│  │ ○ URL          │  │         ┌──────────────────┐                 │
│  │ ○ Text         │  │         │                  │                 │
│  │ ○ WiFi         │  │         │    ## ## ##      │                 │
│  │ ○ vCard    Pro │  │         │    ##    ##      │                 │
│  │ ○ Email    Pro │  │         │    ## ## ##      │                 │
│  │ ○ SMS      Pro │  │         │       [LOGO]     │                 │
│  │ ○ Phone       │  │         │    ## ## ##      │                 │
│  │ ○ Geo      Pro │  │         │    ##    ##      │                 │
│  │ ○ Calendar Pro │  │         │    ## ## ##      │                 │
│  └────────────────┘  │         │                  │                 │
│                      │         └──────────────────┘                 │
│  ┌────────────────┐  │                                              │
│  │ Enter URL...   │  │     Size: 1024x1024  EC: Medium              │
│  └────────────────┘  │                                              │
│                      │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐        │
│  STYLE          Pro  │  │ PNG  │ │ SVG  │ │ PDF  │ │ Copy │        │
│  ┌────────────────┐  │  │      │ │ Pro  │ │ Pro  │ │      │        │
│  │ Dot: # * @ +  │  │  └──────┘ └──────┘ └──────┘ └──────┘        │
│  │ Eye: # * >    │  │                                              │
│  │ FG:  [######]  │  │  ┌──────────────────────────────┐            │
│  │ BG:  [######]  │  │  │  Upgrade to Pro — $14.99     │            │
│  │ Logo: [+drop]  │  │  └──────────────────────────────┘            │
│  └────────────────┘  │                                              │
│                      │                                              │
│  ERROR CORRECTION    │                                              │
│  [L] [M] [Q] [H] Pro│                                              │
│                      │                                              │
├──────────────────────┴──────────────────────────────────────────────┤
│  [Generator] [Dynamic Sub] [Batch Pro] [Scanner] [History] [Templates Pro] │
└─────────────────────────────────────────────────────────────────────┘
```

### Batch View (Pro)

```
┌─────────────────────────────────────────────────────────────────────┐
│  Batch Generation                                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────────────────────────────────────────┐                  │
│  │                                               │                  │
│  │   Drop CSV file here or click to browse       │                  │
│  │   Expected columns: content, [type], [label]  │                  │
│  │                                               │                  │
│  └───────────────────────────────────────────────┘                  │
│                                                                     │
│  Apply Style: [Current Template v]    Export As: [PNG v] [SVG v]   │
│                                                                     │
│  ┌──────┬──────────────────────┬────────┬────────┐                  │
│  │  #   │  Content             │  Type  │ Status │                  │
│  ├──────┼──────────────────────┼────────┼────────┤                  │
│  │  1   │  https://example.com │  URL   │   ok   │                  │
│  │  2   │  https://shop.io/p1  │  URL   │   ok   │                  │
│  │  3   │  +1-555-0123         │  Phone │   ok   │                  │
│  │  ...                                          │                  │
│  └───────────────────────────────────────────────┘                  │
│                                                                     │
│  ┌─────────────────────────────────────┐                            │
│  │  Generate All (24 codes)  [START]   │                            │
│  └─────────────────────────────────────┘                            │
│                                                                     │
│  Export: [Download ZIP]  [Export to Folder]                          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Scanner View

```
┌─────────────────────────────────────────────────────────────────────┐
│  QR Scanner                                                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────────────────────────────────────────┐                  │
│  │                                               │                  │
│  │   Drop QR code image here                     │                  │
│  │   or paste from clipboard (Cmd+V)             │                  │
│  │   or click to browse                          │                  │
│  │                                               │                  │
│  └───────────────────────────────────────────────┘                  │
│                                                                     │
│  Decoded Content:                                                   │
│  ┌───────────────────────────────────────────────┐                  │
│  │  https://example.com/landing-page             │                  │
│  │                                               │                  │
│  │  Type: URL                                    │                  │
│  │  EC Level: H (30%)                            │                  │
│  │  Version: 4                                   │                  │
│  └───────────────────────────────────────────────┘                  │
│                                                                     │
│  [Copy Content]  [Open in Browser]  [Re-generate]                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Web Asset Pack Export (Pro)

```
┌─────────────────────────────────────────────────────────────────────┐
│  Web Asset Pack                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Source Image: [logo.png ok]   URL: [https://mysite.com]            │
│                                                                     │
│  Generated Assets:                                                  │
│  ┌──────────────────────────────────────────────────────┐           │
│  │  ok  favicon.ico (16x16, 32x32, 48x48)              │           │
│  │  ok  favicon-16x16.png                               │           │
│  │  ok  favicon-32x32.png                               │           │
│  │  ok  apple-touch-icon.png (180x180)                  │           │
│  │  ok  android-chrome-192x192.png                      │           │
│  │  ok  android-chrome-512x512.png                      │           │
│  │  ok  mstile-150x150.png                              │           │
│  │  ok  safari-pinned-tab.svg                           │           │
│  │  ok  site.webmanifest                                │           │
│  │  ok  browserconfig.xml                               │           │
│  │  ok  HTML <head> snippet                             │           │
│  └──────────────────────────────────────────────────────┘           │
│                                                                     │
│  [Download ZIP]  [Copy HTML Snippet]                                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Technical Architecture

### 3.1 Stack

```
┌─────────────────────────────────────────────┐
│                  QR Foundry                    │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │          Frontend (Webview)         │    │
│  │                                     │    │
│  │  React + TypeScript                 │    │
│  │  Tailwind CSS                       │    │
│  │  Vite (bundler)                     │    │
│  │                                     │    │
│  │  QR Libraries:                      │    │
│  │  +-- qr-code-styling (render/style) │    │
│  │  +-- qrcode (core generation)       │    │
│  │  +-- jsQR (scanning/decoding)       │    │
│  │                                     │    │
│  │  UI Libraries:                      │    │
│  │  +-- @radix-ui (primitives)         │    │
│  │  +-- react-colorful (color picker)  │    │
│  │                                     │    │
│  └──────────────┬──────────────────────┘    │
│                 │ Tauri IPC (invoke/events)  │
│  ┌──────────────┴──────────────────────┐    │
│  │          Backend (Rust)             │    │
│  │                                     │    │
│  │  Tauri Core                         │    │
│  │  +-- File system access             │    │
│  │  +-- Native dialogs (save/open)     │    │
│  │  +-- Clipboard integration          │    │
│  │  +-- System tray (optional)         │    │
│  │  +-- Auto-updater                   │    │
│  │                                     │    │
│  │  Image Processing:                  │    │
│  │  +-- image-rs (resize/format)       │    │
│  │  +-- resvg (SVG rendering)          │    │
│  │  +-- rqrr (QR decode for validation)│    │
│  │  +-- ico (favicon generation)       │    │
│  │                                     │    │
│  │  Data:                              │    │
│  │  +-- serde_json (serialization)     │    │
│  │  +-- csv (batch parsing)            │    │
│  │  +-- SQLite (history/templates)     │    │
│  │                                     │    │
│  └─────────────────────────────────────┘    │
│                                             │
├─────────────────────────────────────────────┤
│  Platform: macOS (primary), Windows, Linux  │
│  + Web (app.qr-foundry.com)                 │
│  Bundle: ~10-15MB (desktop)                 │
│  Min macOS: 12.0 (Monterey)                │
└─────────────────────────────────────────────┘
```

The web app (`app.qr-foundry.com`) shares the same React frontend codebase but runs without Tauri. Platform-specific features (file system, OS keychain, native dialogs) are abstracted behind adapters in `src/platform/`. See `ARCHITECTURE.md` for the code sharing strategy.

### 3.2 Project Structure

```
qr-foundry-app/
├── src-tauri/                   # Rust backend (desktop only)
│   ├── src/
│   │   ├── main.rs              # Tauri entry point
│   │   ├── commands/
│   │   │   ├── mod.rs
│   │   │   ├── export.rs        # File export (PNG/SVG/PDF/EPS)
│   │   │   ├── validate.rs      # QR validation: render -> decode -> compare
│   │   │   ├── batch.rs         # CSV parsing + batch generation + validation
│   │   │   ├── scanner.rs       # QR decode from image
│   │   │   ├── favicon.rs       # Web asset pack generation
│   │   │   ├── history.rs       # SQLite CRUD for history
│   │   │   └── settings.rs      # App settings management
│   │   ├── db/
│   │   │   ├── mod.rs
│   │   │   ├── schema.sql       # History + templates tables
│   │   │   └── migrations/
│   │   └── utils/
│   │       ├── image.rs         # Image processing helpers
│   │       └── fs.rs            # File system helpers
│   ├── Cargo.toml
│   ├── tauri.conf.json          # Tauri configuration
│   ├── icons/                   # App icons
│   └── Info.plist               # macOS metadata
│
├── src/                         # React frontend (shared between desktop + web)
│   ├── main.tsx                 # React entry
│   ├── App.tsx                  # Root layout + routing
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx      # Navigation tabs
│   │   │   ├── TitleBar.tsx     # Custom window title bar
│   │   │   └── StatusBar.tsx    # Bottom info bar
│   │   ├── generator/
│   │   │   ├── InputPanel.tsx   # Type selector + input fields
│   │   │   ├── StylePanel.tsx   # Customization controls
│   │   │   ├── Preview.tsx      # Live QR preview canvas
│   │   │   ├── ExportBar.tsx    # Export format buttons
│   │   │   └── inputs/
│   │   │       ├── UrlInput.tsx
│   │   │       ├── TextInput.tsx
│   │   │       ├── WifiInput.tsx
│   │   │       ├── VCardInput.tsx
│   │   │       ├── EmailInput.tsx
│   │   │       ├── SmsInput.tsx
│   │   │       ├── PhoneInput.tsx
│   │   │       ├── GeoInput.tsx
│   │   │       └── CalendarInput.tsx
│   │   ├── batch/
│   │   │   ├── BatchView.tsx
│   │   │   ├── CsvDropzone.tsx
│   │   │   └── BatchTable.tsx
│   │   ├── scanner/
│   │   │   ├── ScannerView.tsx
│   │   │   └── DecodeResult.tsx
│   │   ├── history/
│   │   │   ├── HistoryView.tsx
│   │   │   └── HistoryItem.tsx
│   │   ├── templates/
│   │   │   ├── TemplatesView.tsx
│   │   │   └── TemplateCard.tsx
│   │   ├── dynamic/             # Subscription-only views
│   │   │   ├── DynamicCodesView.tsx
│   │   │   ├── CodeDetailView.tsx
│   │   │   └── AnalyticsView.tsx
│   │   ├── web-assets/
│   │   │   └── WebAssetView.tsx
│   │   └── shared/
│   │       ├── ColorPicker.tsx
│   │       ├── DotStylePicker.tsx
│   │       ├── EyeStylePicker.tsx
│   │       ├── LogoUploader.tsx
│   │       └── FeatureGate.tsx  # Shows lock/upsell for gated features
│   ├── hooks/
│   │   ├── useQrGenerator.ts    # Core QR generation logic
│   │   ├── useExport.ts         # Export handling via Tauri IPC
│   │   ├── useValidation.ts     # QR validation via Tauri IPC
│   │   ├── useHistory.ts        # History CRUD
│   │   ├── useTemplates.ts      # Template CRUD
│   │   └── usePlan.ts           # Fetch plan tier from Billing API
│   ├── api/                     # Shared API clients
│   │   ├── billing.ts           # Billing API client (auth, plan, purchases)
│   │   └── worker.ts            # Worker API client (CRUD, analytics)
│   ├── platform/                # Platform-specific adapters
│   │   ├── tauri/
│   │   │   ├── auth.ts          # OS keychain storage
│   │   │   ├── filesystem.ts    # Native file dialogs
│   │   │   └── clipboard.ts     # Tauri clipboard API
│   │   └── web/
│   │       ├── auth.ts          # Cookie/localStorage storage
│   │       ├── filesystem.ts    # Browser download API
│   │       └── clipboard.ts     # Browser Clipboard API
│   ├── stores/
│   │   ├── qrStore.ts           # Zustand store for QR state
│   │   └── appStore.ts          # App-wide state (plan tier, prefs)
│   ├── lib/
│   │   ├── qr.ts               # QR generation wrapper
│   │   ├── validators.ts        # Input validation per type
│   │   └── formatters.ts        # vCard/WiFi/etc string builders
│   ├── types/
│   │   ├── qr.ts               # QR config types
│   │   └── templates.ts        # Template types
│   └── styles/
│       └── global.css           # Tailwind + custom styles
│
├── package.json
├── tsconfig.json
├── vite.config.ts               # Desktop (Tauri) build config
├── vite.config.web.ts           # Web build config
├── tailwind.config.ts
└── README.md
```

### 3.3 Data Flow

```
User Input                    QR Generation                   Export
---------                    --------------                   ------

┌──────────┐   onChange    ┌───────────────┐   canvas      ┌──────────┐
│  Input   │ ---------->  │  qr-code-     │ ---------->   │  Preview │
│  Fields  │              │  styling      │   render      │  Canvas  │
└──────────┘              └───────────────┘               └────┬─────┘
                                │                              │
┌──────────┐   onChange         │                              │
│  Style   │ ──────────────────┘                              │
│  Controls│                                                   │
└──────────┘                                                   │
                                                               │
                                                    ┌──────────┴──────────┐
                                                    │                     │
                                                    v                     v
                                              ┌───────────┐       ┌───────────┐
                                              │ Validate  │       │  Export   │
                                              │ (Rust)    │       │  (Rust)   │
                                              └─────┬─────┘       └─────┬─────┘
                                                    │                   │
                                              ┌─────┴─────┐     ┌──────┴──────┐
                                              │  Render   │     │ PNG/SVG/PDF │
                                              │  to image │     │  to disk    │
                                              └─────┬─────┘     └──────┬──────┘
                                                    │                  │
                                              ┌─────┴─────┐     ┌─────┴──────┐
                                              │  Decode   │     │ Native     │
                                              │  (jsQR)   │     │ Save Dialog│
                                              └─────┬─────┘     └────────────┘
                                                    │
                                              ┌─────┴─────┐
                                              │  Compare  │
                                              │  content  │
                                              └─────┬─────┘
                                                    │
                                              ┌─────┴─────┐
                                              │  Pass     │
                                              │  Warn     │
                                              │  Fail     │
                                              └───────────┘

Validation Pipeline (Rust-side):
1. Render QR with full styling (colors, logo, dots) to in-memory PNG
2. Feed rendered PNG to QR decoder (rqrr crate)
3. Compare decoded content with original input content
4. Assess confidence: exact match = pass, partial/slow decode = warn, no decode = fail
5. Return ValidationResult with suggestions if warn/fail
```

### 3.4 Database Schema (SQLite)

```sql
-- History of generated QR codes
CREATE TABLE history (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    content     TEXT NOT NULL,           -- The encoded content
    type        TEXT NOT NULL,           -- url, text, wifi, vcard, etc.
    label       TEXT,                    -- User-defined label
    style_json  TEXT,                    -- JSON blob of style config
    thumbnail   BLOB,                   -- Small PNG preview
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Saved style templates
CREATE TABLE templates (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    style_json  TEXT NOT NULL,           -- Full style configuration
    preview     BLOB,                   -- Template preview image
    is_default  BOOLEAN DEFAULT FALSE,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- App settings
CREATE TABLE settings (
    key         TEXT PRIMARY KEY,
    value       TEXT NOT NULL
);
```

### 3.5 Key TypeScript Types

```typescript
// QR content types
type QrType =
  | 'url' | 'text' | 'wifi' | 'vcard' | 'email'
  | 'sms' | 'phone' | 'geo' | 'calendar';

// Dot style options
type DotStyle = 'square' | 'rounded' | 'dots' | 'diamond';
type EyeStyle = 'square' | 'rounded' | 'circle' | 'leaf';

// Error correction levels
type ErrorCorrection = 'L' | 'M' | 'Q' | 'H';

// Export formats
type ExportFormat = 'png' | 'svg' | 'pdf' | 'eps';

// Logo placement positions
type LogoPosition = 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'all-corners';

// Validation result
type ValidationState = 'idle' | 'validating' | 'pass' | 'warn' | 'fail';

interface ValidationResult {
  state: ValidationState;
  decodedContent?: string;       // What was actually decoded
  contentMatch: boolean;          // Does decoded content match input?
  confidence: number;             // 0-1 scan confidence score
  message: string;                // Human-readable feedback
  suggestions?: string[];         // Tips to improve scanability
}

// Core QR configuration
interface QrConfig {
  content: string;
  type: QrType;
  style: QrStyle;
  errorCorrection: ErrorCorrection;
  size: number;            // pixels
}

interface QrStyle {
  dotStyle: DotStyle;
  eyeStyle: EyeStyle;
  foreground: string;      // hex color
  background: string;      // hex color
  gradient?: {
    type: 'linear' | 'radial';
    colors: [string, string];
    angle?: number;
  };
  logo?: LogoConfig;
  transparentBg: boolean;
}

interface LogoConfig {
  src: string;              // base64 or file path
  position: LogoPosition;   // where to place the logo
  size: number;             // percentage of QR area (10-40)
  margin: number;           // padding around logo in px
  shape: 'square' | 'circle';
}

// Template
interface Template {
  id: number;
  name: string;
  style: QrStyle;
  preview?: string;        // base64 thumbnail
  isDefault: boolean;
}

// Batch item (now includes validation)
interface BatchItem {
  row: number;
  content: string;
  type: QrType;
  label?: string;
  status: 'pending' | 'generating' | 'validating' | 'done' | 'error';
  validation?: ValidationResult;
  error?: string;
}

// WiFi-specific input
interface WifiConfig {
  ssid: string;
  password: string;
  encryption: 'WPA' | 'WEP' | 'nopass';
  hidden: boolean;
}

// vCard input
interface VCardConfig {
  firstName: string;
  lastName: string;
  organization?: string;
  title?: string;
  email?: string;
  phone?: string;
  url?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

// Plan tier (from Billing API)
type PlanTier = 'free' | 'pro_trial' | 'pro' | 'subscription';

interface UserPlan {
  tier: PlanTier;
  features: string[];           // list of unlocked feature keys
  maxCodes: number;             // 0 for non-subscribers
  trialDaysRemaining?: number;  // only present during pro_trial
}
```

### 3.6 Tauri IPC Commands (Rust -> JS bridge)

```
Commands exposed to frontend:
-----------------------------

export_png(config, path)      -> Save QR as PNG to disk
export_svg(config, path)      -> Save QR as SVG to disk
export_pdf(config, path)      -> Save QR as PDF to disk
export_eps(config, path)      -> Save QR as EPS to disk

validate_qr(config)           -> Render QR -> decode -> compare content -> return ValidationResult
validate_batch(items, style)  -> Validate all batch items, return results per row

batch_parse_csv(path)         -> Parse CSV, return BatchItem[]
batch_generate(items, style)  -> Generate all (with validation), return zip path

scan_image(path)              -> Decode QR from image file
scan_clipboard()              -> Decode QR from clipboard image

generate_favicon_pack(image, url) -> Generate full web asset pack

history_list(limit, offset)   -> Paginated history
history_save(item)            -> Save to history
history_delete(id)            -> Remove from history

template_list()               -> All templates
template_save(template)       -> Create/update template
template_delete(id)           -> Remove template

get_settings()                -> Load app settings
set_setting(key, value)       -> Save setting
```

---

## 4. Distribution Strategy

### 4.1 Platforms & Channels

| Platform | Channel | Free | Pro | Subscription |
|---|---|---|---|---|
| macOS | Mac App Store | Yes | IAP ~$15 | IAP ~$6/mo |
| macOS | Direct (Gumroad) | Yes | Gumroad ~$15 | Stripe ~$6/mo |
| Windows | Microsoft Store | Yes | IAP ~$15 | IAP ~$6/mo |
| Windows | Direct (Gumroad) | Yes | Gumroad ~$15 | Stripe ~$6/mo |
| Linux | Direct (Gumroad) | Yes | Gumroad ~$15 | Stripe ~$6/mo |
| Web | app.qr-foundry.com | Yes | Stripe ~$15 | Stripe ~$6/mo |

### 4.2 Auth & Licensing

- **Free tier**: No account required. Works fully offline.
- **Pro purchase (desktop)**: Mac App Store receipt or Gumroad license key validated once.
- **Pro purchase (web)**: Account required. Billing API tracks purchase.
- **Subscription**: Account required on all platforms. Billing API manages subscription state.
- **Trial**: Auto-starts on account creation. No payment method required.

### 4.3 Marketing Funnel

```
            GitHub (CLI tool, open source)
                        │
                        v
            Blog posts (SEO: "branded QR codes",
            "QR code sizes for print", etc.)
                        │
                        v
            Landing page with live demo
            (interactive preview, can generate Free-tier QRs)
                        │
                        v
            Product Hunt launch
                        │
                   ┌────┴─────┐
                   v          v
            App Store     Web App
            listing       (instant access,
            (desktop)      no install)
```

---

## 5. Development Phases

Detailed per-service plans live in `plans/`. Below is a summary of what's been completed and what's next.

### Desktop App: Core (COMPLETE)

- [x] Tauri project scaffold with React + TypeScript
- [x] Basic QR generation (URL, text, WiFi, phone)
- [x] Live preview canvas
- [x] PNG export with native save dialog
- [x] Clipboard copy
- [x] Clean, native-feeling UI
- [x] Style customization (colors, dots, eyes)
- [x] Logo embedding with drag-drop
- [x] Gradient fills
- [x] SVG export via Rust backend
- [ ] PDF export via Rust backend (not implemented)
- [ ] EPS export via Rust backend (not implemented)
- [x] Error correction manual control
- [x] Transparent backgrounds
- [x] vCard, email, SMS, geo, calendar inputs
- [x] Batch generation from CSV
- [x] History (SQLite)
- [x] Templates (save/load styles)
- [x] QR scanner/decoder
- [x] QR validation (scan and verify content matches)

### Remaining Work (see per-service plans)

- **Worker** — Quota enforcement, scan analytics API, infrastructure. See [`plans/worker.md`](plans/worker.md).
- **App (Desktop + Web)** — Auth integration, feature gating, dynamic code UI, analytics dashboard, platform abstraction, web deployment. See [`plans/app.md`](plans/app.md).
- **Billing API** — Scaffold, auth, trial management, Stripe, quota management, plan tier API. See [`plans/billing-api.md`](plans/billing-api.md).
- **Marketing Site** — Landing page, pricing page, SEO, deployment. See [`plans/marketing-site.md`](plans/marketing-site.md).

### Future Features (Backlog)

#### Settings/Preferences System

- [ ] Create settings infrastructure (Tauri store or SQLite)
- [ ] Native macOS Preferences menu item (Cmd+,)
- [ ] Settings window or in-app settings tab

**Proposed settings:**

- Default export format (PNG/SVG)
- Default export size (512px, 1024px, 2048px, 4096px)
- Default error correction level (L/M/Q/H)
- Theme preference (dark/light/system)
- Default template to apply on startup
- History settings:
  - Auto-save generated QRs to history (on/off)
  - History retention period (7 days, 30 days, forever)
  - Clear history on app quit (on/off)
- Batch export settings:
  - Default output folder
  - Filename pattern template

#### Native App Menu

- [ ] Implement Tauri native menu system
- [ ] File menu: New QR, Open (history item), Export, Export As...
- [ ] Edit menu: Undo, Redo, Cut, Copy, Paste, Select All
- [ ] View menu: Toggle sidebar, Zoom controls
- [ ] QR menu: Validate, Copy to Clipboard, Save to History
- [ ] Window menu: Standard window controls
- [ ] Help menu: Documentation, Check for Updates, About

#### Other Future Ideas

- [ ] Keyboard shortcuts customization
- [ ] iCloud sync for templates and history
- [ ] Quick Actions / Shortcuts integration (macOS)
- [ ] Menu bar quick-generate mode
- [ ] PDF/EPS export formats
