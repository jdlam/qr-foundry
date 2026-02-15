# Documentation Sync Workflow

Use this workflow whenever implementation or strategy changes.

## Required updates per change

1. `architecture/FEATURES.md`
   - Update `[x]`, `[~]`, `[ ]` markers for any affected feature.
   - Update wording if behavior/tiers changed.
2. `services/<service>.md`
   - Update phase checklist items and notes for the service changed.
3. `PLAN.md`
   - Update service status text when a phase/milestone state changed.
4. `architecture/ARCHITECTURE.md`
   - Update system contracts, auth/flow assumptions, environment config, and deployment notes.

## Drift prevention rules

1. Strategy updates and implementation updates must include docs updates in the same change.
2. If docs are intentionally unaffected, include: `Docs impact: none (<reason>)` in PR/commit message.
3. Do not leave stale placeholders (`TBD`, "does not exist yet", old tier names) after shipping.

## Quick review checklist (before merge)

1. Any new endpoint or payload shape reflected in `ARCHITECTURE.md`?
2. Any feature status changed reflected in `FEATURES.md`?
3. Any phase completion reflected in `services/*.md` + `PLAN.md`?
4. Any environment/domain/port change reflected in `ARCHITECTURE.md`?
5. Run `./scripts/check-doc-drift.sh` from repo root and resolve any failures.
