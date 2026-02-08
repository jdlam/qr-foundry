# QR Foundry Marketing Site — Design Mockups

Six distinct design directions. Each is intentionally unconventional — none follow the
standard SaaS hero-features-pricing-footer template. The core message across all:
**Static QR codes are free. No signup. No watermark. Just make one.**

---

## Mockup 1: "The Workshop"

**Concept:** The landing page IS the product. No hero section, no feature grid, no
scrolling past marketing fluff. You land on the page and you're already inside a
fully functional QR code generator. The marketing happens around and below the tool,
not instead of it.

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  QR Foundry                              Pricing  |  Blog  │  ← minimal nav, almost invisible
├─────────────────────────────────────────────────────────────┤
│                                                             │
│           ┌──────────────────────────────────┐              │
│           │                                  │              │
│           │     [ Enter any URL or text ]     │              │
│           │                                  │              │
│           │     ┌────────────┐               │              │
│           │     │            │               │              │
│           │     │  QR CODE   │   Style ▾     │              │
│           │     │  PREVIEW   │   Color ▾     │              │
│           │     │            │   Logo  ▾     │              │
│           │     └────────────┘               │              │
│           │                                  │              │
│           │     [ Download PNG ]  [ Copy ]    │              │
│           │                                  │              │
│           └──────────────────────────────────┘              │
│                                                             │
│           Free. No signup. No watermark.                     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  As you scroll, the generator stays pinned (sticky) and     │
│  content panels slide up beside/below it:                   │
│                                                             │
│  ┌─────────────────────┐  ┌──────────────────────────────┐ │
│  │                     │  │                              │ │
│  │  STICKY QR          │  │  "Need more?"                │ │
│  │  GENERATOR          │  │                              │ │
│  │  (still usable)     │  │  SVG & PDF exports           │ │
│  │                     │  │  Logo embedding              │ │
│  │                     │  │  Batch generation            │ │
│  │                     │  │  Custom dot styles           │ │
│  │                     │  │                              │ │
│  │                     │  │  → Get the desktop app       │ │
│  │                     │  │  → Try Pro free for 7 days   │ │
│  │                     │  │                              │ │
│  └─────────────────────┘  └──────────────────────────────┘ │
│                                                             │
│  ┌─────────────────────┐  ┌──────────────────────────────┐ │
│  │                     │  │                              │ │
│  │  (generator still   │  │  "Need dynamic codes?"       │ │
│  │   visible, dimmed)  │  │                              │ │
│  │                     │  │  Change destinations after   │ │
│  │                     │  │  printing. Track scans.      │ │
│  │                     │  │  Analytics dashboard.        │ │
│  │                     │  │                              │ │
│  │                     │  │  → Start subscription        │ │
│  │                     │  │                              │ │
│  └─────────────────────┘  └──────────────────────────────┘ │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  Footer: Links  |  Blog  |  Legal                           │
└─────────────────────────────────────────────────────────────┘
```

### Why it works
- **Zero friction.** Visitor arrives, sees a tool, uses it. No convincing needed.
- **The product sells itself.** Once someone generates a free QR code, they see how
  easy it is. They're already a user before they even know it.
- **SEO gold.** The page IS a "free QR code generator" — the exact thing people search for.
  Google can see the interactive tool and rich content.
- **Scroll-to-upsell.** Free features are front and center. Paid features reveal as you
  scroll deeper, naturally matching the user's growing interest.

### Visual style
- Clean white background, generous whitespace
- Single accent color (amber/orange from the app)
- The generator card has a subtle shadow and rounded corners — it feels like a floating tool
- Typography: one bold sans-serif for headings, one clean sans-serif for body
- Below-fold sections use a very subtle warm gray background to differentiate

### Technical notes
- The QR generator is an Astro island (`client:visible` React component)
- Uses `qr-code-styling` library (same as the desktop app)
- Only loads JS for the generator — rest is static HTML/CSS
- Generator input doubles as the page's primary interactive element for engagement metrics

---

## Mockup 2: "The Matrix"

**Concept:** The entire page is built from QR code visual language. The background is
a living grid of QR-code dots. Content appears in "windows" punched through the dot
matrix. Navigation uses dot patterns. The page itself looks like a QR code when
zoomed out. It's a statement: "We ARE QR codes."

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│ ░░░░░┌───────────────────────────────────────┐░░░░░░░░░░░░░│
│ ░░░░░│                                       │░░░░░░░░░░░░░│
│ ░░░░░│  QR FOUNDRY                           │░░░░░░░░░░░░░│
│ ░░░░░│                                       │░░░░░░░░░░░░░│
│ ░░░░░│  Free QR codes.                       │░░░░░░░░░░░░░│
│ ░░░░░│  Actually free.                       │░░░░░░░░░░░░░│
│ ░░░░░│                                       │░░░░░░░░░░░░░│
│ ░░░░░│        [ Make one now → ]             │░░░░░░░░░░░░░│
│ ░░░░░│                                       │░░░░░░░░░░░░░│
│ ░░░░░└───────────────────────────────────────┘░░░░░░░░░░░░░│
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│                                                             │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│   │              │  │              │  │              │     │
│   │  ▪▪▪▪▪▪▪▪   │  │  ▪ ▪ ▪ ▪ ▪  │  │  ◆◆◆◆◆◆◆◆   │     │
│   │  ▪▪▪▪▪▪▪▪   │  │  ▪ ▪ ▪ ▪ ▪  │  │  ◆◆◆◆◆◆◆◆   │     │
│   │  ▪▪▪▪▪▪▪▪   │  │  ▪ ▪ ▪ ▪ ▪  │  │  ◆◆◆◆◆◆◆◆   │     │
│   │              │  │              │  │              │     │
│   │  9 QR types  │  │  Custom      │  │  Your logo   │     │
│   │  All free    │  │  colors &    │  │  embedded    │     │
│   │              │  │  dot styles  │  │              │     │
│   └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│                                                             │
│   ┌────────────────────────────────────────────────────┐    │
│   │                                                    │    │
│   │   [ Enter URL ] → [  ████  ] → [ Download ]       │    │
│   │                     ████                           │    │
│   │                     ████     Three steps.          │    │
│   │                              No account.           │    │
│   │                                                    │    │
│   └────────────────────────────────────────────────────┘    │
│                                                             │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│   PRICING    │    BLOG    │    DOWNLOAD    │    LEGAL       │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
└─────────────────────────────────────────────────────────────┘
```

