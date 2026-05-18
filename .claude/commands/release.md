---
name: release
description: Cut a release for one or all QR Foundry services
argument-hint: <service|all> <version> [--dry-run]
allowed-tools: [Read, Glob, Grep, Bash, Edit, Write]
---

# Release

Cut a release for a QR Foundry service (or all services).

## Arguments

The user provided: $ARGUMENTS

Parse the arguments:
- First arg: service name (`app`, `worker`, `api`, `site`, `all`)
- Second arg: version (e.g. `v0.3.0`) — must match `vX.Y.Z` format
- Optional `--dry-run`: show what would happen without making changes

If arguments are missing or invalid, show usage:
```
/release <service|all> <version> [--dry-run]

Services: app, worker, api, site, all
Version:  vX.Y.Z (e.g. v0.3.0)

Examples:
  /release app v0.3.0
  /release all v0.3.0 --dry-run
  /release worker v0.2.1
```

## Service directory mapping

| Service | Directory | Repo |
|---------|-----------|------|
| app | qr-foundry-app | jdlam/qr-foundry-app |
| worker | qr-foundry-worker | jdlam/qr-foundry-worker |
| api | qr-foundry-api | jdlam/qr-foundry-api |
| site | qr-foundry-site | jdlam/qr-foundry-site |

The root working directory is `/Users/jonathanlam/code/qr-foundry/`.
The release script is at `./scripts/release.sh`.

## Steps

### 1. Pre-flight checks

For the target service(s), `cd` into the service directory and verify:

1. **Clean working tree**: `git status --porcelain` must be empty. If dirty, report and stop.
2. **On main branch**: `git rev-parse --abbrev-ref HEAD` must be `main`. If not, report and stop.
3. **Up to date**: `git pull origin main` to ensure we have the latest.
4. **Tests pass**: Run the service's test suite:
   - app: `npm run typecheck && npm run test`
   - worker: `npm run typecheck && npm run test`
   - api: `bun run typecheck && bun run test`
   - site: `npm run typecheck && npm run build`
5. **Changelog exists**: Check that `CHANGELOG.md` has a `## [X.Y.Z]` section (without the `v` prefix) for the target version. If missing, report and stop — the user needs to write the changelog entry first.

If any check fails, report the failure clearly and stop. Do not proceed with a partial release.

### 2. Show release plan

Before executing, show the user what will happen:
- Service(s) being released
- Version number
- Changelog notes (extracted from CHANGELOG.md)
- Files that will be modified (package.json, and for app: tauri.conf.json, Cargo.toml, Cargo.lock)
- Confirm this is correct before proceeding (unless --dry-run)

For `--dry-run`, show the plan and stop here.

### 3. Execute release

Run the release script:
```bash
./scripts/release.sh <service> <version>
```

This script handles:
- Bumping version in package.json (and package-lock.json)
- For app: also bumps tauri.conf.json, Cargo.toml, Cargo.lock
- Committing: `chore: release <version>`
- Pushing to main
- Creating a GitHub Release with changelog notes

Monitor the output and report any errors.

### 4. Verify deployment

After the release is created:

1. Check that the GitHub Release was created:
   ```
   gh release view <version> --repo jdlam/<repo>
   ```

2. Check that the deploy workflow was triggered:
   ```
   gh run list --repo jdlam/<repo> --limit 3
   ```

3. Report the status:
   - Release URL
   - Deploy workflow status (triggered/running/completed)
   - Any action needed from the user

### 5. Post-release documentation sync

Update the shared plans docs:
- `plans/PLAN.md` — update the version and status for the released service in the Current Status table
- Commit to plans repo: `docs: update status after <service> <version> release`

### 6. Summary

Report:
- Release created (link)
- Deploy status
- Documentation updated
- Next steps (e.g., "monitor the deploy workflow", "verify production")

## For `all` releases

When service is `all`:
1. Run pre-flight for ALL services first. If any fail, report all failures and stop.
2. Show a combined release plan.
3. Release each service sequentially: api, worker, site, app (this order minimizes dependency issues).
4. Report combined results.
