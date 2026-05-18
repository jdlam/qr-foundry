#!/usr/bin/env bash
# Run release preflight checks for one QR Foundry service.
#
# Usage: ./scripts/release-preflight.sh <service> <version>
#   service: api | worker | site | app
#   version: vX.Y.Z (e.g. v0.3.0)
#
# Checks performed (in order):
#   1. Args parse cleanly
#   2. Service directory exists
#   3. Working tree is clean
#   4. Currently on `main`
#   5. main is up to date with origin
#   6. CHANGELOG.md contains a `## [X.Y.Z]` section matching the target version
#   7. Service-specific typecheck + tests pass
#
# Exits 0 if everything passes, non-zero with a clear message otherwise.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./lib.sh
source "$SCRIPT_DIR/lib.sh"

usage() {
  cat <<EOF
Usage: $(basename "$0") <service> <version>

  service: api | worker | site | app
  version: vX.Y.Z (e.g. v0.3.0)
EOF
}

if [[ $# -ne 2 ]]; then
  usage
  exit 2
fi

SERVICE="$1"
VERSION="$2"

validate_version "$VERSION"
VERSION_NO_V="${VERSION#v}"

SVC_DIR="$(service_dir "$SERVICE")" || die "Unknown service: $SERVICE (expected: api, worker, site, or app)"
SVC_PATH="$ROOT_DIR/$SVC_DIR"
[[ -d "$SVC_PATH" ]] || die "Service directory not found: $SVC_PATH"

cd "$SVC_PATH"

info "Preflight: $SERVICE $VERSION (in $SVC_DIR)"

# 1. Clean working tree
if [[ -n "$(git status --porcelain)" ]]; then
  git status --short
  die "Working tree is not clean in $SVC_DIR — commit or stash first"
fi

# 2. On main
CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [[ "$CURRENT_BRANCH" != "main" ]]; then
  die "Must be on main to release (currently on $CURRENT_BRANCH)"
fi

# 3. Up to date with origin/main
info "Fetching origin..."
git fetch origin --quiet
LOCAL_HEAD="$(git rev-parse HEAD)"
REMOTE_HEAD="$(git rev-parse origin/main)"
if [[ "$LOCAL_HEAD" != "$REMOTE_HEAD" ]]; then
  die "Local main is not in sync with origin/main — pull first"
fi

# 4. Changelog entry exists for the target version
CHANGELOG="$SVC_PATH/CHANGELOG.md"
[[ -f "$CHANGELOG" ]] || die "CHANGELOG.md not found in $SVC_DIR"
if ! grep -qE "^## \[$VERSION_NO_V\]" "$CHANGELOG"; then
  die "CHANGELOG.md is missing a '## [$VERSION_NO_V]' section — write the release notes first"
fi

# 5. Service-specific tests
info "Running typecheck + tests for $SERVICE..."
case "$SERVICE" in
  app)
    npm run typecheck
    npm run test
    ;;
  worker)
    npm run typecheck
    npm run test
    ;;
  api)
    bun run typecheck
    bun run test
    ;;
  site)
    npm run typecheck
    npm run build
    ;;
  *)
    die "Unhandled service in test phase: $SERVICE"
    ;;
esac

info "Preflight passed for $SERVICE $VERSION"