### Why it works
- **Instantly memorable.** No other QR code site looks like this. The visual identity
  IS the product itself.
- **Brand cohesion.** The dot patterns, finder eyes, and module grid become reusable
  design elements across the entire brand.
- **Scroll as reveal.** The dot matrix background subtly shifts/animates as you scroll,
  creating depth and a sense of discovery.

### Visual style
- Background: animated dot grid in very light gray on white (or dark mode: soft dots on near-black)
- Content windows are clean white/black cards "cut out" of the matrix
- The three finder-eye squares from a QR code become navigation anchors or section markers
- Feature cards each display a different dot style (square, rounded, dots, diamond) — showcasing the product's customization options
- Monospace font for headings, clean sans-serif for body

### Technical notes
- Dot grid is pure CSS (grid of small squares with opacity transitions)
- NO canvas needed for the background — CSS grid + custom properties
- Gentle parallax on the dot grid via CSS `transform: translateY()` on scroll
- Lightweight: the dots are just styled `<div>` elements or a CSS background pattern
- Fully static except for the QR generator island

---

## Mockup 3: "The Broadsheet"

**Concept:** A newspaper/editorial layout. Giant bold serif typography. Content in
columns. The "headline" is the value proposition. This is the anti-SaaS-landing-page.
No gradients, no illustrations, no floating screenshots. Just authoritative type,
dense information, and a clear call to action. Treats QR codes as serious tools,
not toys.

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│ THE QR FOUNDRY                         Est. 2026  No. 001  │
│─────────────────────────────────────────────────────────────│
│                                                             │
│  ████████████████████████████████████████████████████████   │
│  █                                                    █   │
│  █    FREE QR CODES.                                  █   │
│  █    NO CATCH.                                       █   │
│  █                                                    █   │
│  ████████████████████████████████████████████████████████   │
│                                                             │
│─────────────────────────────────────────────────────────────│
│                                                             │
│  Generate any QR code,     │  WHAT YOU GET FOR $0:          │
│  download it as PNG,       │                                │
│  and use it anywhere.      │  ▪ URL, text, WiFi, phone,    │
│  No account. No limit.     │    vCard, email, SMS, geo,    │
│  No watermark.             │    calendar QR codes          │
│                            │  ▪ Color customization        │
│  We make money when you    │  ▪ PNG export                 │
│  need advanced features.   │  ▪ Clipboard copy             │
│  Most people never will.   │  ▪ QR scanner/decoder         │
│  That's fine by us.        │  ▪ History (10 recent)        │
│                            │                                │
│  [GENERATE A QR CODE →]    │  No signup required.           │
│                            │                                │
│────────────────────────────┼────────────────────────────────│
│                            │                                │
│  FOR PROFESSIONALS         │  FOR BUSINESSES                │
│  ──────────────────        │  ─────────────                 │
│                            │                                │
│  Pro  ·  ~$15 once         │  Subscription  ·  ~$6/mo      │
│                            │                                │
│  Custom logos, gradients,  │  Everything in Pro, plus       │
│  dot styles. SVG & PDF     │  dynamic QR codes that you    │
│  export. Batch generation  │  can update after printing.   │
│  from CSV. Templates.      │  Scan analytics. Up to 25     │
│  Unlimited history.        │  active codes managed from    │
│                            │  a dashboard.                  │
│  [TRY FREE FOR 7 DAYS]    │                                │
│                            │  [START SUBSCRIPTION]          │
│                            │                                │
│─────────────────────────────────────────────────────────────│
│  COLUMNS · FEATURES · BLOG                                  │
│─────────────────────────────────────────────────────────────│
│                            │                                │
│  How to Create Branded     │  Static vs Dynamic QR Codes:  │
│  QR Codes for Your         │  Which Do You Need?           │
│  Business                  │                                │
│                            │  Most QR codes don't need     │
│  A guide to making QR      │  to change after printing.    │
│  codes that match your     │  Here's how to decide...      │
│  brand identity...         │                                │
│                            │  → Read more                  │
│  → Read more               │                                │
│                            │                                │
│─────────────────────────────────────────────────────────────│
│  QR Foundry · qr-foundry.com · Download · Blog · Legal     │
└─────────────────────────────────────────────────────────────┘
```

### Why it works
- **Authority and trust.** The newspaper aesthetic signals reliability. This isn't a
  fly-by-night startup — it's a tool you can depend on.
- **Information density.** Visitors get all the information they need without endless
  scrolling. Everything is on "the front page."
- **SEO natural fit.** Newspaper layouts are inherently text-heavy and well-structured —
  exactly what search engines love. Headings, columns, and article teasers are all
  naturally keyword-rich.
- **Differentiation.** Every QR code site looks the same (blue gradients, floating phone
  mockups, "hero-features-pricing" layout). This looks like nothing else in the space.

### Visual style
- Off-white / ivory background (#FAFAF5), deep black text
- Large serif font for headlines (e.g., Playfair Display, Newsreader)
- Clean sans-serif for body text (e.g., Inter, system-ui)
- Thin black horizontal rules between sections (1px solid)
- Column layout using CSS grid (2-3 columns, responsive to single on mobile)
- Feature list uses typographic bullets (▪) not emoji or icons
- CTA buttons are simple bordered rectangles with uppercase text
- No images — just type, rules, and whitespace

### Technical notes
- Nearly zero JavaScript (just the QR generator island)
- Extremely fast — almost no assets to load
- Perfect for SEO: semantic HTML with natural heading hierarchy
- Blog excerpts on the landing page create internal links
- Newspaper "masthead" naturally contains site name + keywords

---

## Mockup 4: "The Playground"

**Concept:** An interactive, physics-based canvas where QR codes are living objects.
When you visit the page, a few QR codes are already bouncing gently around the
screen. You can grab them, fling them, change their colors. Clicking "Make your own"
drops a new QR code into the playground. Playful, tactile, delightful. The page
is a toy that happens to be a marketing site.

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│      QR Foundry                     Pricing  |  Download    │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│          ┌───┐                                              │
│          │QR │ ←  (bouncing gently)     ┌───┐              │
│          │   │                          │QR │              │
│          └───┘         ┌───┐            │   │              │
│                        │QR │            └───┘              │
│     Free QR codes.     │   │                                │
│                        └───┘       ┌───┐                   │
│     Grab one.                      │QR │                   │
│                                    │   │                   │
│                                    └───┘                   │
│         ┌─────────────────────────────────┐                 │
│         │                                 │                 │
│         │  [ Type a URL or any text... ]  │                 │
│         │                                 │                 │
│         │        [ Make one ↓ ]           │                 │
│         │                                 │                 │
│         └─────────────────────────────────┘                 │
│                                                             │
│     (A new QR code drops into the canvas with a             │
│      satisfying bounce when you click "Make one")           │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Tap a QR code in the playground to:                        │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Download │  │  Change  │  │  Add a   │  │  Share   │   │
│  │   PNG    │  │  color   │  │   logo   │  │  link    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  NEED MORE POWER?                                           │
│                                                             │
│  Pro ($15 once)          Subscription ($6/mo)               │
│  ───────────────         ─────────────────                  │
│  SVG, PDF export         Dynamic QR codes                   │
│  Batch from CSV          Scan analytics                     │
│  Custom dot styles       25 active codes                    │
│  Templates               Dashboard                          │
│                                                             │
│  Both include a 7-day free trial.                           │
│                                                             │
│  [Download App]     [Try in Browser]                        │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  Footer                                                     │
└─────────────────────────────────────────────────────────────┘
```

