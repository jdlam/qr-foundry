---
name: doc-drift
description: Detect drift between shared planning docs (plans/*, CLAUDE.md, FEATURES.md) and the actual state of QR Foundry service repos. Use when the user asks to "check doc drift", "are the docs in sync", "find stale planning entries", or before opening a PR that touches shipped features. Goes beyond the bash pre-commit hook by cross-referencing FEATURES.md matrix rows against recent merged PRs in each service repo.
---

# Doc Drift Detection

## What this skill is for

The repo already has two layers of doc-drift safety:

1. **`scripts/check-doc-drift.sh`** — fast regex check for known stale phrases (e.g. "Stack: TBD"). Fires automatically via the PostToolUse hook on edits to `plans/**`.
2. **This skill** — slower, smarter check. Compares the `[ ]`/`[~]`/`[x]` matrix rows in `plans/architecture/FEATURES.md` against actual git/PR state across the four service repos.

Use the skill when the hook isn't enough — e.g., when you suspect features shipped without their matrix rows getting flipped.

## Quick start

Just say "check doc drift" or invoke `/doc-drift`. The skill will:

1. Run the bash regex check first (cheap; if it fails, surface the violations and stop).
2. For each service, list recently-merged PRs since the last status bump.
3. Walk `FEATURES.md` for `[ ]` and `[~]` rows that mention the corresponding service.
4. Report rows that look stale, with concrete suggestions: the PR that shipped it, the file/line in `FEATURES.md` to update.

## Service map

See [`plans/SERVICE_MAP.md`](../../../plans/SERVICE_MAP.md) for the canonical mapping (FEATURES.md annotation → repo → local dir). Don't re-derive — load that file at the start of a drift check.

## Workflow

### 1. Run the cheap check first

```
./scripts/check-doc-drift.sh
```

If it exits non-zero, surface the matches and stop. The user must fix the obvious patterns before the smarter pass is useful.

### 2. Find recent activity per service

For each service, list merged PRs since the last "Phases X-Y complete" status row was bumped. The last bump can usually be inferred from `git log plans/PLAN.md` — find the most recent commit that touched the service's status row.

```
gh pr list --repo jdlam/<repo> --state merged --search "merged:>=<date>" --limit 20 --json number,title,mergedAt,labels
```

Read each PR's title — feature PRs (typically prefixed `feat:` or `feat(...):`) are the ones that should have a corresponding `[x]` somewhere in `FEATURES.md`.

### 3. Walk FEATURES.md

Parse `plans/architecture/FEATURES.md` for matrix rows. The format is roughly:

```
| Feature name | DesktopYes/No | WebYes/No | [x] |
```

And lower in the file, bulleted lists like:

```
- [x] Some shipped feature (Service)
- [ ] Some planned feature (Service)
```

For each `[ ]` and `[~]` row that mentions a service, cross-reference against that service's recent merged PRs. If a PR title strongly suggests the row should be flipped, mark it as drift.

### 4. Report

For each detected drift item, output:

```
DRIFT: <row excerpt from FEATURES.md>
  File: plans/architecture/FEATURES.md:<line>
  Service: <service>
  Suggested by: PR #<number> "<title>" (merged <date>)
  Suggested edit: change `[ ]` → `[x]` (or `[~]` → `[x]`)
```

Group by service. If nothing drifted, say so explicitly — silence is ambiguous.

### 5. Don't auto-fix

Surface findings as suggestions. Let the user (or a follow-up turn) decide whether to flip rows, because:
- A merged PR might only partially implement a row (so `[~]` is correct, not `[x]`)
- A merged PR might span multiple matrix rows
- Some matrix rows are aspirational/composite and don't map 1:1 to a single PR

Always include the PR title in your suggestion so the user can verify the mapping themselves.

## What NOT to do

- **Don't replace the bash hook.** The regex check is fast enforcement that fires automatically; this skill is slow, on-demand reasoning. Both have a job.
- **Don't grep service repos for code patterns to "prove" a feature ships.** That's how false positives sneak in. PR titles + the implementer's commit message are the ground truth signal.
- **Don't flip matrix rows without user confirmation.** Always present findings as suggestions.
- **Don't skim — actually read each candidate PR's description** before claiming a row is drifted. Many PRs touch shared files without implementing new matrix rows.

## When the bash check is enough

You don't need this skill for:
- A PR that doesn't touch `plans/**`
- A docs-only PR where the author already updated `FEATURES.md`
- Cosmetic edits to a service repo (lint, dep bumps, refactors)

Use the skill when shipping a feature, before opening a release-time docs-sync PR, or when status snapshots in `PLAN.md` / `CLAUDE.md` feel out of date.
