# QR Foundry Marketing Site — Implementation Plan

**Repo:** `qr-foundry-site`
**Service:** Marketing site at `qr-foundry.com`
**Design:** Mockup #9 ("The Foundry Toggle") — blends Workshop + Matrix with dark/light toggle
**Stack:** Astro + React islands + Tailwind CSS v4 + MDX + Cloudflare Pages

## Overview

The marketing site is the public-facing landing page for QR Foundry. It explains the product, showcases features, displays pricing, and directs users to download the desktop app or use the web app.

The landing page IS the product — visitors land on a fully functional QR generator and can create and download a QR code before reading a single word of marketing copy.

For system-wide architecture, see [`ARCHITECTURE.md`](../architecture/ARCHITECTURE.md).
For design reference, see `qr-foundry-site/mockups/9-foundry-toggle.html`.

---

## Phase 1: Scaffold + Landing Page

**Goal:** A polished, functional landing page that lets visitors generate QR codes and drives downloads/signups.

### Scaffold

- [x] Initialize Astro project with TypeScript
- [x] Configure Tailwind CSS v4
- [x] Configure Biome for linting/formatting
- [x] Set up React integration (`@astrojs/react`) for interactive islands
- [x] Set up base layout (`BaseLayout.astro`) with `<head>`, nav, footer
- [x] Add Inter + JetBrains Mono fonts (Google Fonts CDN with preconnect for now; self-hosted woff2 is a follow-up)

### Dark/Light Theme System

- [x] CSS custom properties for all colors via `:root` and `[data-theme="dark"]` (~65 variables)
- [x] Inline `<script>` in `<head>` (before paint) to detect system preference via `prefers-color-scheme: dark` and apply `data-theme` — prevents flash of wrong theme
- [x] Fall back to `localStorage` (`qrf-theme`) if user has previously toggled
- [x] Theme toggle button in nav (moon/sun icons) that persists preference to `localStorage`
- [x] Respect `prefers-reduced-motion` — disable transitions/animations when set

### Landing Page Sections

