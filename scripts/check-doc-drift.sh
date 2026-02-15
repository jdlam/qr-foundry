#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

DOC_FILES=(
  "$ROOT_DIR/plans/PLAN.md"
  "$ROOT_DIR/plans/architecture/ARCHITECTURE.md"
  "$ROOT_DIR/plans/architecture/FEATURES.md"
  "$ROOT_DIR/plans/services/billing-api.md"
  "$ROOT_DIR/CLAUDE.md"
)

PATTERNS=(
  "Stack: TBD"
  "does not exist yet"
  "shared bearer token"
  "Phase 7 \\(deploy\\) pending"
  "Signup \\(with auto Pro trial\\)"
  "Quota writes to Worker KV.*\\[ \\]"
  "Landing page with embedded QR generator.*\\[ \\]"
  "Custom domain .*qrfo\\.link.*\\[ \\]"
  "Custom domain .*api\\.qr-foundry\\.com.*\\[ \\]"
)

echo "Checking docs for known drift patterns..."

has_failures=0
for pattern in "${PATTERNS[@]}"; do
  if rg -n "$pattern" "${DOC_FILES[@]}" >/tmp/doc_drift_match.txt 2>/dev/null; then
    has_failures=1
    echo
    echo "Found disallowed pattern: $pattern"
    cat /tmp/doc_drift_match.txt
  fi
done

rm -f /tmp/doc_drift_match.txt

if [[ "$has_failures" -eq 1 ]]; then
  echo
  echo "Doc drift check failed."
  exit 1
fi

echo "Doc drift check passed."