### Why it works
- **Delight.** People remember how something made them feel. A physics playground is
  surprising and fun — visitors will share it.
- **Try before you buy (accidentally).** By the time someone realizes they've been
  playing with the product for 30 seconds, they've already generated a QR code.
- **Virality potential.** "Have you seen this QR code site where they bounce around?"
  Word of mouth.
- **Keeps engagement high.** Average time on page skyrockets when people can interact.

### Visual style
- Light background with very subtle grid lines (like graph paper)
- QR codes are rendered at various sizes with different styles (showcasing customization)
- Each QR code has a subtle drop shadow that grows when "grabbed"
- Warm, playful color palette — amber, coral, teal accents
- Rounded, friendly typography (e.g., DM Sans, Nunito)
- Micro-interactions everywhere: hover states, click feedback, drag physics
- The input field has a playful "dropping" animation when the QR code is created

### Technical notes
- Physics engine: lightweight library like matter.js or custom spring physics
- QR codes pre-generated as SVG elements (not canvas) for interaction
- The physics canvas is the Astro island — lazy-loaded but visible immediately via
  CSS placeholder animation
- Below-fold content is fully static HTML/CSS — no JS penalty
- Mobile: QR codes respond to touch/tilt (optional: device orientation API)
- SEO: all text content is in static HTML below the canvas, fully crawlable

