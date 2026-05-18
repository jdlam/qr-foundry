# Service Map

Canonical mapping of QR Foundry's four services to their repos, directories, domains, and conventional annotations. Reference this file from CLAUDE.md, skills, scripts, and documentation instead of duplicating the table.

| Service key | Local dir (sibling to this repo) | GitHub repo | Production domain | Runtime | FEATURES.md annotation |
|---|---|---|---|---|---|
| `app` | `qr-foundry-app` | [`jdlam/qr-foundry-app`](https://github.com/jdlam/qr-foundry-app) | downloadable / `app.qr-foundry.com` | Tauri (desktop) + Cloudflare Workers static assets (web) | `(App)` or `(Desktop App)` |
| `worker` | `qr-foundry-worker` | [`jdlam/qr-foundry-worker`](https://github.com/jdlam/qr-foundry-worker) | `qrfo.link` | Cloudflare Worker | `(Worker)` |
| `api` | `qr-foundry-api` | [`jdlam/qr-foundry-api`](https://github.com/jdlam/qr-foundry-api) | `api.qr-foundry.com` | Cloudflare Worker (Hono + D1 + Bun toolchain) | `(Billing API)` |
| `site` | `qr-foundry-site` | [`jdlam/qr-foundry-site`](https://github.com/jdlam/qr-foundry-site) | `qr-foundry.com` | Astro (Cloudflare Workers static assets) | `(Site)` or `(Marketing Site)` |

## Toolchain per service

| Service | Package manager | Typecheck command | Test/build command |
|---|---|---|---|
| `app` | `npm` | `npm run typecheck` | `npm run test` |
| `worker` | `npm` | `npm run typecheck` | `npm run test` |
| `api` | `bun` | `bun run typecheck` | `bun run test` |
| `site` | `npm` | `npm run typecheck` | `npm run build` (no unit tests; build is the gate) |

`scripts/release-preflight.sh <service> <version>` encapsulates the typecheck+test/build calls per service — prefer calling it over running the commands inline.

## Release order (for coordinated `all` releases)

Sequential, in this order, to minimize cross-service contract churn:

1. `api` — billing/auth is foundational
2. `worker` — depends on api auth contracts
3. `site` — independent (marketing only, no runtime deps)
4. `app` — depends on api + worker contracts

See [`services/<service>.md`](services/) for per-service implementation plans, and [`PLAN.md`](PLAN.md) for the current release/version status snapshot.

## Adding a new service

If you ever add a fifth service:

1. Add a row to both tables above.
2. Update `scripts/lib.sh` — the `service_dir()` case statement and the `ALL_SERVICES` list.
3. Update `scripts/release-preflight.sh` — add the new service to the typecheck/test case statement.
4. Add a per-service plan at `plans/services/<name>.md`.
5. Update `PLAN.md` (Per-Service Plans and Current Releases tables) and root `CLAUDE.md` (Repository Map and Current Status tables).
6. Update the FEATURES.md service-annotation legend if the new service introduces a new `(...)` tag.

That last step is what makes this file load-bearing: keep it in sync and the other docs can reference instead of duplicating.