- [x] **Nav** — logo, Pricing link, Blog link, dark/light toggle
- [x] **Dot matrix background** — animated canvas (from mockup #9 Matrix aesthetic)
  - Throttle to ~30fps instead of 60 to save battery
  - Only animate dots in the viewport (skip off-screen rows)
  - Pause animation when tab is hidden (`document.hidden`)
  - On mobile (< 768px): use a static CSS dot pattern instead of canvas animation
  - QR finder-eye corner decorations
- [x] **Hero: Working QR Generator** (React island, `client:load`)
  - Text input for URL/text content
  - Live QR code preview (renders real, scannable QR codes using `qr-code-styling`)
  - Color picker with keyboard-accessible hex input fallback
  - Dot style selector (square, rounded, dots, classy, extra-rounded)
  - Finder patterns match selected dot style
  - Download PNG button (actually downloads a real PNG)
  - Copy to clipboard button
  - Generator card "punches through" the dot matrix background
  - `aria-live` region so screen readers announce when QR code updates
- [x] **Tagline** — "Free. No signup. No watermark."
- [x] **Scroll hint** — "Scroll for more" with animated arrow, fades on scroll
- [x] **Two-column scroll section** (sticky generator left, content panels right)
  - Scroll-reveal animations via IntersectionObserver
  - Skip animations when `prefers-reduced-motion` is set (show panels immediately)
  - **Features panel** — highlight that everything is free (all QR types, SVG/PDF export, logos, batch, templates), CTAs: "Get the desktop app" + **"Try in browser"** (links to `app.qr-foundry.com`)
  - **Dynamic panel** — feature list (change destinations, scan analytics, dashboard, 25 codes), CTA: "Start subscription — $6/mo or $60/yr"
- [x] **Social proof section** — between hero and upsell panels
  - "X QR codes generated" counter (placeholder numbers for now)
  - Short testimonial quotes (placeholder)
  - Product Hunt badge / App Store rating (when available)
- [x] **Compact pricing comparison** — above footer, side-by-side Free / Subscription tiers (Pro tier removed, pricing simplified)
- [x] **Blog teasers** — 3 hardcoded blog post cards above footer (placeholder until blog infra in Phase 3)
- [x] **Footer** — logo, nav links (Pricing, Blog, Download, Legal), copyright

### Responsive Design

- [x] Mobile (< 768px): single column, sticky generator hidden, canvas replaced with CSS dots
- [x] Tablet (768-1024px): two-column with smaller sticky generator
- [x] Desktop (> 1024px): full two-column layout per mockup

### SEO Foundations (built-in from day one)

- [x] Unique `<title>` and `<meta name="description">` per page
- [x] OpenGraph and Twitter Card meta tags (OG image placeholder — designed OG image is a follow-up)
- [x] Structured data (JSON-LD): `SoftwareApplication` on landing page, `WebSite` with `SearchAction`
- [x] Semantic HTML throughout (`<main>`, `<article>`, `<section>`, `<nav>`, `<header>`, `<footer>`)
- [x] Single `<h1>` per page, proper heading hierarchy (no skipped levels)
- [x] All images have descriptive `alt` text
- [x] Canonical URLs on all pages
- [x] `robots.txt` in `public/`

### Analytics

- [ ] Set up privacy-friendly analytics (Plausible or Fathom)

**Exit criteria:** Landing page is live with a working QR generator, compelling copy, social proof, compact pricing, blog teasers, and working CTAs. Lighthouse score 95+ on all metrics. Dark/light mode works correctly with system detection.

---

## Phase 2: Pricing Page

**Goal:** Clear pricing comparison that converts visitors to customers.

- [x] Build dedicated `/pricing` page with full-width pricing comparison table:
  - **Free** — $0, everything included, CTA: "Get Started Free" (links to generator or app)
  - **Subscription** — $6/month or $60/year, dynamic codes + analytics, CTA: "Start Subscription"
  - **Add-on** — +$3/month or +$30/year per 25 extra codes, shown as upgrade option
- [ ] Monthly/annual toggle on pricing page
- [x] FAQ section (common questions about dynamic codes, what happens on cancel, refund policy, etc.)
  - Structured data: `FAQPage` schema for FAQ section
- [x] CTAs that link to:
  - Desktop: Mac App Store / Microsoft Store / download pages
  - Web: `app.qr-foundry.com` (direct to signup) — **always offer "Try in browser" as an option**
- [x] Add-on mention for power users who need more dynamic code slots
- [ ] Structured data: `Product` with `Offer` for each tier
- [ ] OG image specific to pricing page

**Exit criteria:** Visitors can clearly understand what each tier includes and how to purchase. Page ranks for "QR code generator pricing" searches.

---

## Phase 3: SEO + Blog

**Goal:** Organic traffic from search engines via content marketing.

### Blog Infrastructure

- [ ] Set up Astro Content Collections for blog posts (MDX)
- [x] Blog index page at `/blog`
- [ ] Individual post pages at `/blog/[slug]`
- [ ] Blog layout with reading time, published date, author
- [ ] RSS feed via `@astrojs/rss`
- [ ] Sitemap via `@astrojs/sitemap`

### Initial SEO Articles (3-5)

- [ ] "How to Create Branded QR Codes" (target: branded QR code generator)
- [ ] "QR Code Sizes for Print: Complete Guide" (target: QR code print size)
- [ ] "Static vs Dynamic QR Codes: Which Do You Need?" (target: dynamic QR code)
- [ ] "Best QR Code Generators for Mac in 2026" (target: QR code generator mac)
- [ ] "How to Add a Logo to Your QR Code" (target: QR code with logo)

### Technical SEO

- [x] Sitemap.xml (static sitemap-index.xml shipped; auto-generated blog sitemap pending)
- [ ] OpenGraph / Twitter Card meta tags on every blog post
- [ ] Structured data: `Article` / `BlogPosting` on blog posts
- [ ] Internal links from blog posts back to landing page and pricing page
- [ ] Blog teasers on landing page auto-update from content collections

### Search Console

- [ ] Set up Google Search Console
- [ ] Submit sitemap
- [ ] Monitor indexing and search performance

**Exit criteria:** Blog posts are indexed and receiving organic traffic. Site appears in search results for target keywords.

---

## Phase 4: Deployment

**Goal:** Site is live at `qr-foundry.com` with CI/CD.

- [x] Deploy to Cloudflare Workers (static assets)
- [x] Set up CI/CD via GitHub Actions (`wrangler deploy` on merge to main)
- [x] Set up preview environment (`wrangler deploy --env preview` on PRs)
- [x] Configure `qr-foundry.com` DNS (transfer nameservers to Cloudflare)
- [x] Set up SSL (automatic with Cloudflare)
- [ ] Set up uptime monitoring
- [~] Configure redirects:
  - `www.qr-foundry.com` -> `qr-foundry.com`
  - `/app` -> `app.qr-foundry.com` (implemented as site route forwarding page)
  - `/download` -> appropriate store links (implemented as site route with web + release links)

### Manual steps (requires action outside IDE)

- [x] **Register domain** `qr-foundry.com` (on Squarespace)
- [x] **Transfer nameservers** to Cloudflare
- [x] **Add custom domain** in Cloudflare Workers settings
- [ ] **Set up analytics account** (Plausible or Fathom)
- [ ] **Submit to Google Search Console**

**Exit criteria:** `qr-foundry.com` is live, fast, and indexed by search engines.

---

## Tech Stack Summary

| Layer | Choice |
|-------|--------|
| Framework | Astro (static-first, islands architecture) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Interactive islands | React (QR generator, theme toggle) |
| QR generation | `qr-code-styling` (same library as the app) |
| Content/Blog | Astro Content Collections + MDX |
| Linting | Biome |
| Deployment | Cloudflare Workers (static assets) via GitHub Actions |
| Analytics | Plausible or Fathom |
| Fonts | Inter (body) + JetBrains Mono (headings/labels) |

## Design Reference

- **Mockup #9** ("The Foundry Toggle"): `qr-foundry-site/mockups/9-foundry-toggle.html`
- Blends Workshop (Mockup 1) + Matrix (Mockup 2) aesthetics
- Full dark/light theme with system detection + manual toggle
- Animated dot matrix canvas background with QR finder-eye decorations
- Hero section IS the QR generator (zero friction)
- Scroll-to-upsell two-column layout (sticky generator + content panels)
- Amber accent color (#f59e0b), Inter + JetBrains Mono typography
