---
name: merge-pr
description: Review, merge a PR, and handle post-merge documentation sync
argument-hint: <pr-url-or-number> [--repo <service>]
allowed-tools: [Read, Glob, Grep, Bash, Agent, Edit, Write]
---

# Merge PR

Merge a pull request after a final review, then handle post-merge documentation sync.

## Arguments

The user provided: $ARGUMENTS

Parse the arguments:
- First arg: PR URL (e.g. `https://github.com/jdlam/qr-foundry-app/pull/48`) or PR number
- Optional `--repo <service>`: one of `app`, `worker`, `api`, `site`, `plans`. If omitted, infer from the URL or ask.

## Service directory mapping

| Service | Directory | Repo |
|---------|-----------|------|
| app | qr-foundry-app | jdlam/qr-foundry-app |
| worker | qr-foundry-worker | jdlam/qr-foundry-worker |
| api | qr-foundry-api | jdlam/qr-foundry-api |
| site | qr-foundry-site | jdlam/qr-foundry-site |
| plans | . (root) | jdlam/qr-foundry-plans |

The root working directory is `/Users/jonathanlam/code/qr-foundry/`.

## Steps

### 1. Fetch PR details

```
gh pr view <number> --repo <owner/repo> --json title,body,state,mergeable,headRefName,baseRefName,statusCheckRollup,reviews,url
```

- If the PR is already merged or closed, report that and stop.
- If CI checks are failing, report which checks failed and stop (do not merge with failing CI).
- Show the PR title, branch, and status to the user.

### 2. Quick review

Run `gh pr diff <number> --repo <owner/repo>` and do a fast sanity check:
- Are there any obvious issues (security, correctness, missing tests)?
- Does the change match the PR description?
- If there are concerns, report them and ask the user before proceeding.

### 3. Merge

```
gh pr merge <number> --repo <owner/repo> --squash --delete-branch
```

Use squash merge by default. If the PR has multiple meaningful commits that should be preserved, use `--merge` instead and explain why.

### 4. Post-merge: Documentation sync

After merging, check if the shared plans docs need updating per the Documentation Sync Gate in CLAUDE.md:

1. Read the diff that was merged. Does it change any features, API contracts, architecture, or service status?
2. If yes, update the relevant files:
   - `plans/architecture/FEATURES.md` — check off completed features `[x]`, mark partials `[~]`
   - `plans/services/<service>.md` — check off completed items in the relevant phase
   - `plans/PLAN.md` — update status if a milestone changed
   - `plans/architecture/ARCHITECTURE.md` — update if contracts/architecture changed
3. If documentation updates are needed, commit them to the plans repo on main with message: `docs: sync after merging <repo>#<number>`
4. If no doc updates are needed, say so with a one-line reason.

### 5. Report

Summarize:
- PR merged (link)
- Branch deleted
- Doc sync status (updated / not needed)
- Suggest if a release should be cut (check changelog and commits since last release)
