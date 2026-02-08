# QR Foundry Marketing Site — Implementation Plan

**Repo:** `qr-foundry-site`
**Service:** Marketing site at `qr-foundry.com`

## Overview

The marketing site is the public-facing landing page for QR Foundry. It explains the product, showcases features, displays pricing, and directs users to download the desktop app or use the web app.

For system-wide architecture, see [`ARCHITECTURE.md`](../architecture/ARCHITECTURE.md).

---

## Phase 1: Scaffold + Landing Page

**Goal:** A polished landing page that explains QR Foundry and drives downloads/signups.

- [ ] Choose framework (Astro, Next.js, or similar static site generator)
- [ ] Initialize repo with TypeScript, linting (Biome), basic CI
- [ ] Design and build landing page sections:
  - **Hero** — headline, subheadline, CTA buttons (Download / Try in Browser), hero image or interactive QR preview
  - **Feature showcase** — grid of key features with icons/screenshots (customization, export formats, batch, scanner, dynamic codes, analytics)
  - **Live interactive demo** — embedded QR generator that lets visitors create a basic QR code (Free-tier features, no account needed)
  - **Social proof** — testimonials, Product Hunt badge, App Store rating (when available)
  - **Footer** — links, legal, social media
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Set up basic analytics (Plausible, Fathom, or similar privacy-friendly)

**Exit criteria:** Landing page is live with compelling copy, feature showcase, and working CTAs.

---

## Phase 2: Pricing Page

**Goal:** Clear pricing comparison that converts visitors to customers.

- [ ] Build pricing comparison table:
  - **Free** — $0, basic features, CTA: "Get Started"
  - **Pro** — ~$15 one-time, full features, CTA: "Buy Pro"
  - **Subscription** — ~$6/month, dynamic codes + analytics, CTA: "Start Subscription"
- [ ] Highlight the 7-day Pro trial ("Try Pro free for 7 days")
- [ ] FAQ section (common questions about tiers, what happens after trial, etc.)
- [ ] CTAs that link to:
  - Desktop: Mac App Store / Microsoft Store / Gumroad download pages
  - Web: `app.qr-foundry.com` (direct to signup)
- [ ] Add-on mention for power users who need more dynamic code slots

**Exit criteria:** Visitors can clearly understand what each tier includes and how to purchase.

---

## Phase 3: SEO + Blog

**Goal:** Organic traffic from search engines via content marketing.

- [ ] Set up blog/content section
- [ ] Write initial SEO articles (3-5):
  - "How to Create Branded QR Codes" (target: branded QR code generator)
  - "QR Code Sizes for Print: Complete Guide" (target: QR code print size)
  - "Static vs Dynamic QR Codes: Which Do You Need?" (target: dynamic QR code)
  - "Best QR Code Generators for Mac in 2026" (target: QR code generator mac)
  - "How to Add a Logo to Your QR Code" (target: QR code with logo)
- [ ] Technical SEO:
  - Sitemap.xml
  - robots.txt
  - OpenGraph / Twitter Card meta tags
  - Structured data (Product, SoftwareApplication)
- [ ] Set up Google Search Console

**Exit criteria:** Blog posts are indexed and receiving organic traffic. Site appears in search results for target keywords.

---

## Phase 4: Deployment

**Goal:** Site is live at `qr-foundry.com` with CI/CD.

- [ ] Deploy to Vercel or Cloudflare Pages
- [ ] Configure `qr-foundry.com` DNS
- [ ] Set up SSL (automatic with Vercel/Cloudflare)
- [ ] Set up CI/CD (auto-deploy on push to main)
- [ ] Set up uptime monitoring
- [ ] Configure redirects:
  - `www.qr-foundry.com` -> `qr-foundry.com`
  - `/app` -> `app.qr-foundry.com`
  - `/download` -> appropriate store links

### Manual steps (requires action outside IDE)

- [ ] **Register domain** `qr-foundry.com` (if not already done)
- [ ] **Configure DNS** — point to Vercel/Cloudflare Pages
- [ ] **Set up analytics account** (Plausible, Fathom, etc.)
- [ ] **Submit to Google Search Console**

**Exit criteria:** `qr-foundry.com` is live, fast, and indexed by search engines.