---

## Mockup 5: "The Terminal"

**Concept:** Dark background, monospace everything, terminal-aesthetic. The page
looks like a developer's workstation. Content "types out" as you scroll. The QR
generator interface looks like a command prompt. This appeals to the technically
minded and stands in stark contrast to every pastel-gradient SaaS page.

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  $ qr-foundry --version                                    │
│  v1.0.0                                                    │
│                                                             │
│  $ qr-foundry --help                                       │
│                                                             │
│  QR Foundry — Free QR code generator                       │
│                                                             │
│  USAGE:                                                     │
│    qr-foundry <url>           Generate a QR code            │
│    qr-foundry --style         Customize appearance          │
│    qr-foundry --export        Download PNG/SVG/PDF          │
│    qr-foundry --batch         Generate from CSV             │
│    qr-foundry --scan          Decode a QR image             │
│                                                             │
│  FREE TIER:                                                 │
│    ✓ All 9 QR types (URL, WiFi, vCard, phone, ...)         │
│    ✓ Basic color customization                              │
│    ✓ PNG export                                             │
│    ✓ No signup required                                     │
│    ✓ No watermark                                           │
│                                                             │
│  $ qr-foundry https://example.com                          │
│  ░                                                          │
│                                                             │
│  ┌─────────────────────────────┐                            │
│  │                             │                            │
│  │   ▓▓▓▓▓▓▓ ▓   ▓▓▓▓▓▓▓     │  ← QR code renders       │
│  │   ▓     ▓ ▓▓▓ ▓     ▓     │     after "command"        │
│  │   ▓ ▓▓▓ ▓   ▓ ▓ ▓▓▓ ▓     │     is entered            │
│  │   ▓     ▓ ▓ ▓ ▓     ▓     │                            │
│  │   ▓▓▓▓▓▓▓ ▓ ▓ ▓▓▓▓▓▓▓     │                            │
│  │           ▓ ▓               │                            │
│  │   ▓▓ ▓ ▓▓▓▓▓▓▓ ▓▓▓ ▓      │                            │
│  │                             │                            │
│  └─────────────────────────────┘                            │
│                                                             │
│  [↵ Enter a URL to generate]   [Download]  [Copy]          │
│                                                             │
│─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│
│                                                             │
│  $ qr-foundry --pricing                                    │
│                                                             │
│  ┌─────────────┬──────────────┬──────────────┐             │
│  │ FREE        │ PRO          │ SUBSCRIPTION │             │
│  │ $0          │ ~$15 once    │ ~$6/mo       │             │
│  ├─────────────┼──────────────┼──────────────┤             │
│  │ ✓ 9 types  │ ✓ Everything │ ✓ Everything │             │
│  │ ✓ PNG      │ ✓ SVG, PDF   │ ✓ Dynamic QR │             │
│  │ ✓ Colors   │ ✓ Logos      │ ✓ Analytics  │             │
│  │ ✓ Scanner  │ ✓ Batch CSV  │ ✓ 25 codes   │             │
│  │ ✓ 10 hist. │ ✓ Templates  │ ✓ Dashboard  │             │
│  │            │ ✓ ∞ history  │              │             │
│  └─────────────┴──────────────┴──────────────┘             │
│                                                             │
│  $ qr-foundry --install                                    │
│                                                             │
│  [Download for macOS]  [Download for Windows]  [Use Web →] │
│                                                             │
│─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│
│                                                             │
│  $ qr-foundry --blog                                       │
│                                                             │
│  [1] How to Create Branded QR Codes                        │
│  [2] Static vs Dynamic: Which Do You Need?                 │
│  [3] QR Code Sizes for Print: Complete Guide               │
│                                                             │
│  $ _                                                        │
│                                                             │
│  qr-foundry.com · github · docs · legal                    │
└─────────────────────────────────────────────────────────────┘
```

### Why it works
- **Niche appeal, strong identity.** Developers and technical users will immediately
  resonate. Non-technical users will find it intriguing and different.
- **Memorable.** Nobody else in the QR code space does this. It's instantly recognizable.
- **Information-dense.** Terminal aesthetic naturally supports dense, structured content
  without feeling cluttered.
- **Plays to the Tauri/Rust heritage.** QR Foundry is built with Tauri and Rust — the
  terminal aesthetic signals technical quality and craftsmanship.

### Visual style
- Dark background (#0D1117 or similar GitHub dark)
- Green or amber monospace text (user-configurable via a toggle?)
- Font: JetBrains Mono, Fira Code, or Berkeley Mono
- Simulated terminal prompt with blinking cursor
- ASCII-art QR code renders (as a stylistic choice, actual PNG available on download)
- Section dividers are dashed lines (terminal-style)
- Pricing table uses ASCII box-drawing characters
- Subtle scanline overlay for CRT feel (optional, very light)
- Buttons styled as terminal commands: `[↵ Enter]`, `[^C Cancel]`

### Technical notes
- Typing animation via CSS `@keyframes` + `steps()` — no JS needed for the effect
- Actual QR generator is a normal input field styled to look like a prompt
- All content is real HTML text (not images) — fully crawlable for SEO
- Syntax highlighting colors for different content types
- Dark mode only (or light mode = "light terminal" with black-on-white monospace)
- Extremely lightweight — mostly text and CSS

---

## Mockup 6: "The Gallery"

**Concept:** QR codes displayed as art pieces in a curated gallery. Each "exhibit"
showcases a different QR code type or style. Museum-style placards describe what
each code does. Elegant, minimal, premium. Makes QR codes feel like craft objects
rather than utilitarian barcodes. The page says: "QR codes can be beautiful."

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                      Q R   F O U N D R Y                    │
│                                                             │
│                 The art of the QR code.                      │
│                 Generate yours free.                         │
│                                                             │
│                      [ Enter → ]                            │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    ─── Gallery ───                           │
│                                                             │
│   ┌─────────────────┐          ┌─────────────────┐         │
│   │                 │          │                 │         │
│   │                 │          │                 │         │
│   │   ▓▓▓▓▓▓▓▓▓    │          │   ○○○○○○○○○    │         │
│   │   ▓▓▓▓▓▓▓▓▓    │          │   ○○○○○○○○○    │         │
│   │   ▓▓▓▓▓▓▓▓▓    │          │   ○○○○○○○○○    │         │
│   │   ▓▓▓▓▓▓▓▓▓    │          │   ○○○○○○○○○    │         │
│   │   ▓▓▓▓▓▓▓▓▓    │          │   ○○○○○○○○○    │         │
│   │                 │          │                 │         │
│   │─────────────────│          │─────────────────│         │
│   │ "URL"           │          │ "WiFi Network"  │         │
│   │ Square dots     │          │ Circle dots     │         │
│   │ Classic black   │          │ Ocean blue      │         │
│   │ on white        │          │ gradient        │         │
│   │                 │          │                 │         │
│   │ The essential   │          │ Share your WiFi │         │
│   │ QR code. Enter  │          │ without typing  │         │
│   │ any URL and     │          │ a password.     │         │
│   │ share it with   │          │ Guests scan,    │         │
│   │ the world.      │          │ connect.        │         │
│   └─────────────────┘          └─────────────────┘         │
│                                                             │
│   ┌─────────────────┐          ┌─────────────────┐         │
│   │                 │          │                 │         │
│   │   ◆◆◆◆◆◆◆◆◆    │          │   ▓▓▓▓▓▓▓▓▓    │         │
│   │   ◆◆◆[logo]◆   │          │   ▓▓▓▓▓▓▓▓▓    │         │
│   │   ◆◆◆◆◆◆◆◆◆    │          │   ▓▓▓▓▓▓▓▓▓    │         │
│   │                 │          │                 │         │
│   │─────────────────│          │─────────────────│         │
│   │ "Business Card" │          │ "Event"         │         │
│   │ Diamond dots    │          │ Rounded squares │         │
│   │ Brand purple    │          │ Sunset gradient │         │
│   │ with logo       │          │                 │         │
│   │                 │          │ Calendar event  │         │
│   │ A vCard QR that │          │ with all the    │         │
│   │ creates a       │          │ details. One    │         │
│   │ contact on      │          │ scan adds it    │         │
│   │ any phone.      │          │ to any calendar.│         │
│   └─────────────────┘          └─────────────────┘         │
│                                                             │
│                    ─── Create ───                            │
│                                                             │
│   ┌──────────────────────────────────────────────────┐      │
│   │                                                  │      │
│   │   Choose your type:    URL  WiFi  vCard  Phone   │      │
│   │                        Email  SMS  Geo  Calendar │      │
│   │                                                  │      │
│   │   [ Your content here                          ] │      │
│   │                                                  │      │
│   │            ┌──────────┐                          │      │
│   │            │   QR     │    Style   Color   Logo  │      │
│   │            │ Preview  │                          │      │
│   │            └──────────┘                          │      │
│   │                                                  │      │
│   │   [ Download PNG ]           Free. Always.       │      │
│   │                                                  │      │
│   └──────────────────────────────────────────────────┘      │
│                                                             │
│                    ─── Pricing ───                           │
│                                                             │
│   Free             Pro              Subscription            │
│   $0               ~$15 once        ~$6/month               │
│                                                             │
│   Everything       Everything       Everything              │
│   you need         a designer       a business              │
│   to get           needs.           needs.                  │
│   started.                                                  │
│                    SVG, PDF, batch,  Dynamic codes,          │
│   9 QR types,      custom logos,     scan analytics,         │
│   basic colors,    dot styles,       25 active codes,        │
│   PNG export.      templates.        management.             │
│                                                             │
│   [Get Started]    [Try 7 Days Free] [Subscribe]            │
│                                                             │
│                    ─── ─── ───                               │
│                                                             │
│   QR Foundry · Pricing · Blog · Download · Legal            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Why it works
- **Elevates the product.** Instead of treating QR codes as boring utility, the gallery
  frame makes them feel curated and premium. Users think "these look good" before
  they even start creating.
- **Shows, doesn't tell.** Each gallery piece IS a demonstration of a feature — different
  QR types, dot styles, colors, logos. No feature grid needed.
- **Natural exploration flow.** Gallery visitors browse at their own pace. Each piece
  teaches them something and builds desire to create their own.
- **Content marketing built-in.** Each placard is a mini SEO page — "What is a WiFi QR
  code?", "How does a vCard QR work?" — all naturally embedded.

### Visual style
- White/cream background with lots of breathing room (gallery walls)
- QR codes displayed in "frames" — subtle borders, maybe a faint shadow
- Museum placards: small, elegant typography beneath each piece
- Section dividers are simple centered dashes (─── Gallery ───)
- Typography: elegant serif for headings (Cormorant, EB Garamond), clean sans for body
- Spaced-out letter-tracking on the logo and section headers
- Color palette: mostly neutral (white, warm gray, black) with the QR codes providing color
- Hover effect on gallery pieces: subtle zoom, frame glow

### Technical notes
- Gallery QR codes are pre-rendered SVGs (no JS needed to display them)
- Each gallery piece links to a detailed page about that QR type (SEO content)
- The "Create" section is the only Astro island
- Gallery layout uses CSS grid with `auto-fit` for responsive columns
- Intersection Observer for subtle fade-in animations as pieces scroll into view
- Structured data: each gallery piece maps to a `HowTo` or `Product` schema entry
- Mobile: single column gallery, still elegant with vertical scrolling

---

## Comparison Matrix

| Aspect | Workshop | Matrix | Broadsheet | Playground | Terminal | Gallery |
|--------|----------|--------|------------|------------|----------|---------|
| **First impression** | Useful tool | Bold visual | Authoritative | Fun and playful | Technical/cool | Elegant/premium |
| **JS weight** | Low (1 island) | Low (CSS-heavy) | Minimal | Medium (physics) | Minimal | Low (1 island) |
| **SEO strength** | High (tool + text) | Medium (visual-heavy) | Very high (text-dense) | Medium (canvas) | High (text-dense) | Very high (per-type content) |
| **Mobile experience** | Good (tool stacks) | Good (dots scale) | Excellent (columns stack) | Fair (physics needs space) | Good (scrolls naturally) | Excellent (single column) |
| **Memorability** | Medium-high | Very high | High | Very high | Very high | High |
| **Time to first QR** | Instant | 1 click | 1 click + scroll | 1-2 clicks | 1 click | 2-3 clicks |
| **Target audience** | Everyone | Design-conscious | Business/professional | Everyone (viral) | Developers/technical | Design-conscious |
| **Build complexity** | Low | Low-medium | Very low | Medium-high | Low | Low-medium |

## Recommendation

These can be mixed. Some strong combinations:

- **Workshop + Gallery:** Lead with the generator (Workshop), use gallery pieces below for
  feature showcase instead of a typical feature grid.
- **Broadsheet + Terminal:** The newspaper's editorial authority with terminal-style code
  blocks for the technical details and pricing table.
- **Workshop + Playground:** The input field creates QR codes that drop into a small
  physics-enabled canvas below — functional AND fun.

The strongest standalone option for the stated goals (SEO-first, "static QR codes are free"
messaging, simple and easy) is probably **Mockup 1 (The Workshop)** or **Mockup 3 (The
Broadsheet)**, as they put the core value proposition front and center with minimal
friction and maximum crawlable content.
