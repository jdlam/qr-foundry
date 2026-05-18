---
name: ship
description: Ship new code to production for one or all QR Foundry services (app, worker, api, site) — cuts a versioned release that triggers the deploy workflow. Use when user wants to ship code, push to production, cut a release, tag a version, or run `release.sh`. Handles pre-flight checks, the release script, GitHub Release creation, deploy-workflow monitoring, and post-release docs sync.
---

# Ship a QR Foundry service to production

Cuts a versioned release (`vX.Y.Z`) for a service. The release tag triggers
the service's deploy workflow, which pushes the new build to production.

## Quick start

```
/ship <service|all> <version> [--dry-run]
```

Examples:
- `/ship app v0.3.0` — ship the desktop+web app to production
- `/ship all v0.3.0 --dry-run` — preview a coordinated release across all four services
- `/ship worker v0.2.1` — patch release of the redirect worker

## Service map

The canonical service-to-repo-to-dir mapping lives in [`plans/SERVICE_MAP.md`](../../../plans/SERVICE_MAP.md) — read it once at the start of each release and don't re-derive the table.

Root working directory: `/Users/jonathanlam/code/qr-foundry/`.
Release script: `./scripts/release.sh`.
Preflight script: `./scripts/release-preflight.sh`.

## Workflow

### 1. Parse arguments

- First arg: service (`app`, `worker`, `api`, `site`, `all`)
- Second arg: version, must match `vX.Y.Z`
- Optional `--dry-run`

If arguments are missing or malformed, print the Quick start block and stop.

### 2. Pre-flight checks (per service)

Run the preflight script — it encapsulates every check:

```
./scripts/release-preflight.sh <service> <version>
```

It validates (and dies with a clear message on the first failure):
- Working tree clean
- On `main`
- `main` in sync with `origin/main`
- `CHANGELOG.md` has a `## [X.Y.Z]` section matching the target version
- Service-specific typecheck + tests/build pass (per-service commands in [`SERVICE_MAP.md`](../../../plans/SERVICE_MAP.md))

If preflight exits non-zero, surface its message and **stop**. Never start a partial release.

### 3. Show the release plan

Before executing, surface to the user:
- Service(s) being released
- Version
- Changelog notes (extract from `CHANGELOG.md`)
- Files that will be modified (`package.json`; for `app` also `tauri.conf.json`, `Cargo.toml`, `Cargo.lock`)
- Confirm correctness before proceeding (unless `--dry-run`, in which case stop here)

### 4. Execute

```
./scripts/release.sh <service> <version>
```

The script handles:
- Bumping the version field in `package.json` (and lockfile)
- For `app`: also bumps `tauri.conf.json`, `Cargo.toml`, `Cargo.lock`
- Committing `chore: release <version>`
- Pushing `main`
- Creating a GitHub Release with changelog notes (triggers the deploy workflow)

Monitor stdout/stderr and surface any errors immediately.

### 5. Verify deployment

After the release is created:
- `gh release view <version> --repo jdlam/<repo>` — confirms the release exists
- `gh run list --repo jdlam/<repo> --limit 3` — confirms the deploy workflow was triggered

Report:
- Release URL
- Deploy workflow status (triggered / running / completed)
- Anything the user needs to act on manually (e.g., Stripe webhook secret rotation if applicable)

### 6. Post-release docs sync

This is part of the Documentation Sync Gate. Update the shared plans repo:
- `plans/PLAN.md` — bump the version + status row for the released service in the **Current Releases** table
- `CLAUDE.md` — bump the version row in the **Current Status** table
- Commit to the plans repo on a new branch: `docs: update status after <service> <version> release`
- Open a PR (the plans repo never accepts direct pushes to main)

### 7. Summary

Report:
- Release URL
- Deploy status
- Docs PR URL
- Next steps (e.g., "monitor the deploy run", "verify production smoke test", "rotate any flagged secrets")

## Coordinated `all` release

When service is `all`:
1. Run `./scripts/release-preflight.sh <service> <version>` for **every** service. If any fails, report all failures and stop — do not partially release.
2. Show a combined release plan.
3. Release each service sequentially in the order documented in [`SERVICE_MAP.md`](../../../plans/SERVICE_MAP.md) (`api → worker → site → app`).
4. After all services release, do a single combined docs sync PR.

## Aborting

If anything fails mid-release:
- Do **not** silently continue.
- Report exactly which step failed and what the user needs to do (e.g., "revert the version bump commit before retrying").
- Never try to "fix forward" through a half-released state without explicit user authorization.
